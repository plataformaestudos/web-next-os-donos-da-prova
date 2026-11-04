const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadChromium } = require('./checkout/support.cjs');
const origin = 'http://127.0.0.1:3142';
const api = 'http://127.0.0.1:4042';
const importId = '22222222-2222-4222-8222-222222222222';
const bookId = '66666666-6666-4666-8666-666666666666';
const moduleId = '77777777-7777-4777-8777-777777777777';
const questionId = index => `55555555-5555-4555-8555-${String(index + 1).padStart(12, '0')}`;
const artifacts = process.env.ODP_DOCX_GRAPHICS_ARTIFACTS || '/tmp/odp-docx-evidence/browser';
fs.mkdirSync(artifacts, { recursive: true });

(async () => {
  const browser = await loadChromium().launch({ headless: true, ...(process.env.ODP_CHROMIUM_PATH ? { executablePath: process.env.ODP_CHROMIUM_PATH } : {}) });
  const checks = [], errors = [];
  try {
    for (const width of [1366, 390]) {
      const role = width === 1366 ? 'admin' : 'student';
      const context = await browser.newContext({ viewport: { width, height: 950 } });
      await context.addCookies([{ name: 'access_token', value: `fixture-${role}`, url: origin, httpOnly: true }]);
      await context.addInitScript(() => localStorage.setItem('cookie-consent', 'rejected'));
      await context.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      async function diagrams(scope, count = 4) {
        const images = scope.locator('img[alt^="Desenho do Word"]');
        await images.first().waitFor({ state: 'visible' });
        assert.equal(await images.count(), count);
        for (const img of await images.all()) {
          await img.scrollIntoViewIfNeeded();
          await img.evaluate(img => img.decode());
          assert.equal(await img.evaluate(img => img.naturalWidth > 0 && img.getBoundingClientRect().width > 0), true);
          // Generated PNGs are 2x; every screen must honor the original DOCX size.
          const dimensions = await img.evaluate(img => ({ width: img.getBoundingClientRect().width, natural: img.naturalWidth, style: img.getAttribute('style'), html: img.outerHTML }));
          assert.equal(Math.abs(dimensions.width - dimensions.natural / 2) < 2, true, JSON.stringify(dimensions));
        }
      }
      async function truthTable(scope) {
        const table = scope.locator('table').filter({ hasText: 'P→Q' }).first();
        await table.waitFor({ state: 'visible' });
        await table.scrollIntoViewIfNeeded();
        assert.equal(await table.locator('tr').count(), 5);
        assert.equal(await table.locator('td,th').count(), 15);
        assert.equal(await table.locator('td,th').first().evaluate(td => getComputedStyle(td).borderTopStyle !== 'none'), true);
        assert.doesNotMatch(await table.textContent(), /PàQ/);
      }
      async function screenshot(name) {
        await page.screenshot({ path: path.join(artifacts, `${role}-${name}.png`), fullPage: true, animations: 'disabled' });
      }
      if (role === 'admin') {
        await page.goto(`${origin}/importacao-questoes/${importId}/preview`);
        await diagrams(page.locator('.import-item-card').first());
        await truthTable(page.locator('.import-item-card').nth(1));
        await screenshot('import-preview');
        for (const index of [0, 1]) {
          await page.locator('.import-item-card').nth(index).getByRole('button', { name: 'Revisar / editar' }).click();
          const dialog = page.getByRole('dialog');
          const editor = dialog.getByRole('textbox', { name: 'Comentário obrigatório', exact: true });
          await editor.waitFor();
          await page.waitForFunction(() => Array.from(document.querySelectorAll('.ant-modal')).some(modal => {
            const style = getComputedStyle(modal);
            return style.transform === 'none' && style.animationName === 'none' && style.opacity === '1';
          }));
          if (index === 0) await diagrams(editor); else await truthTable(editor);
          await editor.evaluate(element => { element.editor.commands.insertContent('x'); element.editor.commands.deleteRange({ from: 1, to: 2 }); });
          const saved = page.waitForResponse(response => response.request().method() === 'PATCH' && response.url().includes('/items/'));
          await dialog.getByRole('button', { name: 'Salvar e revalidar' }).first().click();
          await saved;
          const { data: { draftWrites } } = await (await context.request.get(`${api}/__state`)).json();
          const html = draftWrites.at(-1).payload.comment;
          if (index === 0) { assert.equal((html.match(/import-image:\/\//g) || []).length, 4); assert.doesNotMatch(html, /http:\/\//); }
          else { assert.equal((html.match(/<tr>/g) || []).length, 5); assert.match(html, /P→Q/); }
          await dialog.getByRole('button', { name: 'Close', exact: true }).click();
          await dialog.waitFor({ state: 'hidden' });
        }
        checks.push('Importação: preview e edição dos desenhos/tabela preservam dimensões, estrutura e referências canônicas.');
      }
      for (const index of [0, 1]) {
        const check = index === 0 ? diagrams : truthTable;
        await page.goto(`${origin}/questions/view/${questionId(index)}`);
        await page.getByRole('button', { name: 'Ver comentário' }).click();
        await check(page.locator('.tiptap'));
        await screenshot(`question-view-${index}`);
        await page.goto(`${origin}/cadernos/${bookId}?seq=${index + 1}`);
        await page.getByRole('button', { name: 'Ver resolução' }).click();
        await check(page.locator('.tiptap'));
        await screenshot(`book-${index}`);
        if (role === 'admin') {
          await page.goto(`${origin}/questoes/${questionId(index)}`);
          await page.getByRole('button', { name: 'Ver comentário' }).click();
          await check(page.locator('.tiptap'));
          await page.getByText('Editar', { exact: true }).click();
          const editor = page.locator('.tiptap[contenteditable="true"]').last();
          await editor.waitFor();
          await check(editor);
          await editor.evaluate(element => { element.editor.commands.insertContent('x'); element.editor.commands.deleteRange({ from: 1, to: 2 }); });
          const saved = page.waitForResponse(response => response.request().method() === 'POST' && response.url().includes(`/questoes/${questionId(index)}`));
          await page.getByRole('button', { name: 'Salvar', exact: true }).click();
          await saved;
          const { data: { writes } } = await (await context.request.get(`${api}/__state`)).json();
          const html = writes.at(-1).comment;
          if (index === 0) assert.equal((html.match(/<img\b/g) || []).length, 4);
          else { assert.equal((html.match(/<tr>/g) || []).length, 5); assert.match(html, /P→Q/); }
          await page.goto(`${origin}/questoes/${questionId(index)}`);
          await page.getByRole('button', { name: 'Ver comentário' }).click();
          await check(page.locator('.tiptap'));
        }
      }
      checks.push(`${role} (${width}px): questions/view e caderno exibem os dois comentários${role === 'admin' ? '; edição, salvamento e reabertura preservam o HTML' : ''}.`);
      if (role === 'admin') {
        for (const route of ['/questoes', `/questoes/modulo/${moduleId}`]) {
          await page.goto(`${origin}${route}`);
          await page.getByRole('link', { name: /Contrato visual de tabelas e setas/ }).hover();
          const popover = page.locator('.ant-popover').filter({ hasText: 'P→Q' });
          await diagrams(popover, 1);
          await truthTable(popover);
          assert.equal(await popover.locator('th[colspan="2"]').count(), 1);
          assert.equal(await popover.locator('td[rowspan="2"]').count(), 1);
        }
        await page.goto(`${origin}/questoes/${questionId(2)}`);
        await page.getByText('Editar', { exact: true }).click();
        const editors = page.locator('.tiptap[contenteditable="true"]');
        await editors.first().waitFor();
        for (const index of [0, 1, 3]) { await diagrams(editors.nth(index), 1); await truthTable(editors.nth(index)); }
        assert.equal(await editors.first().locator('th[colspan="2"]').count(), 1);
        assert.equal(await editors.first().locator('td[rowspan="2"]').count(), 1);
        checks.push('Listas geral/por módulo e edição preservam tabelas, células mescladas e imagens em enunciado, alternativa e comentário.');
        const { data: { questions } } = await (await context.request.get(`${api}/__state`)).json();
        await page.goto(`${origin}/questoes/nova`);
        const newEditor = page.locator('.tiptap[contenteditable="true"]').first();
        await newEditor.waitFor();
        await newEditor.evaluate((element, html) => element.editor.commands.setContent(html), questions[2].text);
        await diagrams(newEditor, 1);
        await truthTable(newEditor);
        assert.match(await newEditor.evaluate(element => element.editor.getHTML()), /colspan="2"/);
        checks.push('Cadastro de nova questão aceita o mesmo conteúdo estruturado.');
      }
      await context.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify({ checks, errors }, null, 2));
    console.log(JSON.stringify({ checks, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
