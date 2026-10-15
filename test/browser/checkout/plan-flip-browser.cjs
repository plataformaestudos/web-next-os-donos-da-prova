const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loadChromium, artifactsPath } = require('./support.cjs');
const chromium = loadChromium();
const artifacts = artifactsPath('plan-flip');
const origin = 'http://localhost:3137';
const report = [];
fs.mkdirSync(artifacts, { recursive: true });
async function waitFor(fn) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await fn()) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Estado esperado não foi alcançado');
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 390, 768, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 } });
      await context.addInitScript(theme => { localStorage.setItem('theme', theme); localStorage.setItem('cookie-consent', 'rejected'); }, theme);
      await context.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
      const page = await context.newPage();
      const exceptions = [];
      page.on('pageerror', error => exceptions.push(error.message));
      await page.goto(origin + '/cadastro');
      const card = page.getByRole('article').first();
      const selection = card.getByRole('button', { name: 'Plano Plano Essencial', exact: true });
      await selection.focus(); await page.keyboard.press('Enter');
      await waitFor(async () => await selection.getAttribute('aria-pressed') === 'true');
      const modules = card.getByRole('button', { name: 'Ver módulos de Plano Essencial', exact: true });
      await modules.focus(); await page.keyboard.press('Enter');
      const back = card.getByRole('button', { name: 'Voltar', exact: true });
      await waitFor(() => back.evaluate(element => element === document.activeElement));
      await page.waitForTimeout(550);
      assert.equal(await card.getByRole('button', { name: 'Plano Plano Essencial', exact: true }).count(), 0);
      assert.equal(await card.locator('button[aria-pressed]').getAttribute('aria-pressed'), 'true');
      const region = card.getByRole('region', { name: 'Módulos de Plano Essencial', exact: true });
      assert.equal(await region.isVisible(), true);
      assert.equal(await region.locator('li').count(), 2);
      const transform = await card.locator(':scope > div').evaluate(element => getComputedStyle(element).transform);
      assert.equal(transform, 'matrix3d(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: `${artifacts}/${theme}-${width}-modules.png`, fullPage: true });
      await back.press('Enter');
      await waitFor(() => modules.evaluate(element => element === document.activeElement));
      await page.waitForTimeout(550);
      assert.equal(await selection.getAttribute('aria-pressed'), 'true');
      assert.equal(await card.getByRole('button', { name: 'Voltar', exact: true }).count(), 0);
      const other = page.getByRole('article').nth(1);
      await other.getByRole('button', { name: 'Ver módulos de Plano Semestral', exact: true }).click();
      assert.equal(await other.locator('button[aria-pressed]').getAttribute('aria-pressed'), 'false');
      await other.getByRole('button', { name: 'Voltar', exact: true }).press('Enter');
      const free = page.getByRole('article').last();
      await free.getByRole('button', { name: 'Ver módulos de Plano Free', exact: true }).click();
      assert.equal(await free.getByText('Este plano não possui módulos informados.', { exact: true }).isVisible(), true);
      await free.getByRole('button', { name: 'Voltar', exact: true }).press('Enter');
      await waitFor(() => page.getByRole('button', { name: 'Continuar', exact: true }).isEnabled());
      await page.getByRole('button', { name: 'Continuar', exact: true }).click();
      await page.getByLabel('Nome completo', { exact: true }).waitFor();
      assert.deepEqual(exceptions, []);
      report.push({ theme, width, status: 'passed', rotation: transform });
      console.log(`PASS ${theme} ${width}: rotação, seleção, foco, retorno, vazio e continuação`);
      await context.close();
    }
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.addInitScript(() => localStorage.setItem('cookie-consent', 'rejected'));
    await context.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto(origin + '/cadastro');
    const card = page.getByRole('article').first();
    await card.getByRole('button', { name: 'Ver módulos de Plano Essencial', exact: true }).click();
    const duration = await card.locator(':scope > div').evaluate(element => getComputedStyle(element).transitionDuration);
    assert.equal(duration, '0s');
    report.push({ reducedMotion: true, status: 'passed' });
    await context.close();
  } finally {
    fs.writeFileSync(artifacts + '/results.json', JSON.stringify(report, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
