const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loadChromium, artifactsPath } = require('./support.cjs');
const origin = 'http://localhost:3137';
const fixture = 'http://127.0.0.1:4029';
const artifacts = artifactsPath('free-trial-ended-card');
fs.mkdirSync(artifacts, { recursive: true });
const results = [];
const configure = mode => fetch(`${fixture}/__fixture/config`, { method: 'POST', body: JSON.stringify({ mode }) });

(async () => {
  const browser = await loadChromium().launch({ headless: true,
    ...(process.env.ODP_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.ODP_CHROMIUM_EXECUTABLE_PATH } : {}),
  });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 1440]) {
      await configure('expired');
      const context = await browser.newContext({ viewport: { width, height: 1100 } });
      await context.addCookies([{ name: 'access_token', value: 'local-fixture-only', url: origin, httpOnly: true }]);
      await context.addInitScript(theme => {
        localStorage.setItem('theme', theme);
        localStorage.setItem('cookie-consent', 'rejected');
      }, theme);
      await context.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.goto(`${origin}/home`, { waitUntil: 'networkidle', timeout: 120_000 });
        await page.getByRole('dialog').getByRole('button', { name: 'Agora não', exact: true }).click();
        await page.getByRole('dialog').waitFor({ state: 'hidden' });
        const card = page.getByRole('region', { name: 'Período gratuito encerrado', exact: true });
        await card.waitFor();
        assert.match(await card.innerText(), /Veja os planos para continuar estudando/);
        assert.equal(await card.getByRole('progressbar').count(), 0);
        assert.equal(await card.getByRole('link', { name: 'Ver planos', exact: true }).getAttribute('href'), '/assinatura?tab=planos');
        const box = await card.boundingBox();
        assert(box.x >= 0 && box.x + box.width <= width + 1, 'Card deve caber na tela');
        await page.screenshot({ path: `${artifacts}/${theme}-${width}.png`, fullPage: true });
        await page.reload({ waitUntil: 'networkidle' });
        await card.waitFor();
        assert.equal(await page.getByRole('dialog').count(), 0, 'Card não depende de repetir o popup');
        await card.getByRole('link', { name: 'Ver planos', exact: true }).click();
        await page.waitForURL(/\/assinatura\?tab=planos/);
        assert.equal(await page.getByRole('tab', { name: 'Planos', exact: true }).getAttribute('aria-selected'), 'true');
        for (const mode of ['paid', 'staff', 'missing', 'expired-paid', 'inactive-free']) {
          await configure(mode);
          await page.goto(`${origin}/home`, { waitUntil: 'networkidle' });
          assert.equal(await card.count(), 0, `Sem aviso Free para ${mode}`);
        }
        await configure('free');
        await page.reload({ waitUntil: 'networkidle' });
        await page.getByRole('region', { name: 'Seu plano Free', exact: true }).waitFor();
        assert.equal(await card.count(), 0, 'Free válido mantém apenas consumo');
        assert.deepEqual(errors, []);
        results.push({ theme, width, status: 'passed' });
        console.log(`PASS dashboard Free encerrado ${theme} ${width}: persistência, CTA e elegibilidade`);
      } finally { await context.close(); }
    }
  } finally {
    fs.writeFileSync(`${artifacts}/results.json`, JSON.stringify(results, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
