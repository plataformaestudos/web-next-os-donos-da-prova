const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');

function load(file, dependencies = {}) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } });
  const mod = { exports: {} };
  new Function('require', 'exports', 'module', outputText)(name => { if (!(name in dependencies)) throw Error(name); return dependencies[name]; }, mod.exports, mod);
  return mod.exports;
}
const parser = load('src/affiliates/referral-preview.ts');
const server = load('src/affiliates/referral-server.ts', { 'next/server': { NextRequest, NextResponse } });
const planId = '11111111-1111-4111-8111-111111111111';
const cycle = 'QUARTERLY';
const token = 'a'.repeat(43);
const price = { planId, cycle, available: true, baseAmountCents: 12000, discountAmountCents: 2000, finalAmountCents: 10000 };
const preview = (extra = {}) => ({ campaign: { title: 'Campanha', slug: 'campanha' }, prices: [price], expiresAt: new Date(Date.now() + 600_000).toISOString(), currency: 'BRL', eligibility: 'PRELIMINARY', ...extra });
const cookie = `odp_referral=${token}; odp_referral_quote=old-quote`;
function request(body = {}, headers = {}) {
  return new NextRequest('https://example.test/api/affiliate-referral/preview', { method: 'POST', headers: { origin: 'https://example.test', 'Content-Type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
}
function route(file, backend) {
  return load(`src/app/api/${file}/route.ts`, { 'next/server': { NextRequest, NextResponse }, '@/affiliates/referral-preview': parser, '@/affiliates/referral-server': { ...server, affiliateBackend: backend } });
}

test('batch preview keeps the active checkout quote untouched, uses cookie attribution and exposes only prices', async () => {
  let forwarded;
  const handler = route('affiliate-referral/preview', async (_, destination, body) => {
    forwarded = { destination, body };
    return NextResponse.json(preview({ quoteToken: 'private', referralToken: 'private', customers: ['private'] }));
  });
  const response = await handler.POST(request({}, { cookie }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('set-cookie'), null);
  assert.deepEqual(forwarded, { destination: '/affiliate-links/public/preview', body: { referralToken: token } });
  const visible = await response.json();
  assert.deepEqual(visible.prices, [price]);
  assert.equal(visible.active, true);
  for (const field of ['quoteToken', 'referralToken', 'customers']) assert.equal(visible[field], undefined);
});

test('no referral is a regular catalog, while a failed preview remains a failure', async () => {
  let called = false;
  const handler = route('affiliate-referral/preview', async () => { called = true; return NextResponse.json({ message: 'Offline' }, { status: 503 }); });
  assert.deepEqual(await (await handler.POST(request())).json(), { active: false });
  assert.equal(called, false);
  const failed = await handler.POST(request({}, { cookie }));
  assert.equal(failed.status, 503);
  assert.equal(failed.headers.get('set-cookie'), null);
  assert.equal((await failed.json()).active, undefined);
  for (const body of ['{', { referralToken: token }, { userId: 'forged' }, null]) assert.equal((await handler.POST(request(body, { cookie }))).status, 400);
  assert.equal((await handler.POST(request({}, { origin: 'https://evil.test', cookie }))).status, 403);
});

test('code can be applied before a plan selection and replaces attribution only after validating the complete preview', async () => {
  let forwarded;
  const result = preview({ referralToken: 'b'.repeat(43), referralExpiresAt: new Date(Date.now() + 86_400_000).toISOString() });
  const handler = route('affiliate-referral/apply-code', async (_, destination, body) => { forwarded = { destination, body }; return NextResponse.json(result); });
  const response = await handler.POST(request({ code: ' CAMPANHA ', referralToken: 'forged', planId: 'forged', userId: 'forged' }, { cookie }));
  assert.equal(response.status, 200);
  assert.deepEqual(forwarded, { destination: '/affiliate-links/public/apply-code', body: { code: ' CAMPANHA ', referralToken: token } });
  assert.equal(response.cookies.get('odp_referral').value, result.referralToken);
  assert.equal(response.cookies.get('odp_referral').httpOnly, true);
  assert.equal(response.cookies.get('odp_referral_quote').value, '');
  const visible = await response.json();
  assert.equal(visible.referralToken, undefined);
  assert.equal(visible.referralExpiresAt, undefined);
  assert.deepEqual(visible.prices, [price]);
  for (const invalid of [preview(), { ...result, prices: [{ ...price, finalAmountCents: 1 }] }, { ...result, referralExpiresAt: new Date(0).toISOString() }, { ...result, prices: [] }]) {
    const rejected = await route('affiliate-referral/apply-code', async () => NextResponse.json(invalid)).POST(request({ code: 'campanha' }, { cookie }));
    assert.equal(rejected.status, 502);
    assert.equal(rejected.headers.get('set-cookie'), null);
  }
  for (const status of [400, 404, 410, 429, 503]) {
    const failed = await route('affiliate-referral/apply-code', async () => NextResponse.json({ message: 'Indisponível' }, { status })).POST(request({ code: 'campanha' }, { cookie }));
    assert.equal(failed.status, status);
    assert.equal(failed.headers.get('set-cookie'), null);
  }
});

test('excluded plan and cycle establish an explicit regular checkout while keeping the referral for other selections', async () => {
  const response = await route('affiliate-referral/quote', async () => NextResponse.json({ message: 'Fora da oferta', code: 'AFFILIATE_SELECTION_EXCLUDED' }, { status: 400 })).POST(request({ planId, cycle }, { cookie }));
  assert.deepEqual(await response.json(), { active: false, excluded: true });
  assert.equal(response.cookies.get('odp_referral'), undefined);
  const regular = response.cookies.get('odp_referral_quote');
  assert.equal(regular.httpOnly, true);
  assert.equal(JSON.parse(regular.value).regular, true);
  let forwarded;
  const checkout = route('affiliate-checkout/[kind]', async (_, destination, body) => { forwarded = { destination, body }; return NextResponse.json({ ok: true }); });
  const checkoutCookie = `odp_referral=${token}; odp_referral_quote=${encodeURIComponent(regular.value)}`;
  const confirmed = await checkout.POST(request({ planId, cycle, referralToken: 'forged', quoteToken: 'forged', idempotencyKey: 'forged' }, { cookie: checkoutCookie }), { params: Promise.resolve({ kind: 'existing-user' }) });
  assert.equal(confirmed.status, 200);
  assert.deepEqual(forwarded, { destination: '/subscription', body: { planId, cycle } });
  assert.equal((await checkout.POST(request({ planId, cycle: 'YEARLY' }, { cookie: checkoutCookie }), { params: Promise.resolve({ kind: 'existing-user' }) })).status, 409);
  const expired = encodeURIComponent(JSON.stringify({ regular: true, planId, cycle, expiresAt: new Date(0).toISOString() }));
  assert.equal((await checkout.POST(request({ planId, cycle }, { cookie: `odp_referral=${token}; odp_referral_quote=${expired}` }), { params: Promise.resolve({ kind: 'existing-user' }) })).status, 409);
  const failed = await route('affiliate-referral/quote', async () => NextResponse.json({ message: 'Preço inválido' }, { status: 400 })).POST(request({ planId, cycle }, { cookie }));
  assert.equal(failed.status, 400);
  assert.equal(failed.cookies.get('odp_referral_quote').value, '');
});

test('preview parser rejects stale, inconsistent, duplicate or unbounded data and keeps valid unavailable selections', () => {
  assert.equal(parser.parseReferralPreview({ active: false }), undefined);
  assert.deepEqual(parser.parseReferralPreview({ ...preview({ prices: [{ planId, cycle, available: false }] }), active: true }).prices, [{ planId, cycle, available: false }]);
  for (const input of [null, preview({ active: true, prices: [price, price] }), preview({ active: true, prices: Array(101).fill(price) }), preview({ active: true, expiresAt: new Date(0).toISOString() }), preview({ active: true, prices: [{ ...price, finalAmountCents: '10000' }] }), preview({ active: true, prices: [{ ...price, finalAmountCents: 9999 }] })]) assert.throws(() => parser.parseReferralPreview(input));
});

test('discounted cards preserve their configured cycle and mode with a clear total, including rounding in cents', () => {
  const prices = load('src/plans/plan-price-display.ts');
  const plan = { monthValue: 50, quarterlyValue: 120, semiannualValue: null, annualValue: 420, cardDisplayCycle: 'YEARLY', cardDisplayMode: 'MONTHLY_EQUIVALENT' };
  assert.match(prices.getPlanCardPrice(plan, 33600).headline, /28,00\/mês/);
  assert.match(prices.getPlanCardPrice(plan, 33600).detail, /336,00 cobrados a cada 12 meses/);
  assert.equal(prices.getPlanCardPrice(plan, 33600).cycle, 'YEARLY');
  assert.match(prices.getPlanCardPrice({ ...plan, cardDisplayCycle: 'QUARTERLY', cardDisplayMode: 'CYCLE_TOTAL' }, 10000).headline, /100,00/);
  assert.match(prices.getPlanCardPrice({ ...plan, cardDisplayCycle: 'QUARTERLY' }, 10000).headline, /33,33\/mês/);
  assert.match(prices.getPlanCardPrice({ ...plan, cardDisplayCycle: 'MONTHLY' }, 4000).detail, /todo mês/);
});

const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const flush = async () => { for (let i = 0; i < 8; i += 1) await new Promise(setImmediate); };
function renderProvider(network) {
  const slots = []; const effects = []; let cursor = 0; let scheduled = false; let tree;
  const schedule = () => { if (!scheduled) { scheduled = true; queueMicrotask(() => { scheduled = false; render(); }); } };
  const same = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  const hooks = {
    createContext: () => ({ Provider: 'Provider' }),
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; schedule(); }]; },
    useRef(initial) { const i = cursor++; if (!(i in slots)) slots[i] = { current: initial }; return slots[i]; },
    useCallback(callback, deps) { const i = cursor++; if (!slots[i] || !same(slots[i].deps, deps)) slots[i] = { callback, deps }; return slots[i].callback; },
    useEffect(effect, deps) { const i = cursor++; const previous = slots[i]; if (!previous || !same(previous.deps, deps)) { slots[i] = { deps, cleanup: previous?.cleanup }; effects.push(() => { slots[i].cleanup?.(); slots[i].cleanup = effect(); }); } },
  };
  const api = load('src/affiliates/referral-request-queue.ts');
  const jsx = (type, props) => ({ type, props });
  const Provider = load('src/affiliates/referral-plans.component.tsx', {
    react: hooks, 'react/jsx-runtime': { jsx, jsxs: jsx }, antd: {}, './referral-preview': parser,
    './referral-request-queue': api, '@/plans/plan-price-display': {}, './referral-quote.module.css': { default: {} },
  }).ReferralPlansProvider;
  global.fetch = network;
  function render() { cursor = 0; tree = Provider({ children: null }); while (effects.length) effects.shift()(); }
  render();
  return { state: () => tree.props.value, unmount: () => slots.forEach(slot => slot?.cleanup?.()), api };
}

test('plan preview keeps mutations serialized, preserves a valid campaign for invalid code, and blocks uncertain network outcomes', async t => {
  const previousFetch = global.fetch; const previousWindow = global.window;
  global.window = { setTimeout: () => 0, clearTimeout: () => {} };
  t.after(() => { global.fetch = previousFetch; global.window = previousWindow; });
  let count = 0;
  const wait = deferred(); const calls = [];
  const view = renderProvider(async (url, options) => {
    calls.push({ url, method: options.method, body: options.body });
    count += 1;
    if (count === 1) return NextResponse.json({ ...preview(), active: true });
    if (count === 2) return NextResponse.json({ message: 'Código inválido' }, { status: 404 });
    if (count === 3) throw Error('Conexão interrompida');
    if (count === 4) return wait.promise;
    return NextResponse.json({ active: false });
  });
  t.after(view.unmount);
  await flush();
  assert.equal(view.state().valid, true);
  view.state().run('apply', 'invalid'); await flush();
  assert.equal(view.state().valid, true);
  assert.equal(view.state().preview.campaign.slug, 'campanha');
  view.state().run('apply', 'campanha'); await flush();
  assert.equal(view.state().valid, false);
  assert.equal(view.state().preview, undefined);
  view.state().run('apply', 'campanha'); await flush();
  view.state().run('remove'); await flush();
  assert.equal(calls.length, 4);
  wait.resolve(NextResponse.json({ ...preview(), active: true })); await flush();
  assert.equal(calls[4].method, 'DELETE');
  assert.equal(view.state().valid, true);
  assert.equal(view.state().preview, undefined);
  assert.equal(view.api.referralRequestQueue.getPending(), 0);
});

test('only the precise new public routes are available to anonymous signup', () => {
  const { middleware } = load('src/middleware.ts', { 'next/server': { NextRequest, NextResponse } });
  for (const path of ['preview', 'apply-code']) assert.equal(middleware(new NextRequest(`https://example.test/api/affiliate-referral/${path}`)).headers.get('x-middleware-next'), '1');
  assert.equal(middleware(new NextRequest('https://example.test/api/affiliate-referral/private')).status, 307);
});

test('final quotation reconciles a changed price or exclusion without a revision loop or stale cycle price', async t => {
  const previousFetch = global.fetch; const previousWindow = global.window;
  global.window = { setTimeout: () => 0, clearTimeout: () => {} };
  t.after(() => { global.fetch = previousFetch; global.window = previousWindow; });
  let calls = 0;
  const view = renderProvider(async () => { calls += 1; return NextResponse.json({ ...preview(), active: true }); });
  t.after(view.unmount);
  await flush();
  const revision = view.state().revision;
  view.state().reconcileQuote(planId, cycle, { campaign: preview().campaign, baseAmountCents: 12000, discountAmountCents: 3000, finalAmountCents: 9000 }, false);
  await flush();
  assert.equal(parser.previewPrice(view.state().preview, planId, cycle).finalAmountCents, 9000);
  assert.equal(view.state().revision, revision);
  assert.equal(calls, 1);
  view.state().reconcileQuote(planId, cycle, undefined, true); await flush();
  assert.equal(parser.previewPrice(view.state().preview, planId, cycle), undefined);
  assert.equal(view.state().preview.prices.length, 0);
  assert.equal(view.state().revision, revision);
  assert.equal(calls, 1);
  view.state().reconcileQuote(planId, cycle, undefined, false); await flush();
  assert.equal(view.state().preview, undefined);
});
