const assert = require('node:assert/strict');
const { loadChromium } = require('./checkout/support.cjs');
const origin = 'http://127.0.0.1:3141';
const questionId = '55555555-5555-4555-8555-555555555555';
const bookId = '66666666-6666-4666-8666-666666666666';

(async () => {
  const browser = await loadChromium().launch({ headless: true, ...(process.env.ODP_CHROMIUM_PATH ? { executablePath: process.env.ODP_CHROMIUM_PATH } : {}) });
  try {
    const context = await browser.newContext();
    await context.addCookies([{ name: 'access_token', value: 'fixture-admin', url: origin, httpOnly: true }]);
    await context.addInitScript(() => localStorage.setItem('cookie-consent', 'rejected'));
    await context.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
    const page = await context.newPage();
    const initialState = await (await context.request.get('http://127.0.0.1:4041/__state')).json();
    const initialWrites = initialState.data.writes.length;
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    async function loadedImage(alt) {
      const img = page.locator(`.tiptap img[alt="${alt}"]`);
      await img.waitFor({ state: 'visible' });
      await img.evaluate(img => img.decode());
      assert.equal(await img.evaluate(img => img.naturalWidth > 0 && img.getBoundingClientRect().width > 0), true, alt);
    }
    async function checkQuestion(commentButton) {
      for (const alt of ['Enunciado', 'Alternativa', 'Imagem legada']) await loadedImage(alt);
      await page.getByRole('button', { name: commentButton }).click();
      await loadedImage('Comentário');
    }
    await page.goto(`${origin}/questions/view/${questionId}`);
    await checkQuestion('Ver comentário');
    console.log('OK: questions/view exibe enunciado, alternativas e comentário com imagens.');

    await page.goto(`${origin}/questoes`);
    await page.getByRole('link', { name: /Questão importada com imagem/ }).hover();
    await loadedImage('Enunciado');
    console.log('OK: preview da lista /questoes carrega a imagem.');

    await page.goto(`${origin}/cadernos/${bookId}`);
    await checkQuestion('Ver resolução');
    console.log('OK: caderno exibe enunciado, alternativas e resolução com imagens.');

    await page.goto(`${origin}/questoes/${questionId}`);
    await checkQuestion('Ver comentário');
    await page.getByText('Editar', { exact: true }).click();
    const editors = page.locator('.tiptap[contenteditable="true"]');
    await editors.first().waitFor();
    // Force serialization of a paragraph that contains only an image.
    await editors.nth(1).evaluate(element => {
      const editor = element.editor;
      editor.commands.insertContent('x');
      editor.commands.deleteRange({ from: 1, to: 2 });
    });
    const saveResponse = page.waitForResponse(response => response.request().method() === 'POST' && response.url().startsWith(`${origin}/questoes/${questionId}`));
    await page.getByRole('button', { name: /Salvar/ }).click();
    await saveResponse;
    const { data: { writes } } = await (await context.request.get('http://127.0.0.1:4041/__state')).json();
    assert.equal(writes.length, initialWrites + 1);
    const write = writes[initialWrites];
    for (const html of [write.text, write.comment, ...write.alternatives.map(a => a.text)]) {
      assert.match(html, /<img\b[^>]+src="http:\/\/127\.0\.0\.1:4041\/storage\//);
    }
    assert.doesNotMatch(write.alternatives[0].text, />x/);
    assert.deepEqual(errors, []);
    console.log('OK: edição e salvamento preservam imagens importadas, legadas e alternativa só com imagem.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
