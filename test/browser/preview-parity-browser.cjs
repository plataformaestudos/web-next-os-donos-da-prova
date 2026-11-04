const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadChromium } = require('./checkout/support.cjs');
const origin = 'http://127.0.0.1:3142';
const importId = '22222222-2222-4222-8222-222222222222';
const bookId = '66666666-6666-4666-8666-666666666666';
const questionId = index => `55555555-5555-4555-8555-${String(index + 1).padStart(12, '0')}`;
const artifacts = process.env.ODP_PREVIEW_PARITY_ARTIFACTS || '/tmp/odp-docx-evidence/parity';
fs.mkdirSync(artifacts, { recursive: true });

(async () => {
  const browser = await loadChromium().launch({ headless: true, ...(process.env.ODP_CHROMIUM_PATH ? { executablePath: process.env.ODP_CHROMIUM_PATH } : {}) });
  const checks = [];
  const errors = [];
  try {
    for (const viewportWidth of [1366, 390]) {
      const context = await browser.newContext({ viewport: { width: viewportWidth, height: 1000 } });
      await context.addCookies([{ name: 'access_token', value: 'fixture-admin', url: origin, httpOnly: true }]);
      await context.addInitScript(() => localStorage.setItem('cookie-consent', 'rejected'));
      await context.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      async function capture(locator, name) {
        await locator.waitFor({ state: 'visible' });
        await page.evaluate(() => document.fonts.ready);
        const width = viewportWidth === 1366 ? 600 : 200;
        await locator.evaluate((element, width) => {
          element.style.width = `${width}px`;
          element.style.backgroundColor = 'white';
          element.style.caretColor = 'transparent';
        }, width);
        for (const image of await locator.locator('img[src]').all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate(async image => {
            try { await image.decode(); } catch { throw new Error(`Imagem de teste indisponível: ${image.getAttribute('src')}`); }
          });
        }
        await locator.scrollIntoViewIfNeeded();
        const data = await locator.evaluate(element => {
          const style = node => {
            const css = getComputedStyle(node);
            return [node.tagName, css.fontFamily, css.fontSize, css.fontWeight, css.lineHeight, css.color, css.textAlign, css.padding, css.margin, css.borderTopWidth, css.borderTopStyle, css.borderTopColor, Math.round(node.getBoundingClientRect().width * 100) / 100, Math.round(node.getBoundingClientRect().height * 100) / 100];
          };
          return { html: element.innerHTML.replace(/\sreferrerpolicy="[^"]*"/g, ''), style: style(element), children: [...element.querySelectorAll('p,table,td,th,img,sup,sub,ul,li')].map(style) };
        });
        // Compare at the same pixel origin without resampling fractional CSS transforms.
        // Metrics above still come from the real card before this screenshot-only move.
        const handle = await locator.elementHandle();
        await handle.evaluate(element => {
          const css = getComputedStyle(element);
          const placeholder = document.createComment('snapshot-position');
          element.before(placeholder);
          element.__parity = { placeholder, style: element.style.cssText };
          const font = { fontFamily: css.fontFamily, fontSize: css.fontSize, fontWeight: css.fontWeight, lineHeight: css.lineHeight, color: css.color };
          document.body.appendChild(element);
          Object.assign(element.style, font, { position: 'absolute', left: '0px', top: '0px', zIndex: '999999', transform: 'none' });
        });
        const png = await handle.screenshot({ path: path.join(artifacts, `${viewportWidth}-${name}.png`), animations: 'disabled', style: 'nextjs-portal { display: none !important; } *::before { background-image: none !important; }' });
        await handle.evaluate(element => {
          const state = element.__parity;
          state.placeholder.replaceWith(element);
          element.style.cssText = state.style;
          delete element.__parity;
        });
        return { data, png };
      }
      const cases = process.env.ODP_DOCX_SPACING_DATA ? [0, 1, 2, 3] : [0, 1, 2];
      for (const index of cases) {
        await page.goto(`${origin}/importacao-questoes/${importId}/preview`);
        const card = page.locator('.import-item-card').nth(index);
        const comment = card.locator('.import-content').last().locator('.tiptap');
        // Content arrives asynchronously after canonical image URLs are resolved.
        await comment.locator(index === 0 ? 'img[src]' : index === 3 ? 'p' : 'table').first().waitFor();
        const preview = await capture(comment, `preview-${index}`);
        let statement;
        if (index === 2) statement = await capture(card.locator('.import-content').first().locator('.tiptap'), 'preview-statement');
        for (const [route, button, name] of [
          [`/questions/view/${questionId(index)}`, 'Ver comentário', 'view'],
          [`/questoes/${questionId(index)}`, 'Ver comentário', 'management'],
          [`/cadernos/${bookId}?seq=${index + 1}`, 'Ver resolução', 'book'],
        ]) {
          await page.goto(`${origin}${route}`);
          await page.getByRole('button', { name: button }).click();
          const published = await capture(page.locator('.tiptap').last(), `${name}-${index}`);
          assert.deepEqual(published.data, preview.data, `${viewportWidth}px / ${name} / questão ${index + 1}: estrutura, estilos e dimensões`);
          assert.equal(published.png.equals(preview.png), true, `${viewportWidth}px / ${name} / questão ${index + 1}: pixels do conteúdo`);
          if (index === 2) {
            const publishedStatement = await capture(page.locator('.tiptap').first(), `${name}-statement`);
            assert.deepEqual(publishedStatement.data, statement.data, `${name}: enunciado com tabela, células mescladas, lista, expoentes e fórmula`);
            assert.equal(publishedStatement.png.equals(statement.png), true, `${name}: pixels do enunciado`);
          }
        }
      }
      checks.push(`${viewportWidth}px: preview e questions/view, administração e caderno têm HTML, estilos, dimensões e pixels iguais na mesma largura.`);
      await context.close();
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify({ checks, errors }, null, 2));
    console.log(JSON.stringify({ checks, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
