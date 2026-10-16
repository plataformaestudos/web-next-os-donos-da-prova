const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loadChromium, artifactsPath } = require('./support.cjs');

const origin = 'http://localhost:3137';
const fixture = 'http://127.0.0.1:4029';
const artifacts = artifactsPath('free-plan-upgrade');
fs.mkdirSync(artifacts, { recursive: true });
const results = [];
const configure = mode => fetch(`${fixture}/__fixture/config`, { method: 'POST', body: JSON.stringify({ mode }) });
const dialog = page => page.getByRole('dialog');
const step = async (name, fn) => { await fn(); results.push({ name, status: 'passed' }); console.log(`PASS ${name}`); };

async function openContext(browser, mode, width = 360, theme = 'light') {
  await configure(mode);
  const context = await browser.newContext({ viewport: { width, height: width === 360 ? 740 : 1000 } });
  await context.addCookies([{ name: 'access_token', value: 'local-fixture-only', url: origin, httpOnly: true }]);
  await context.addInitScript(theme => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('cookie-consent', 'rejected');
  }, theme);
  await context.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(60_000);
  page.setDefaultNavigationTimeout(120_000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', async item => { errors.push(`unexpected browser dialog: ${item.message()}`); await item.dismiss(); });
  return { context, page, errors };
}

async function navigateQuestion(page, seq) {
  const input = page.locator('input[placeholder="Ex: 35"]');
  await input.fill(String(seq));
  await input.press('Enter');
}

(async () => {
  const browser = await loadChromium().launch({ headless: true,
    ...(process.env.ODP_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.ODP_CHROMIUM_EXECUTABLE_PATH } : {}),
  });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 1440]) {
      await step(`daily ${theme} ${width}`, async () => {
        const { context, page, errors } = await openContext(browser, 'upgrade-free', width, theme);
        try {
          await page.goto(`${origin}/cadernos/fixture-book`, { waitUntil: 'networkidle' });
          await page.getByText('Questão de teste 1: quanto é 2 + 2?', { exact: true }).waitFor();
          await navigateQuestion(page, 2);
          await page.getByText('Questão de teste 2: quanto é 2 + 2?', { exact: true }).waitFor();
          await navigateQuestion(page, 3);
          await page.getByText('Questão de teste 3: quanto é 2 + 2?', { exact: true }).waitFor();
          assert.equal(await dialog(page).count(), 0, 'Última questão permanece livre para responder');
          await page.getByText('4', { exact: true }).last().click();
          await page.getByRole('button', { name: /Responder questão/ }).click();
          await page.getByText('1 resolvida', { exact: true }).waitFor();
          await page.getByText('Resposta enviada com sucesso!', { exact: true }).waitFor({ state: 'hidden' });
          await navigateQuestion(page, 4);
          await dialog(page).waitFor();
          await dialog(page).getByText('Plano Essencial', { exact: true }).waitFor();
          assert.match(await dialog(page).innerText(), /limite de questões de hoje/);
          assert.match(await dialog(page).innerText(), /466,80/);
          await dialog(page).getByText('Consultando desconto...', { exact: true }).waitFor({ state: 'hidden' });
          await page.screenshot({ path: `${artifacts}/daily-${theme}-${width}-collapsed.png`, fullPage: true });
          await dialog(page).getByText('Ver módulos', { exact: true }).click();
          assert.match(await dialog(page).innerText(), /Matemática/);
          assert.equal(await dialog(page).count(), 1);
          assert(await page.getByText('Questão de teste 3: quanto é 2 + 2?', { exact: true }).isVisible(), 'Questão preservada atrás do popup');
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Sem overflow horizontal');
          const box = await dialog(page).boundingBox();
          assert(box.x >= 0 && box.x + box.width <= width + 1, 'Popup cabe na tela');
          assert(box.y >= 0 && box.y + box.height <= page.viewportSize().height + 1, 'Popup e ações cabem na altura da tela');
          await page.screenshot({ path: `${artifacts}/daily-${theme}-${width}.png`, fullPage: true });
          await dialog(page).getByRole('button', { name: 'Agora não', exact: true }).click();
          await dialog(page).waitFor({ state: 'hidden' });
          assert(page.url().includes('/cadernos/fixture-book'), 'Fechar não navega para trás');
          await navigateQuestion(page, 4);
          await dialog(page).waitFor();
          await dialog(page).getByRole('button', { name: 'Ver planos', exact: true }).click();
          await page.waitForURL(/\/assinatura\?tab=planos/);
          await page.getByRole('tab', { name: 'Planos', exact: true }).waitFor();
          assert.equal(await page.getByRole('tab', { name: 'Planos', exact: true }).getAttribute('aria-selected'), 'true');
          await dialog(page).waitFor({ state: 'hidden' });
          assert.equal((await (await fetch(`${fixture}/__fixture/state`)).json()).study.questionDeliveries, 3, 'Tentativas bloqueadas não entregam questão');
          assert.deepEqual(errors, []);
        } finally { await context.close(); }
      });
    }
    await step('expired initial access, dismissal and plans refresh', async () => {
      const { context, page, errors } = await openContext(browser, 'expired');
      try {
        await page.goto(`${origin}/cadernos/fixture-book`, { waitUntil: 'networkidle' });
        await dialog(page).getByText('Plano Essencial', { exact: true }).waitFor();
        assert.match(await dialog(page).innerText(), /período gratuito terminou/);
        await page.screenshot({ path: `${artifacts}/expired-mobile.png`, fullPage: true });
        await page.keyboard.press('Escape');
        await dialog(page).waitFor({ state: 'hidden' });
        await page.reload({ waitUntil: 'networkidle' });
        assert.equal(await dialog(page).count(), 0, 'Refresh não repete aviso automático já dispensado');
        await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
        await dialog(page).getByText('Plano Essencial', { exact: true }).waitFor();
        await dialog(page).getByRole('button', { name: 'Agora não', exact: true }).click();
        await dialog(page).waitFor({ state: 'hidden' });
        await page.goto(`${origin}/assinatura?tab=planos`, { waitUntil: 'networkidle' });
        assert.equal(await page.getByRole('tab', { name: 'Planos', exact: true }).getAttribute('aria-selected'), 'true');
        await page.reload({ waitUntil: 'networkidle' });
        assert.equal(await page.getByRole('tab', { name: 'Planos', exact: true }).getAttribute('aria-selected'), 'true');
        assert.equal(await dialog(page).count(), 0, 'Contratação não abre popup');
        assert.deepEqual(errors, []);
      } finally { await context.close(); }
    });
    await step('trial expires during an open study session', async () => {
      const { context, page, errors } = await openContext(browser, 'free');
      let expiresAt;
      let accessReads = 0;
      try {
        await page.route('**/question-books/user/study-access', route => {
          expiresAt ??= new Date(Date.now() + 3000).toISOString();
          accessReads++;
          return route.fulfill({ json: { data: {
            reason: Date.now() >= Date.parse(expiresAt) ? 'FREE_TRIAL_EXPIRED' : null,
            expiresAt, dailyResetAt: null, dailyQuestionLimit: 3, questionsViewedToday: 1,
          } } });
        });
        await page.goto(`${origin}/cadernos/fixture-book`, { waitUntil: 'networkidle' });
        await page.getByText('Questão de teste 1: quanto é 2 + 2?', { exact: true }).waitFor();
        await dialog(page).getByText('Plano Essencial', { exact: true }).waitFor();
        assert.match(await dialog(page).innerText(), /período gratuito terminou/);
        assert(accessReads >= 2, 'Prazo dispara nova consulta sem navegação');
        await page.screenshot({ path: `${artifacts}/expired-during-session.png`, fullPage: true });
        assert.deepEqual(errors, []);
      } finally { await context.close(); }
    });
    for (const [name, token, finalPrice] of [['percentage', 'r'.repeat(43), '373,44'], ['fixed', 'f'.repeat(43), '446,80']]) {
      await step(`upgrade preserves ${name} campaign`, async () => {
        const { context, page, errors } = await openContext(browser, 'expired');
        try {
          await context.addCookies([{ name: 'odp_referral', value: token, url: origin, httpOnly: true }]);
          await page.goto(`${origin}/cadernos/fixture-book`, { waitUntil: 'networkidle' });
          await dialog(page).getByText('Consultando desconto...', { exact: true }).waitFor({ state: 'hidden' });
          await dialog(page).getByLabel(new RegExp(`Valor com desconto:.*${finalPrice}`)).waitFor();
          assert.match(await dialog(page).getByLabel(/Valor original:/).innerText(), /466,80/);
          await page.screenshot({ path: `${artifacts}/campaign-${name}.png`, fullPage: true });
          await dialog(page).getByRole('button', { name: 'Ver planos', exact: true }).click();
          await page.waitForURL(/\/assinatura\?tab=planos/);
          assert.equal((await context.cookies()).find(cookie => cookie.name === 'odp_referral')?.value, token);
          assert.deepEqual(errors, []);
        } finally { await context.close(); }
      });
    }
    for (const mode of ['paid', 'staff', 'unlimited']) {
      await step(`no upgrade for ${mode}`, async () => {
        const { context, page, errors } = await openContext(browser, mode);
        try {
          await page.goto(`${origin}/cadernos/fixture-book`, { waitUntil: 'networkidle' });
          await page.getByText('Questão de teste 1: quanto é 2 + 2?', { exact: true }).waitFor();
          assert.equal(await dialog(page).count(), 0);
          await page.evaluate(() => window.dispatchEvent(new Event('focus')));
          assert.deepEqual(errors, []);
        } finally { await context.close(); }
      });
    }
    for (const failure of ['error', 'empty']) {
      await step(`offer ${failure} keeps CTA`, async () => {
        const { context, page, errors } = await openContext(browser, 'expired');
        try {
          await page.route('**/subscription-plans/availables', route => route.fulfill({ status: failure === 'error' ? 503 : 200, json: failure === 'error' ? { message: 'Fixture indisponível' } : { data: [] } }));
          await page.goto(`${origin}/cadernos/fixture-book`, { waitUntil: 'networkidle' });
          await dialog(page).waitFor();
          await dialog(page).getByText(failure === 'error'
            ? 'Não foi possível carregar a sugestão de plano. Você ainda pode conferir os planos disponíveis.'
            : 'Confira os planos e as opções disponíveis para sua conta.', { exact: true }).waitFor();
          await dialog(page).getByRole('button', { name: 'Ver planos', exact: true }).waitFor();
          await dialog(page).getByRole('button', { name: 'Agora não', exact: true }).click();
          await dialog(page).waitFor({ state: 'hidden' });
          assert(page.url().includes('/cadernos/fixture-book'));
          await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
          await dialog(page).getByRole('button', { name: 'Ver planos', exact: true }).click();
          await page.waitForURL(/\/assinatura\?tab=planos/);
          assert.deepEqual(errors, []);
        } finally { await context.close(); }
      });
    }
  } finally {
    fs.writeFileSync(`${artifacts}/results.json`, JSON.stringify(results, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
