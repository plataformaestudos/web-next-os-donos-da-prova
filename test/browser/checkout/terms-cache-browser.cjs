const assert = require('node:assert/strict');
const { loadChromium } = require('./support.cjs');
const origin = 'http://localhost:3137';

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

(async () => {
  const browser = await loadChromium().launch({
    headless: true,
    ...(process.env.ODP_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.ODP_CHROMIUM_EXECUTABLE_PATH } : {}),
  });
  try {
    for (const width of [360, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1100 } });
      await context.addInitScript(() => {
        localStorage.setItem('cookie-consent', 'rejected');
        const actualNow = Date.now.bind(Date);
        window.termsTestOffset = 0;
        Date.now = () => actualNow() + window.termsTestOffset;
      });
      let requests = 0;
      let version = '1';
      let failNext = width === 1440;
      await context.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.pathname === '/terms') {
          requests++;
          if (failNext) {
            failNext = false;
            return route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Fixture temporariamente indisponível.' }) });
          }
          const document = { id: 'fixture-document', version, updatedAt: '2026-10-15T00:00:00Z', title: 'Termos de teste', content: 'Fixture local' };
          return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ data: Object.fromEntries(['termsOfUse', 'privacyPolicy', 'legalNotice', 'cancellationPolicy', 'acceptanceTerms', 'autoRenewalTerms'].map(key => [key, document])) }) });
        }
        if (url.hostname === 'viacep.com.br') return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ logradouro: 'Rua de teste', bairro: 'Centro', localidade: 'São Paulo', uf: 'SP' }) });
        return ['localhost', '127.0.0.1'].includes(url.hostname) ? route.continue() : route.abort();
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${origin}/cadastro`, { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Plano Plano Essencial', exact: true }).click();
      await until(() => page.getByRole('button', { name: 'Continuar', exact: true }).isEnabled());
      await page.getByRole('button', { name: 'Continuar', exact: true }).click();
      await page.getByLabel('Nome completo', { exact: true }).fill('Pessoa de teste');
      await masked(page, 'CPF', '52998224725');
      await masked(page, 'Telefone', '11987654321');
      await page.getByLabel('E-mail', { exact: true }).fill('terms@example.test');
      await masked(page, 'CEP', '01001000');
      await page.getByLabel('Número', { exact: true }).fill('123');
      await until(async () => await page.getByLabel('Rua', { exact: true }).inputValue() === 'Rua de teste');
      await page.getByLabel('Senha', { exact: true }).fill('Fixture1!');
      await page.getByLabel('Confirmar a senha', { exact: true }).fill('Fixture1!');
      await until(() => page.getByRole('button', { name: 'Continuar', exact: true }).isEnabled());
      assert.equal(requests, 0);
      await page.getByRole('button', { name: 'Continuar', exact: true }).click();
      const consent = page.getByRole('checkbox', { name: /Li e concordo com os/ });
      const billing = page.getByRole('checkbox', { name: 'Concordo com a cobrança automática após o período contratado.', exact: true });
      const submit = page.getByRole('button', { name: 'Confirmar e assinar', exact: true });
      const retry = page.getByRole('button', { name: 'Tentar novamente', exact: true });
      if (width === 1440) {
        await retry.waitFor();
        assert.equal(requests, 1, 'Erro não deve provocar tentativas automáticas repetidas');
        assert.equal(await submit.isEnabled(), false);
        await retry.click();
      }
      await consent.waitFor();
      const initialRequests = requests;
      await page.getByLabel('Nome no cartão', { exact: true }).fill('Pessoa de teste');
      await masked(page, 'Número do cartão', '4111111111111111');
      await masked(page, 'Validade', '1230');
      await masked(page, 'CVV', '123');
      await consent.check(); await billing.check();
      await until(() => submit.isEnabled());
      await page.evaluate(() => window.dispatchEvent(new Event('focus')));
      await page.getByRole('button', { name: 'Voltar', exact: true }).click();
      await page.getByRole('button', { name: 'Continuar', exact: true }).click();
      await until(() => submit.isEnabled());
      assert.equal(requests, initialRequests, 'Foco e retorno com cache válido não devem consultar /terms');
      assert(await consent.isChecked()); assert(await billing.isChecked());

      await page.getByRole('button', { name: 'Voltar', exact: true }).click();
      version = '2';
      await page.evaluate(() => { window.termsTestOffset += 6 * 60 * 1000; });
      await page.getByRole('button', { name: 'Continuar', exact: true }).click();
      await until(() => requests === initialRequests + 1);
      await consent.waitFor();
      await until(async () => !(await consent.isChecked()) && !(await billing.isChecked()));
      assert.equal(await submit.isEnabled(), false, 'Nova versão dos documentos requer novos aceites');
      await consent.check(); await billing.check();
      await until(() => submit.isEnabled());

      await page.getByRole('button', { name: 'Voltar', exact: true }).click();
      failNext = true;
      await page.evaluate(() => { window.termsTestOffset += 6 * 60 * 1000; });
      await page.getByRole('button', { name: 'Continuar', exact: true }).click();
      await retry.waitFor();
      assert.equal(await submit.isEnabled(), false, 'Erro ao atualizar termos deve bloquear a contratação');
      assert.equal(await consent.count(), 0);
      await retry.click();
      await consent.waitFor();
      await until(() => submit.isEnabled());
      assert.equal(requests, initialRequests + 3);
      assert.deepEqual(errors, []);
      console.log(`PASS termos ${width}: carga no pagamento, cache, aceites, expiração, nova versão e recuperação de erro (${requests} consultas)`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
