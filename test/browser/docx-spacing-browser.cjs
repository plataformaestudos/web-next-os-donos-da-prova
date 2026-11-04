const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadChromium } = require('./checkout/support.cjs');
const origin = 'http://127.0.0.1:3142';
const api = 'http://127.0.0.1:4042';
const importId = '22222222-2222-4222-8222-222222222222';
const questionId = '55555555-5555-4555-8555-000000000004';
const bookId = '66666666-6666-4666-8666-666666666666';
const artifacts = process.env.ODP_SPACING_ARTIFACTS || '/tmp/odp-spacing-evidence/browser';
fs.mkdirSync(artifacts, { recursive: true });

(async () => {
  const browser = await loadChromium().launch({ headless: true, ...(process.env.ODP_CHROMIUM_PATH ? { executablePath: process.env.ODP_CHROMIUM_PATH } : {}) });
  const checks = [], errors = [];
  try {
    for (const width of [1366, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 } });
      await context.addCookies([{ name: 'access_token', value: 'fixture-admin', url: origin, httpOnly: true }]);
      await context.addInitScript(() => localStorage.setItem('cookie-consent', 'rejected'));
      await context.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      async function inspect(editor) {
        await editor.getByText('Alternativa a:', { exact: true }).waitFor();
        const result = await editor.evaluate(element => {
          const paragraphs = [...element.children].filter(node => node.tagName === 'P');
          const text = node => node.textContent.trim();
          const a = paragraphs.findIndex(p => text(p) === 'Alternativa a:');
          const clue = paragraphs.findIndex(p => text(p).startsWith('Pista 1'));
          return {
            gaps: paragraphs.filter(p => !text(p)).length,
            lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight),
            blankHeight: paragraphs[a + 1].getBoundingClientRect().height,
            gapAfterA: paragraphs[a + 2].getBoundingClientRect().top - paragraphs[a].getBoundingClientRect().bottom,
            blankAfterA: text(paragraphs[a + 1]) === '',
            consecutiveClues: text(paragraphs[clue + 1]).startsWith('Pista 2') && text(paragraphs[clue + 2]).startsWith('Pista 3'),
            clueGap: paragraphs[clue + 1].getBoundingClientRect().top - paragraphs[clue].getBoundingClientRect().bottom,
            storedGaps: (element.editor.getHTML().match(/<p><\/p>/g) || []).length,
          };
        });
        assert.ok(result.gaps > 10);
        assert.equal(result.blankAfterA, true);
        assert.equal(result.consecutiveClues, true);
        assert.ok(Math.abs(result.blankHeight - result.lineHeight) < 1, JSON.stringify(result));
        assert.ok(Math.abs(result.gapAfterA - result.lineHeight) < 1, JSON.stringify(result));
        assert.ok(Math.abs(result.clueGap) < 1, JSON.stringify(result));
        assert.equal(result.storedGaps, result.gaps);
        return result.gaps;
      }
      async function editWithoutChangingText(editor) {
        await editor.evaluate(element => {
          element.editor.commands.insertContent('x');
          element.editor.commands.deleteRange({ from: 1, to: 2 });
        });
      }
      await page.goto(`${origin}/importacao-questoes/${importId}/preview`);
      const card = page.locator('.import-item-card').nth(3);
      const gaps = await inspect(card.locator('.import-content').last().locator('.tiptap'));
      await card.getByRole('button', { name: 'Revisar / editar' }).click();
      const dialog = page.getByRole('dialog');
      const draft = dialog.getByRole('textbox', { name: 'Comentário obrigatório', exact: true });
      await draft.waitFor();
      await page.waitForFunction(() => [...document.querySelectorAll('.ant-modal')].some(modal => getComputedStyle(modal).animationName === 'none' && getComputedStyle(modal).transform === 'none'));
      assert.equal(await inspect(draft), gaps);
      await editWithoutChangingText(draft);
      const patch = page.waitForResponse(response => response.request().method() === 'PATCH' && response.url().includes('/items/'));
      await dialog.getByRole('button', { name: 'Salvar e revalidar' }).first().click();
      await patch;
      const { data: { draftWrites } } = await (await context.request.get(`${api}/__state`)).json();
      assert.equal((draftWrites.at(-1).payload.comment.match(/<p><\/p>/g) || []).length, gaps);
      await dialog.getByRole('button', { name: 'Close', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });

      for (const [route, button, name] of [
        [`/questions/view/${questionId}`, 'Ver comentário', 'view'],
        [`/questoes/${questionId}`, 'Ver comentário', 'management'],
        [`/cadernos/${bookId}?seq=4`, 'Ver resolução', 'book'],
      ]) {
        await page.goto(`${origin}${route}`);
        await page.getByRole('button', { name: button }).click();
        const editor = page.locator('.tiptap').last();
        assert.equal(await inspect(editor), gaps);
        await editor.getByText('Alternativa a:', { exact: true }).scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(artifacts, `${width}-${name}.png`), animations: 'disabled' });
      }
      await page.goto(`${origin}/questoes/${questionId}`);
      await page.getByText('Editar', { exact: true }).click();
      const editor = page.locator('.tiptap[contenteditable="true"]').last();
      assert.equal(await inspect(editor), gaps);
      await editWithoutChangingText(editor);
      const save = page.waitForResponse(response => response.request().method() === 'POST' && response.url().includes(`/questoes/${questionId}`));
      await page.getByRole('button', { name: 'Salvar', exact: true }).click();
      await save;
      await page.goto(`${origin}/questoes/${questionId}`);
      await page.getByRole('button', { name: 'Ver comentário' }).click();
      assert.equal(await inspect(page.locator('.tiptap').last()), gaps);
      checks.push(`${width}px: ${gaps} linhas vazias do comentário preservadas no preview, revisão, questions/view, administração, caderno e após editar/salvar/reabrir; pistas consecutivas sem espaço extra.`);
      await context.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify({ checks, errors }, null, 2));
    console.log(JSON.stringify({ checks, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
