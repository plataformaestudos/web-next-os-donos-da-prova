const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loadChromium, artifactsPath } = require('./support.cjs');
const chromium = loadChromium();
const origin = 'http://localhost:3137';
const artifacts = artifactsPath('discount-prices');
fs.mkdirSync(artifacts, { recursive: true });
const results = [];
async function until(fn) {
  for (let count = 0; count < 100; count++) {
    if (await fn()) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Estado esperado não foi alcançado');
}
async function masked(page, label, value) {
  const input = page.getByLabel(label, { exact: true });
  await input.fill(''); await input.pressSequentially(value, { delay: 40 }); await input.blur();
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const logged of [false, true]) for (const theme of ['light', 'dark']) for (const width of [360, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1200 } });
      await context.addInitScript(theme => { localStorage.setItem('theme', theme); localStorage.setItem('cookie-consent', 'rejected'); }, theme);
      if (logged) await context.addCookies([{ name: 'access_token', value: 'local-fixture-only', url: origin, httpOnly: true }]);
      await context.route('**/*', route => {
        const hostname = new URL(route.request().url()).hostname;
        if (hostname === 'viacep.com.br') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ logradouro: 'Rua de teste', bairro: 'Centro', localidade: 'São Paulo', uf: 'SP' }) });
        return ['localhost', '127.0.0.1'].includes(hostname) ? route.continue() : route.abort();
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      if (logged) {
        await page.goto(origin + '/assinatura?campaign=checkout');
        await page.getByRole('button', { name: 'Assinar Plano', exact: true }).first().click();
        await page.getByRole('dialog', { name: 'Finalize sua assinatura', exact: true }).waitFor();
      } else {
        await page.goto(origin + '/cadastro');
        await page.getByRole('button', { name: 'Plano Plano Essencial', exact: true }).click();
        await page.getByRole('button', { name: 'Continuar', exact: true }).click();
        await page.getByLabel('Nome completo', { exact: true }).fill('Pessoa de teste');
        await masked(page, 'CPF', '52998224725'); await masked(page, 'Telefone', '11987654321');
        await page.getByLabel('E-mail', { exact: true }).fill('browser@example.test');
        await masked(page, 'CEP', '01001000'); await page.getByLabel('Número', { exact: true }).fill('123');
        await until(async () => await page.getByLabel('Rua', { exact: true }).inputValue() === 'Rua de teste');
        await page.getByLabel('Senha', { exact: true }).fill('Fixture1!');
        await page.getByLabel('Confirmar a senha', { exact: true }).fill('Fixture1!');
        await until(() => page.getByRole('button', { name: 'Continuar', exact: true }).isEnabled());
        await page.getByRole('button', { name: 'Continuar', exact: true }).click();
      }
      const discount = page.getByRole('region', { name: 'Código de desconto', exact: true });
      await until(async () => await discount.getAttribute('aria-busy') === 'false');
      await discount.getByRole('textbox', { name: 'Tem um código de desconto?', exact: true }).fill('checkout20');
      await discount.getByRole('button', { name: 'Aplicar', exact: true }).click();
      await until(async () => await discount.getAttribute('aria-busy') === 'false');
      const offer = discount.locator('.ant-alert-success');
      await offer.waitFor();
      assert.equal(await offer.locator('details').getAttribute('open'), null);
      assert(await offer.getByText('R$ 373,44', { exact: true }).isVisible());
      const original = offer.locator('del');
      assert.equal(await original.innerText(), 'R$\u00a0466,80');
      assert(await original.evaluate(element => getComputedStyle(element).textDecorationLine.includes('line-through')));
      const originalBox = await original.boundingBox();
      const finalBox = await offer.getByText('R$ 373,44', { exact: true }).boundingBox();
      assert(finalBox.x >= originalBox.x + originalBox.width);
      assert(Math.abs(finalBox.y - originalBox.y) < 5);
      assert(await offer.getByText('Código aplicado:', { exact: false }).isVisible());
      const height = await offer.evaluate(element => element.getBoundingClientRect().height);
      assert(height <= 200, `Bloco muito alto: ${height}`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: `${artifacts}/${logged ? 'modal' : 'signup'}-${theme}-${width}.png`, fullPage: true });
      const details = offer.locator('summary');
      await details.focus(); await details.press('Enter');
      await until(() => offer.locator('details').evaluate(element => element.open));
      await offer.getByText(/Valor regular por ciclo: R\$\s+466,80/).waitFor();
      assert(await offer.getByText(/A elegibilidade será confirmada na contratação/).isVisible());
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await details.press('Enter');
      await discount.getByRole('textbox', { name: 'Tem um código de desconto?', exact: true }).fill('invalid');
      await discount.getByRole('button', { name: 'Aplicar', exact: true }).click();
      await discount.getByText('O desconto anterior foi mantido.', { exact: true }).waitFor();
      assert(await offer.isVisible());
      await offer.getByRole('button', { name: 'Remover código', exact: true }).click();
      await until(async () => await discount.getAttribute('aria-busy') === 'false');
      assert.equal(await discount.locator('.ant-alert-success').count(), 0);
      assert.deepEqual(errors, []);
      results.push({ logged, theme, width, compactHeight: height, status: 'passed' });
      console.log(`PASS ${logged ? 'modal' : 'signup'} ${theme} ${width}: bloco ${height}px, detalhes, oferta mantida e remoção`);
      await context.close();
    }
  } finally {
    fs.writeFileSync(artifacts + '/results.json', JSON.stringify(results, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
