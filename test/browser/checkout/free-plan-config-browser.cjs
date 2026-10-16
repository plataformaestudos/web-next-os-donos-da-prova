const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loadChromium, artifactsPath } = require('./support.cjs');
const origin = 'http://localhost:3137';
const fixture = 'http://127.0.0.1:4029';
const freeA = '44444444-4444-4444-8444-444444444444';
const freeB = '66666666-6666-4666-8666-666666666666';
const essential = '11111111-1111-4111-8111-111111111111';
const semiannual = '33333333-3333-4333-8333-333333333333';
const artifacts = artifactsPath('free-plan-config');
const results = [];
fs.mkdirSync(artifacts, { recursive: true });
const configure = body => fetch(`${fixture}/__fixture/config`, { method: 'POST', body: JSON.stringify(body) });
async function choose(page, label, option) {
  await page.getByLabel(label, { exact: true }).focus();
  await page.getByLabel(label, { exact: true }).press('ArrowDown');
  await page.locator('.ant-select-dropdown:visible .ant-select-item-option-content').filter({ hasText: new RegExp(`^${option}$`) }).click();
  await page.locator('.ant-select-dropdown:visible').waitFor({ state: 'hidden' });
}
(async () => {
  const browser = await loadChromium().launch({ headless: true,
    ...(process.env.ODP_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.ODP_CHROMIUM_EXECUTABLE_PATH } : {}),
  });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 1440]) {
      await configure({ mode: 'admin', resetOffers: true });
      const context = await browser.newContext({ viewport: { width, height: 1000 } });
      await context.addCookies([{ name: 'access_token', value: 'local-fixture-only', url: origin, httpOnly: true }]);
      await context.addInitScript(theme => { localStorage.setItem('theme', theme); localStorage.setItem('cookie-consent', 'rejected'); }, theme);
      await context.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.setDefaultTimeout(30000);
      try {
        await page.goto(`${origin}/plans/${freeA}`, { waitUntil: 'networkidle' });
        await page.getByText('Sugestão ao atingir os limites do Free', { exact: true }).waitFor();
        await choose(page, 'Plano sugerido', 'Plano Semestral');
        await page.getByRole('button', { name: 'Salvar', exact: true }).click();
        await page.getByRole('alert').filter({ hasText: 'Selecione um plano disponível' }).waitFor();
        assert(new URL(page.url()).pathname.endsWith(`/${freeA}`), 'Ciclo obrigatório ao escolher plano');
        await choose(page, 'Ciclo apresentado', 'Semestral');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Formulário deve caber na tela');
        await page.locator('#upgrade-plan').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${artifacts}/admin-${theme}-${width}.png`, fullPage: true });
        await page.getByRole('button', { name: 'Salvar', exact: true }).click();
        await page.waitForURL(/\/(plans|planos)$/);
        const writes = (await (await fetch(`${fixture}/__fixture/state`)).json()).writes;
        assert.deepEqual(writes.filter(item => item.kind === 'free-upgrade-config').at(-1), {
          kind: 'free-upgrade-config', id: freeA, upgradePlanId: semiannual, upgradeCycle: 'SEMIANNUALLY',
        });
        await page.goto(`${origin}/plans/${freeA}`, { waitUntil: 'networkidle' });
        await page.getByText('Plano Semestral', { exact: true }).waitFor();
        await page.getByTitle('Semestral', { exact: true }).waitFor();

        await configure({ mode: 'expired', sourceFreePlanId: freeA });
        await page.goto(`${origin}/home`, { waitUntil: 'networkidle' });
        const dialog = page.getByRole('dialog');
        await dialog.getByRole('heading', { name: 'Plano Semestral', exact: true }).waitFor();
        assert.match(await dialog.innerText(), /255,00/);
        assert.match(await dialog.innerText(), /Assinatura semestral/);
        await page.screenshot({ path: `${artifacts}/expired-${theme}-${width}.png`, fullPage: true });

        await configure({ mode: 'upgrade-free', sourceFreePlanId: freeA, exhausted: true });
        await page.goto(`${origin}/cadernos/fixture-book`, { waitUntil: 'networkidle' });
        await dialog.getByRole('heading', { name: 'Plano Semestral', exact: true }).waitFor();
        assert.match(await dialog.innerText(), /limite de questões de hoje/);

        await dialog.getByRole('button', { name: 'Agora não', exact: true }).click();
        await dialog.waitFor({ state: 'hidden' });
        await page.route('**/subscription-plans/availables', async route => {
          const response = await route.fetch();
          const body = await response.json();
          await route.fulfill({ json: { ...body, data: body.data.filter(plan => plan.id !== semiannual) } });
        });
        await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
        await dialog.getByText('Confira os planos e as opções disponíveis para sua conta.', { exact: true }).waitFor();
        assert.equal(await dialog.getByRole('article').count(), 0, 'Oferta indisponível não vira outro plano');
        assert(await dialog.getByRole('button', { name: 'Ver planos', exact: true }).isVisible());
        await page.unroute('**/subscription-plans/availables');

        await configure({ mode: 'expired', sourceFreePlanId: freeB });
        await page.goto(`${origin}/cadernos/fixture-book`, { waitUntil: 'networkidle' });
        // An explicit blocked attempt reopens even when the automatic expiration notice was already seen.
        if (!(await dialog.isVisible())) await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
        await dialog.getByRole('heading', { name: 'Plano Essencial', exact: true }).waitFor();
        assert.match(await dialog.innerText(), /466,80/);

        await configure({ mode: 'admin' });
        await page.goto(`${origin}/plans/${freeA}`, { waitUntil: 'networkidle' });
        await choose(page, 'Plano sugerido', 'Seleção automática');
        assert(await page.getByLabel('Ciclo apresentado', { exact: true }).isDisabled());
        await page.getByRole('button', { name: 'Salvar', exact: true }).click();
        await page.waitForURL(/\/(plans|planos)$/);
        await page.goto(`${origin}/plans/${freeA}`, { waitUntil: 'networkidle' });
        await page.getByText('Seleção automática', { exact: true }).waitFor();
        await page.goto(`${origin}/plans/${essential}`, { waitUntil: 'networkidle' });
        assert.equal(await page.getByLabel('Plano sugerido', { exact: true }).count(), 0, 'Configuração somente em Free');
        assert.deepEqual(errors, []);
        results.push({ theme, width, status: 'passed' });
        console.log(`PASS ${theme} ${width}: edição, validação, persistência, dois limites, oferta indisponível, Free de outra origem e automático`);
      } finally { await context.close(); }
    }
  } finally {
    await configure({ mode: 'free', resetOffers: true });
    fs.writeFileSync(`${artifacts}/results.json`, JSON.stringify(results, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
