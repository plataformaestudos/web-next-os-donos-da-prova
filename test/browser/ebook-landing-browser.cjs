const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadChromium } = require('./checkout/support.cjs');
const origin = 'http://127.0.0.1:3146';
const api = 'http://127.0.0.1:4046';
const artifacts = '/tmp/odp-ebook-layout-artifacts';
fs.mkdirSync(artifacts, { recursive: true });
const checks = [], errors = [];
const fixture = async (endpoint = '/__state', method = 'GET') => (await fetch(`${api}${endpoint}`, { method })).json();

(async () => {
  const browser = await loadChromium().launch({ headless: true });
  try {
    await fixture('/__reset', 'POST');
    async function create(width, theme = 'light') {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await context.addCookies([{ name: 'access_token', value: 'local-fixture', url: origin, httpOnly: true }]);
      await context.addInitScript(({ theme }) => { localStorage.setItem('cookie-consent', 'rejected'); localStorage.setItem('theme', theme); }, { theme });
      await context.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      return { page, context };
    }
    for (const width of [360, 390, 768, 1440]) {
      const { page, context } = await create(width);
      await page.goto(`${origin}/reforma-tributaria`, { waitUntil: 'networkidle' });
      await page.getByRole('heading', { name: /A Reforma Tributária pode/ }).waitFor();
      assert.equal(await page.locator('#amostras figure').count(), 3);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}`);
      for (const img of await page.locator('img').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(element => element.decode());
      }
      assert.equal(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)), true);
      const summary = page.locator('#duvidas summary').first();
      await summary.focus(); await page.keyboard.press('Enter');
      assert.equal(await page.locator('#duvidas details').first().getAttribute('open'), '');
      const cta = page.locator('a[href^="/ebooks/checkout"]').first();
      assert.equal(await cta.getAttribute('href'), '/ebooks/checkout?path=%2Freforma-tributaria');
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(artifacts, `landing-${width}.png`), fullPage: true, animations: 'disabled' });
      checks.push(`Landing ${width}px: all sections, images, FAQ keyboard, checkout link and no horizontal overflow`);
      await context.close();
    }
    let { page, context } = await create(1440, 'dark');
    await page.goto(`${origin}/ebook-legado`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('#estrategia, #amostras, #publico').count(), 0);
    assert.equal(await page.getByRole('heading', { name: /A Reforma Tributária pode/ }).count(), 1);
    checks.push('Legacy content renders without optional blocks, including with the application dark theme');
    await context.close();

    ({ page, context } = await create(1440));
    await page.goto(`${origin}/ebooks/administrar`, { waitUntil: 'networkidle' });
    await page.getByRole('tab', { name: 'Páginas de venda' }).click();
    await page.getByRole('button', { name: 'Editar e visualizar', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Página de venda do ebook' });
    const frame = page.frameLocator('iframe');
    await frame.getByRole('heading', { name: /A Reforma Tributária pode/ }).waitFor();
    await dialog.getByText('Todas as alterações estão salvas.', { exact: true }).waitFor();
    assert.equal(await frame.getByRole('button', { name: 'Compra desabilitada na prévia' }).first().isDisabled(), true);
    await dialog.getByText('Identificação e abertura', { exact: true }).click();
    await dialog.getByLabel('Complemento da chamada em vermelho', { exact: true }).fill('Uma preparação personalizada.');
    await frame.getByRole('heading', { name: /Uma preparação personalizada/ }).waitFor();
    assert.equal((await fixture()).published.content.headlineHighlight, 'Sua preparação também.');
    checks.push('Unsaved edits update the actual landing renderer in the iframe and preserve the public version');
    await dialog.getByText('Amostras do material', { exact: true }).click();
    await dialog.getByRole('switch', { name: 'Mostrar amostras do material', exact: true }).click();
    assert.equal(await frame.locator('#amostras').count(), 0);
    await dialog.getByRole('switch', { name: 'Mostrar amostras do material', exact: true }).click();
    assert.equal(await frame.locator('#amostras figure').count(), 3);
    const samplesPanel = dialog.locator('.ant-collapse-item').filter({ has: page.locator('.ant-collapse-header-text', { hasText: 'Amostras do material' }) });
    await samplesPanel.getByRole('button', { name: 'Escolher imagem local', exact: true }).nth(2).locator('..').locator('input[type=file]').setInputFiles(path.join(__dirname, '../../public/images/passaro.png'));
    await frame.locator('#amostras figure').nth(2).locator('img[src^="blob:"]').waitFor();
    await samplesPanel.getByRole('button', { name: 'Remover item 2 de Amostras do material', exact: true }).click();
    assert.equal(await frame.locator('#amostras figure').count(), 2);
    await frame.locator('#amostras figure').nth(1).locator('img[src^="blob:"]').waitFor();
    checks.push('Hiding a block preserves it; removing a sample keeps the remaining local upload attached to its page');
    await dialog.getByText('Dúvidas frequentes', { exact: true }).click();
    await dialog.getByLabel('Pergunta', { exact: true }).first().fill('Pergunta personalizada?');
    await frame.locator('#duvidas summary').filter({ hasText: 'Pergunta personalizada?' }).waitFor();
    await dialog.getByRole('button', { name: 'Salvar rascunho', exact: true }).click();
    await dialog.getByText('Todas as alterações estão salvas.', { exact: true }).waitFor();
    const saved = await fixture();
    assert.equal(saved.uploads, 1);
    assert.equal(saved.draft.content.samples.length, 2);
    assert.match(saved.draft.content.samples[1].imageUrl, /upload.png/);
    assert.equal(saved.draft.content.samples[1].title, 'Comentários');
    assert.equal(saved.draft.content.faq[0].question, 'Pergunta personalizada?');
    assert.equal(saved.published.content.samples.length, 3);
    assert.equal(saved.orders, 0);
    checks.push('Saving uploads sample through backend, preserves custom FAQ and keeps published page and orders untouched');
    await dialog.getByText('Celular', { exact: true }).click();
    assert.equal(await frame.locator('body').evaluate(body => body.ownerDocument.defaultView.innerWidth), 390);
    assert.equal(await frame.locator('body').evaluate(body => body.ownerDocument.documentElement.scrollWidth > 390), false);
    const anchor = frame.locator('header a[href="#amostras"]');
    // Desktop navigation and all purchase buttons remain contained in the iframe.
    assert.equal(await frame.locator('a[href^="/ebooks/checkout"]').count(), 0);
    await dialog.getByRole('button', { name: 'Expandir prévia' }).click();
    await frame.locator('#duvidas summary').first().scrollIntoViewIfNeeded();
    await frame.locator('#duvidas summary').first().click();
    assert.equal(await frame.locator('#duvidas details').first().getAttribute('open'), '');
    await page.screenshot({ path: path.join(artifacts, 'editor-mobile-preview.png'), fullPage: true, animations: 'disabled' });
    await dialog.getByRole('button', { name: 'Voltar ao editor' }).click();
    await dialog.getByText('Computador', { exact: true }).click();
    await anchor.click();
    assert.match(page.url(), /\/ebooks\/administrar$/);
    checks.push('390px and 1200px iframe viewports, expanded preview, FAQ and anchor navigation work without leaving the editor');
    await page.screenshot({ path: path.join(artifacts, 'editor-desktop.png'), fullPage: true, animations: 'disabled' });
    await dialog.getByRole('button', { name: 'Publicar rascunho salvo', exact: true }).click();
    const confirmation = page.getByRole('dialog').filter({ hasText: 'Publicar o rascunho salvo?' });
    await confirmation.getByRole('button', { name: 'Publicar rascunho salvo', exact: true }).click();
    await dialog.getByText(/Publicada em \/reforma-tributaria/).waitFor();
    const live = await context.newPage();
    await live.goto(`${origin}/reforma-tributaria`, { waitUntil: 'networkidle' });
    await live.getByRole('heading', { name: /Uma preparação personalizada/ }).waitFor();
    assert.equal(await live.locator('#amostras figure').count(), 2);
    assert.equal(await live.locator('#duvidas summary').filter({ hasText: 'Pergunta personalizada?' }).count(), 1);
    assert.equal((await fixture()).orders, 0);
    checks.push('Explicit publication updates the public page with saved text, samples and FAQ without creating an order');
    await context.close();
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify({ checks, errors }, null, 2));
    console.log(JSON.stringify({ checks, errors, artifacts }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
