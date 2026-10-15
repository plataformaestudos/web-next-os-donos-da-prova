const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loadChromium, artifactsPath } = require('./support.cjs');
const origin = 'http://localhost:3137';
const artifacts = artifactsPath('plan-discount-selection');
fs.mkdirSync(artifacts, { recursive: true });
const results = [];

async function until(check) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await check()) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Estado esperado não foi alcançado');
}

async function masked(page, label, value) {
  const input = page.getByLabel(label, { exact: true });
  await input.fill('');
  await input.pressSequentially(value, { delay: 20 });
  await input.blur();
}

async function personalInfo(page, beforePayment) {
  await page.getByLabel('Nome completo', { exact: true }).fill('Pessoa de teste');
  await masked(page, 'CPF', '52998224725');
  await masked(page, 'Telefone', '11987654321');
  await page.getByLabel('E-mail', { exact: true }).fill('browser@example.test');
  await masked(page, 'CEP', '01001000');
  await page.getByLabel('Número', { exact: true }).fill('123');
  await until(async () => await page.getByLabel('Rua', { exact: true }).inputValue() === 'Rua de teste');
  await page.getByLabel('Senha', { exact: true }).fill('Fixture1!');
  await page.getByLabel('Confirmar a senha', { exact: true }).fill('Fixture1!');
  await until(() => page.getByRole('button', { name: 'Continuar', exact: true }).isEnabled());
  beforePayment?.();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
}

(async () => {
  const browser = await loadChromium().launch({
    headless: true,
    ...(process.env.ODP_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.ODP_CHROMIUM_EXECUTABLE_PATH } : {}),
  });
  try {
    for (const logged of [false, true]) for (const theme of ['light', 'dark']) for (const width of [360, 1440]) {
      const automatic = theme === 'dark';
      const context = await browser.newContext({ viewport: { width, height: 1200 } });
      await context.addInitScript(theme => {
        localStorage.setItem('theme', theme);
        localStorage.setItem('cookie-consent', 'rejected');
      }, theme);
      if (logged) await context.addCookies([{ name: 'access_token', value: 'local-fixture-only', url: origin, httpOnly: true }]);
      if (automatic) await context.addCookies([{ name: 'odp_referral', value: 'r'.repeat(43), url: origin, httpOnly: true }]);
      await context.route('**/*', route => {
        const host = new URL(route.request().url()).hostname;
        if (host === 'viacep.com.br') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ logradouro: 'Rua de teste', bairro: 'Centro', localidade: 'São Paulo', uf: 'SP' }) });
        return ['localhost', '127.0.0.1'].includes(host) ? route.continue() : route.abort();
      });
      const page = await context.newPage();
      const errors = [];
      const quoteSelections = [];
      let termsRequests = 0;
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => {
        if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/affiliate-referral/quote') quoteSelections.push(request.postDataJSON());
        if (new URL(request.url()).pathname === '/terms') termsRequests++;
      });
      await page.goto(origin + (logged ? '/assinatura?campaign=checkout' : '/cadastro'), { waitUntil: 'networkidle' });
      const code = page.getByRole('region', { name: 'Código de desconto', exact: true }).filter({ has: page.getByRole('textbox', { name: 'Tem um código de desconto?', exact: true }) });
      await until(async () => await code.getAttribute('aria-busy') === 'false');
      const card = logged ? page.getByRole('heading', { name: 'Plano Essencial', exact: true }).locator('..') : page.getByRole('button', { name: 'Plano Plano Essencial', exact: true });
      if (!automatic) {
        assert.equal(await card.locator('del').count(), 0);
        await code.getByRole('textbox').fill('checkout20');
        await code.getByRole('button', { name: 'Aplicar', exact: true }).click();
      }
      await card.getByLabel('Valor com desconto: R$ 31,12/mês', { exact: true }).waitFor();
      assert.equal((await card.locator('del').innerText()).replace(/\s/g, ''), 'R$38,90/mês');
      assert(await card.getByText('R$ 373,44 cobrados a cada 12 meses', { exact: true }).isVisible());
      assert(await card.getByText('Economize R$ 93,36 por ciclo', { exact: true }).isVisible());
      assert.equal((await context.cookies()).some(cookie => cookie.name === 'odp_referral_quote'), false, 'Prévia não pode substituir a cotação de contratação');
      const excludedCard = logged ? page.getByRole('heading', { name: 'Plano Semestral', exact: true }).locator('..') : page.getByRole('button', { name: 'Plano Plano Semestral', exact: true });
      assert.equal(await excludedCard.locator('del').count(), 0);
      assert(await excludedCard.getByText(/Desconto indisponível neste ciclo|não participam da campanha/).isVisible());
      if (!logged) assert.equal(await page.getByRole('button', { name: 'Plano Plano Free', exact: true }).locator('del').count(), 0);
      if (!logged) {
        for (const selection of [card, excludedCard, page.getByRole('button', { name: 'Plano Plano Free', exact: true }), card]) {
          await selection.click();
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          assert.equal(quoteSelections.length, 0, 'Selecionar cards deve reutilizar a prévia, sem consultar /quote');
        }
      }

      await code.getByRole('textbox').fill('invalid');
      await code.getByRole('button', { name: 'Aplicar', exact: true }).click();
      await code.getByText('A campanha anterior foi mantida.', { exact: true }).waitFor();
      assert(await card.getByLabel('Valor com desconto: R$ 31,12/mês', { exact: true }).isVisible());
      await code.getByRole('button', { name: 'Remover código', exact: true }).click();
      await until(async () => await code.getAttribute('aria-busy') === 'false');
      assert.equal(await card.locator('del').count(), 0);
      await code.getByRole('textbox').fill('fixed20');
      await code.getByRole('button', { name: 'Aplicar', exact: true }).click();
      await card.getByLabel('Valor com desconto: R$ 37,23/mês', { exact: true }).waitFor();
      assert(await card.getByText('R$ 446,80 cobrados a cada 12 meses', { exact: true }).isVisible());
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: `${artifacts}/${logged ? 'existing' : 'signup'}-${theme}-${width}-cards.png`, fullPage: true });
      assert.equal(quoteSelections.length, 0, 'Código e prévia não devem antecipar a cotação do pagamento');
      assert.equal(termsRequests, 0, 'Escolher planos não deve carregar termos de pagamento');

      if (logged) {
        await card.getByRole('button', { name: 'Assinar Plano', exact: true }).click();
        await page.getByRole('dialog', { name: 'Finalize sua assinatura', exact: true }).waitFor();
      } else {
        await page.getByRole('button', { name: 'Continuar', exact: true }).click();
        await personalInfo(page, () => {
          assert.equal(quoteSelections.length, 0, 'Dados pessoais não devem consultar /quote');
          assert.equal(termsRequests, 0, 'Dados pessoais não devem carregar termos de pagamento');
        });
      }
      const summary = page.getByRole('region', { name: 'Código de desconto', exact: true }).filter({ has: page.locator('.ant-alert-success') }).filter({ hasNot: page.getByRole('textbox') });
      await summary.getByText('R$ 446,80', { exact: true }).waitFor();
      assert(quoteSelections.length > 0, 'Entrar no pagamento deve obter a cotação final');
      if (!logged) {
        await page.getByRole('checkbox', { name: /Li e concordo com os/ }).waitFor();
        assert.equal(termsRequests, 1, 'A primeira entrada no pagamento carrega os termos uma vez');
        const beforeReturn = quoteSelections.length;
        await page.getByRole('button', { name: 'Voltar', exact: true }).click();
        await page.getByRole('button', { name: 'Voltar', exact: true }).click();
        await excludedCard.click();
        await page.getByRole('button', { name: 'Plano Plano Free', exact: true }).click();
        await card.click();
        await page.getByRole('button', { name: 'Continuar', exact: true }).click();
        await until(() => page.getByRole('button', { name: 'Continuar', exact: true }).isEnabled());
        assert.equal(quoteSelections.length, beforeReturn, 'Voltar e trocar cards não deve renovar a cotação');
        await page.getByRole('button', { name: 'Continuar', exact: true }).click();
        await summary.getByText('R$ 446,80', { exact: true }).waitFor();
        await page.getByRole('checkbox', { name: /Li e concordo com os/ }).waitFor();
        assert.equal(termsRequests, 1, 'Trocar Free/pago e voltar ao pagamento deve reutilizar os termos em cache');
        assert(quoteSelections.length > beforeReturn, 'Retornar ao pagamento deve validar novamente a seleção');
      }
      const cycle = page.getByRole('combobox', { name: 'Ciclo da assinatura', exact: true });
      await cycle.focus(); await cycle.press('ArrowDown');
      assert((await page.getByRole('option').filter({ hasText: 'Anual' }).innerText()).includes('446,80'));
      await page.getByRole('option').filter({ hasText: 'Trimestral' }).click();
      await page.getByText('Este plano e ciclo não participam da campanha. A contratação será pelo valor regular.', { exact: true }).waitFor();
      const regularCookie = (await context.cookies()).find(cookie => cookie.name === 'odp_referral_quote');
      assert(regularCookie && regularCookie.httpOnly);
      assert.equal(JSON.parse(decodeURIComponent(regularCookie.value)).regular, true);
      await cycle.focus(); await cycle.press('ArrowDown');
      await page.getByRole('option').filter({ hasText: 'Anual' }).click();
      await summary.getByText('R$ 446,80', { exact: true }).waitFor();
      await summary.getByRole('button', { name: 'Remover código', exact: true }).click();
      await until(async () => await page.locator('section[aria-label="Código de desconto"][aria-busy="true"]').count() === 0);
      assert.equal((await context.cookies()).some(cookie => cookie.name === 'odp_referral'), false);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.deepEqual(errors, []);
      results.push({ logged, theme, width, automatic, quoteSelections: quoteSelections.length, termsRequests, status: 'passed' });
      console.log(`PASS desconto ${logged ? 'existing' : 'signup'} ${theme} ${width}: prévia sem quote nos cards, pagamento, ciclos e remoção`);
      await context.close();
    }
  } finally {
    fs.writeFileSync(`${artifacts}/results.json`, JSON.stringify(results, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
