const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function load(file, dependencies = {}, fetchMock) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  });
  const mod = { exports: {} };
  new Function('require', 'exports', 'module', 'fetch', outputText)(name => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  }, mod.exports, mod, fetchMock);
  return mod.exports;
}

const dto = { planId: 'fixture-free', billingType: 'FREE', userInfo: { email: 'fixture@example.test', password: 'fixture-only-password' } };

for (const confirmationRequired of [true, false, undefined]) {
  test(`successful signup remains successful without logging in (confirmation=${confirmationRequired})`, async () => {
    const calls = [];
    const payload = { statusCode: 201, data: { emailConfirmationRequired: confirmationRequired }, error: null };
    const { signUpClient } = load('src/signup/signup.action.ts', {}, async (...args) => {
      calls.push(args);
      if (args[0] !== '/api/affiliate-checkout/new-user') throw Error('Automatic login must not be attempted');
      return { ok: true, json: async () => payload };
    });
    assert.deepEqual(await signUpClient(dto), { success: true, error: null, payload });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][1].method, 'POST');
    assert.deepEqual(JSON.parse(calls[0][1].body), dto);
  });
}

test('a real signup failure is still presented as failure and does not attempt login', async t => {
  const original = console.error;
  console.error = () => {};
  t.after(() => { console.error = original; });
  let requests = 0;
  const { signUpClient } = load('src/signup/signup.action.ts', {}, async () => {
    requests++;
    return { ok: false, json: async () => ({ message: 'Já existe uma conta com este e-mail.' }) };
  });
  assert.deepEqual(await signUpClient(dto), { success: false, error: 'Já existe uma conta com este e-mail.' });
  assert.equal(requests, 1);
});

test('legacy error envelopes surface their useful error instead of the generic message', async t => {
  const original = console.error;
  console.error = () => {};
  t.after(() => { console.error = original; });
  const { signUpClient } = load('src/signup/signup.action.ts', {}, async () => ({
    ok: false,
    json: async () => ({ statusCode: 400, message: 'error', error: 'Já existe uma conta com este e-mail.', data: {} }),
  }));
  assert.deepEqual(await signUpClient(dto), { success: false, error: 'Já existe uma conta com este e-mail.' });
});

test('success status stores only a next-step enum and is cleared for a new signup', t => {
  const original = global.window;
  t.after(() => { global.window = original; });
  const saved = new Map();
  global.window = { sessionStorage: { setItem: (key, value) => saved.set(key, value), getItem: key => saved.get(key), removeItem: key => saved.delete(key) } };
  const state = load('src/signup/signup-success.state.ts');
  for (const [confirmation, status] of [[true, 'confirmation-required'], [false, 'login'], [undefined, 'unknown']]) {
    state.saveSignupSuccessStatus(state.signupSuccessStatus(confirmation));
    assert.equal(saved.size, 1);
    assert.equal([...saved.values()][0], status);
    assert.equal(state.readSignupSuccessStatus(), status);
  }
  saved.set('odp.signup.success', 'not-an-allowed-state');
  assert.equal(state.readSignupSuccessStatus(), 'unknown');
  state.clearSignupSuccessStatus();
  assert.equal(saved.size, 0);
});

test('unavailable browser storage never turns the completed signup into an error', t => {
  const original = global.window;
  t.after(() => { global.window = original; });
  global.window = { get sessionStorage() { throw new Error('Storage denied'); } };
  const state = load('src/signup/signup-success.state.ts');
  assert.doesNotThrow(() => state.saveSignupSuccessStatus('confirmation-required'));
  assert.doesNotThrow(() => state.clearSignupSuccessStatus());
  assert.equal(state.readSignupSuccessStatus(), 'unknown');
});

function successPage(status) {
  const { default: Page } = load('src/app/(public)/signup/success/page.tsx', {
    './page.style': Object.fromEntries(['Container', 'Card', 'IconContainer', 'MessageContainer', 'ButtonContainer'].map(key => [key, 'div'])),
    antd: { Button: ({ children, onClick }) => React.createElement('button', { onClick }, children) },
    '@ant-design/icons': { CheckCircleOutlined: () => null },
    'next/navigation': { useRouter: () => ({ push() {} }) },
    '@/signup/checkout-brand.component': { default: () => null },
    '@/signup/signup.style': { StageHeading: 'h1' },
    react: { useState: () => [status, () => {}], useEffect: () => {} },
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/signup/signup-success.state': { readSignupSuccessStatus: () => status },
  });
  return renderToStaticMarkup(React.createElement(Page));
}

test('success guidance distinguishes confirmation and login without claiming payment approval', () => {
  const confirmation = successPage('confirmation-required');
  assert.match(confirmation, /Confirme seu e-mail antes de entrar/);
  assert.match(confirmation, /caixa de entrada e a pasta de spam/);
  const login = successPage('login');
  assert.match(login, /Entre na sua conta/);
  assert.doesNotMatch(login, /Confirme seu e-mail/);
  assert.match(successPage('unknown'), /Caso seja necessário confirmar seu e-mail/);
  for (const status of ['confirmation-required', 'login', 'unknown']) {
    const html = successPage(status);
    assert.match(html, /Ir para o login/);
    assert.doesNotMatch(html, /pagamento aprovado|fixture@example|fixture-only-password/i);
  }
});
