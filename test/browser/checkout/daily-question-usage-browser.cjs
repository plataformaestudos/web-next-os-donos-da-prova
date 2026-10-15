const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loadChromium, artifactsPath } = require('./support.cjs');

const origin = 'http://localhost:3137';
const fixture = 'http://127.0.0.1:4029';
const artifacts = artifactsPath('daily-question-usage');
fs.mkdirSync(artifacts, { recursive: true });
const results = [];

async function until(check) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await check()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Estado esperado não foi alcançado');
}

async function fixtureState() {
  return (await fetch(`${fixture}/__fixture/state`)).json();
}

(async () => {
  const browser = await loadChromium().launch({
    headless: true,
    ...(process.env.ODP_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.ODP_CHROMIUM_EXECUTABLE_PATH } : {}),
  });
  try {
    for (const theme of ['light', 'dark']) for (const width of [360, 1440]) {
      await fetch(`${fixture}/__fixture/config`, { method: 'POST', body: JSON.stringify({ mode: 'free' }) });
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
      await page.goto(`${origin}/cadernos/fixture-book`, { waitUntil: 'networkidle' });
      const usage = page.getByRole('region', { name: 'Limite diário de questões', exact: true });
      await usage.getByText('1/3', { exact: true }).waitFor();
      const beforeFocus = await fixtureState();
      await page.evaluate(() => window.dispatchEvent(new Event('focus')));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await usage.getByText('1/3', { exact: true }).waitFor();
      assert.equal((await fixtureState()).study.usageReads, 0, 'Foco recente não consulta consumo');
      assert.equal((await fixtureState()).study.questionDeliveries, beforeFocus.study.questionDeliveries, 'Consultar consumo não pode entregar outra questão');

      await page.getByRole('button', { name: 'Ocultar estatísticas', exact: true }).click();
      assert(await usage.isVisible(), 'Consumo deve continuar visível com estatísticas ocultas');
      await page.getByRole('button', { name: 'Mostrar estatísticas', exact: true }).click();

      await page.locator('input[placeholder="Ex: 35"]').fill('2');
      await page.locator('input[placeholder="Ex: 35"]').press('Enter');
      const loading = page.getByText('Carregando...', { exact: true });
      await loading.waitFor();
      const loadingPosition = await loading.boundingBox();
      assert(Math.abs(loadingPosition.x + loadingPosition.width / 2 - width / 2) < 2, 'Carregamento centralizado na tela');
      assert(await usage.getByText('1/3', { exact: true }).isVisible(), 'Mantém contador confirmado durante a troca');
      assert.equal(await page.getByText('Carregando questão...', { exact: true }).count(), 0);
      await usage.getByText('2/3', { exact: true }).waitFor();
      assert.equal((await fixtureState()).study.questionDeliveries, 2, 'Uma entrega por navegação');
      assert.equal((await fixtureState()).study.usageReads, 0, 'Consumo vem na resposta da questão');
      await page.goBack();
      await until(async () => (await page.url()).includes('seq=1'));
      await page.getByText('Questão de teste 1: quanto é 2 + 2?', { exact: true }).waitFor();
      await usage.getByText('2/3', { exact: true }).waitFor();
      await page.goForward();
      await page.getByText('Questão de teste 2: quanto é 2 + 2?', { exact: true }).waitFor();
      await usage.getByText('2/3', { exact: true }).waitFor();
      const beforeAnswer = await fixtureState();
      await page.getByText('4', { exact: true }).last().click();
      await page.getByRole('button', { name: /Responder questão/ }).click();
      await page.getByText('1 resolvida', { exact: true }).waitFor();
      assert.equal((await fixtureState()).study.questionDeliveries, beforeAnswer.study.questionDeliveries, 'Responder só atualiza estatísticas');
      await page.locator('input[placeholder="Ex: 35"]').fill('3');
      await page.locator('input[placeholder="Ex: 35"]').press('Enter');
      await usage.getByText('3/3', { exact: true }).waitFor();
      assert.equal((await fixtureState()).study.usageReads, 0);
      assert(await usage.getByText('Limite de hoje atingido', { exact: true }).isVisible());
      assert(await usage.getByRole('link', { name: 'Ver planos', exact: true }).isVisible());
      assert.equal(await usage.getByRole('progressbar').getAttribute('aria-valuenow'), '100');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Página com overflow horizontal');
      await page.screenshot({ path: `${artifacts}/${theme}-${width}.png`, fullPage: true });
      assert.deepEqual(errors, []);
      results.push({ theme, width, status: 'passed', views: (await fixtureState()).study.views });
      console.log(`PASS consumo ${theme} ${width}: navegação, foco, estatísticas e limite`);
      await context.close();
    }

    for (const mode of ['paid', 'staff', 'unlimited', 'zero', 'error']) {
      await fetch(`${fixture}/__fixture/config`, { method: 'POST', body: JSON.stringify({ mode }) });
      const context = await browser.newContext({ viewport: { width: 360, height: 1100 } });
      await context.addCookies([{ name: 'access_token', value: 'local-fixture-only', url: origin, httpOnly: true }]);
      await context.addInitScript(() => localStorage.setItem('cookie-consent', 'rejected'));
      await context.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
      const page = await context.newPage();
      await page.goto(`${origin}/cadernos/fixture-book${['paid', 'staff', 'unlimited'].includes(mode) ? '?seq=2' : ''}`, { waitUntil: 'networkidle' });
      const usage = page.getByRole('region', { name: 'Limite diário de questões', exact: true });
      if (mode === 'zero') {
        await usage.getByText('Limite de hoje atingido', { exact: true }).waitFor();
        assert.equal(await usage.getByRole('progressbar').getAttribute('aria-valuenow'), '100');
      } else {
        assert.equal(await usage.count(), 0);
      }
      if (['paid', 'staff', 'unlimited'].includes(mode)) {
        await page.getByText('Questão de teste 2: quanto é 2 + 2?', { exact: true }).waitFor();
        assert.equal((await fixtureState()).study.questionDeliveries, 1, 'Link direto entrega apenas a questão solicitada');
        await page.locator('input[placeholder="Ex: 35"]').fill('3');
        await page.locator('input[placeholder="Ex: 35"]').press('Enter');
        await page.getByText('Questão de teste 3: quanto é 2 + 2?', { exact: true }).waitFor();
        assert.equal((await fixtureState()).study.questionDeliveries, 2);
        assert.equal(await usage.count(), 0);
      }
      await page.evaluate(() => window.dispatchEvent(new Event('focus')));
      assert.equal((await fixtureState()).study.usageReads, 0, 'Só Free com limite confirmado pode consultar consumo');
      results.push({ mode, status: 'passed' });
      console.log(`PASS consumo ${mode}`);
      await context.close();
    }

    await fetch(`${fixture}/__fixture/config`, { method: 'POST', body: JSON.stringify({ mode: 'free' }) });
    const context = await browser.newContext({ viewport: { width: 360, height: 1100 } });
    await context.addCookies([{ name: 'access_token', value: 'local-fixture-only', url: origin, httpOnly: true }]);
    await context.addInitScript(() => localStorage.setItem('cookie-consent', 'rejected'));
    await context.route('**/*', route => ['localhost', '127.0.0.1'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
    const page = await context.newPage();
    await page.goto(`${origin}/cadernos/fixture-book`, { waitUntil: 'networkidle' });
    const usage = page.getByRole('region', { name: 'Limite diário de questões', exact: true });
    await usage.getByText('1/3', { exact: true }).waitFor();
    const beforeIdle = await fixtureState();
    await page.evaluate(() => { const now = Date.now.bind(Date); Date.now = () => now() + 61_000; window.dispatchEvent(new Event('focus')); });
    await until(async () => (await fixtureState()).study.usageReads === 1);
    await usage.getByText('1/3', { exact: true }).waitFor();
    assert.equal((await fixtureState()).study.questionDeliveries, beforeIdle.study.questionDeliveries);
    await page.route('**/next-question?*', async route => {
      const response = await route.fetch(); const body = await response.json();
      delete body.data.dailyUsage;
      await route.fulfill({ response, json: body });
    });
    await page.locator('input[placeholder="Ex: 35"]').fill('2');
    await page.locator('input[placeholder="Ex: 35"]').press('Enter');
    await page.getByText('Questão de teste 2: quanto é 2 + 2?', { exact: true }).waitFor();
    await usage.getByText('Não foi possível atualizar o consumo.', { exact: true }).waitFor();
    assert(await usage.getByText('1/3', { exact: true }).isVisible());
    assert.equal((await fixtureState()).study.usageReads, 1, 'Falha do metadado não adiciona consulta automática por navegação');
    await usage.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
    await usage.getByText('2/3', { exact: true }).waitFor();
    assert.equal((await fixtureState()).study.usageReads, 2);
    results.push({ mode: 'quiet-refresh-and-metadata-failure', status: 'passed' });
    console.log('PASS consumo: revalidação após inatividade e recuperação sem bloquear questão');
    await context.close();
  } finally {
    fs.writeFileSync(`${artifacts}/results.json`, JSON.stringify(results, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
