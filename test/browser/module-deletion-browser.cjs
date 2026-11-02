const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadChromium } = require('./checkout/support.cjs');
const origin = 'http://127.0.0.1:3139';
const artifacts = process.env.ODP_MODULE_DELETION_ARTIFACTS || '/tmp/odp-module-deletion-browser-artifacts';
fs.mkdirSync(artifacts, { recursive: true });
const checks = [], errors = [];
const fixture = async (body) => (await fetch('http://127.0.0.1:4039/__state', body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : undefined)).json();

(async () => {
  const browser = await loadChromium().launch({ headless: true, ...(process.env.ODP_CHROMIUM_PATH ? { executablePath: process.env.ODP_CHROMIUM_PATH } : {}) });
  try {
    async function pageFor(role, width = 1366) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.addCookies([{ name: 'access_token', value: `fixture-${role}`, url: origin, httpOnly: true }]);
      await context.addInitScript(() => localStorage.setItem('cookie-consent', 'rejected'));
      await context.route('**/*', route => ['127.0.0.1', 'localhost'].includes(new URL(route.request().url()).hostname) ? route.continue() : route.abort());
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${origin}/modules`, { waitUntil: 'networkidle' });
      return { context, page };
    }
    async function openDelete(page) {
      const row = page.locator('.ant-tree-treenode').filter({ hasText: 'Módulo de teste' });
      await row.getByRole('button').last().click();
      await page.getByRole('button', { name: 'Apagar', exact: true }).click();
      await page.getByRole('dialog').waitFor();
      await page.waitForFunction(() => Array.from(document.querySelectorAll('.ant-modal')).some(element => {
        const style = getComputedStyle(element);
        return style.animationName === 'none' && style.transform === 'none' && style.opacity === '1'
          && element.getBoundingClientRect().width >= 320;
      }));
    }
    await fixture({});
    let { context, page } = await pageFor('admin');
    await openDelete(page);
    const dialog = page.getByRole('dialog');
    await dialog.getByText('7 resposta(s) de alunos.').waitFor();
    await dialog.getByText(/2 questão.*compartilhada/).waitFor();
    await dialog.screenshot({ path: path.join(artifacts, 'dialog-desktop.png') });
    await page.screenshot({ path: path.join(artifacts, 'confirmation-desktop.png'), fullPage: true, animations: 'disabled' });
    await dialog.getByRole('button', { name: 'Cancelar' }).click();
    assert.equal((await fixture()).deletes, 0);
    checks.push('Admin sees impact and cancel never deletes');
    await fixture({ conflict: true });
    await openDelete(page);
    await page.getByRole('button', { name: 'Excluir definitivamente', exact: true }).click();
    await page.getByText('O conteúdo mudou. Confira o impacto atualizado antes de excluir.', { exact: true }).waitFor();
    await page.waitForFunction(async () => (await (await fetch('http://127.0.0.1:4039/__state')).json()).previews >= 2);
    await page.getByRole('dialog').waitFor();
    assert.equal((await fixture()).previews, 2);
    assert.equal((await fixture()).deleted, false);
    checks.push('Conflict reloads the impact without deleting');
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();
    await context.close();

    await fixture({ blocked: true });
    ({ context, page } = await pageFor('admin', 390));
    await openDelete(page);
    assert.equal(await page.getByRole('button', { name: 'Excluir definitivamente', exact: true }).isDisabled(), true);
    await page.getByRole('dialog').screenshot({ path: path.join(artifacts, 'dialog-mobile.png') });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: path.join(artifacts, 'blocked-mobile.png'), fullPage: true, animations: 'disabled' });
    checks.push('Active import blocks confirmation on mobile without overflow');
    await context.close();

    await fixture({});
    ({ context, page } = await pageFor('collaborator'));
    await page.locator('.ant-tree-treenode').filter({ hasText: 'Módulo de teste' }).getByRole('button').last().click();
    assert.equal(await page.getByRole('button', { name: 'Apagar', exact: true }).count(), 0);
    assert.equal((await fixture()).previews, 0);
    checks.push('Collaborator does not see the destructive action');
    await context.close();

    await fixture({});
    ({ context, page } = await pageFor('admin'));
    await openDelete(page);
    await page.getByRole('button', { name: 'Excluir definitivamente', exact: true }).click();
    await page.getByText('Módulo e conteúdo exclusivo excluídos definitivamente.', { exact: true }).waitFor();
    await page.getByText('Módulo de teste', { exact: true }).waitFor({ state: 'hidden' });
    assert.equal((await fixture()).deletes, 1);
    checks.push('Successful deletion removes the module and refreshes the tree');
    await context.close();
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(artifacts, 'results.json'), JSON.stringify({ checks, errors }, null, 2));
    console.log(JSON.stringify({ checks, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
