const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');

function load(file, dependencies) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  const mod = { exports: {} };
  new Function('require', 'exports', 'module', outputText)(name => {
    if (!(name in dependencies)) throw Error(name);
    return dependencies[name];
  }, mod.exports, mod);
  return mod.exports;
}
const server = load('src/affiliates/referral-server.ts', { 'next/server': { NextRequest, NextResponse } });
const planId = '11111111-1111-4111-8111-111111111111';
const quoteId = '22222222-2222-4222-8222-222222222222';
const referral = 'a'.repeat(43);
const signed = `payload.${'b'.repeat(64)}`;
function offer(extra = {}) {
  return { planId, cycle: 'QUARTERLY', quoteId, quoteToken: signed, expiresAt: new Date(Date.now() + 600_000).toISOString(), referralToken: 'c'.repeat(43), referralExpiresAt: new Date(Date.now() + 86_400_000).toISOString(), campaign: { title: 'Campanha', slug: 'campanha' }, baseAmountCents: 12000, discountAmountCents: 2000, finalAmountCents: 10000, ...extra };
}
function route(file, backend) {
  return load(file, { 'next/server': { NextRequest, NextResponse }, '@/affiliates/referral-server': { ...server, affiliateBackend: backend } });
}
function request(body, extra = {}) {
  return new NextRequest('https://example.test/api/affiliate-referral/code', {
    method: 'POST', headers: { origin: 'https://example.test', 'Content-Type': 'application/json', ...extra }, body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}
const codeFile = 'src/app/api/affiliate-referral/code/route.ts';
const quoteFile = 'src/app/api/affiliate-referral/quote/route.ts';
const checkoutFile = 'src/app/api/affiliate-checkout/[kind]/route.ts';
const selected = { planId, cycle: 'QUARTERLY' };
const oldCookies = `odp_referral=${referral}; odp_referral_quote=${encodeURIComponent(JSON.stringify({ ...selected, quoteId, quoteToken: signed }))}`;

test('manual code takes attribution from cookies and atomically replaces both cookies on valid success', async () => {
  let forwarded;
  const data = offer();
  const handler = route(codeFile, async (_, destination, body) => { forwarded = { destination, body }; return NextResponse.json(data); });
  const response = await handler.POST(request({ ...selected, code: ' CAMPANHA ', referralToken: 'forged', quoteToken: 'forged', idempotencyKey: 'forged' }, { cookie: oldCookies }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(forwarded, { destination: '/affiliate-links/public/code', body: { ...selected, code: ' CAMPANHA ', referralToken: referral } });
  const visible = await response.json();
  assert.equal(visible.active, true);
  assert.equal(visible.finalAmountCents, 10000);
  assert.equal(visible.referralToken, undefined);
  assert.equal(visible.quoteToken, undefined);
  assert.equal(visible.referralExpiresAt, undefined);
  const cookies = response.cookies.getAll();
  assert.equal(cookies.length, 2);
  for (const cookie of cookies) { assert.equal(cookie.httpOnly, true); assert.equal(cookie.sameSite, 'lax'); assert.equal(cookie.path, '/'); }
  assert.equal(response.cookies.get('odp_referral').value, data.referralToken);
  assert.deepEqual(JSON.parse(response.cookies.get('odp_referral_quote').value), { ...selected, quoteId, quoteToken: signed, expiresAt: data.expiresAt });
});

test('first code does not accept browser supplied attribution and ignores malformed old referral cookie', async () => {
  for (const cookie of ['', 'odp_referral=malformed']) {
    let forwarded;
    const handler = route(codeFile, async (_, __, body) => { forwarded = body; return NextResponse.json(offer()); });
    const response = await handler.POST(request({ ...selected, code: 'campanha', referralToken: referral }, { cookie }));
    assert.equal(response.status, 200);
    assert.deepEqual(forwarded, { ...selected, code: 'campanha' });
  }
});

test('invalid, paused or unavailable code preserves previous referral and quote cookies', async () => {
  for (const status of [400, 404, 410, 429, 503]) {
    const handler = route(codeFile, async () => server.referralJson({ message: 'Código indisponível' }, status));
    const response = await handler.POST(request({ ...selected, code: 'campanha' }, { cookie: oldCookies }));
    assert.equal(response.status, status);
    assert.equal(response.headers.get('set-cookie'), null);
  }
});

test('malformed backend success, expired tokens or mismatching plan/cycle cannot replace cookies', async () => {
  for (const data of [null, offer({ planId: quoteId }), offer({ cycle: 'MONTHLY' }), offer({ referralToken: 'unsafe;token' }), offer({ quoteToken: 'unsigned' }), offer({ expiresAt: new Date(0).toISOString() }), offer({ referralExpiresAt: 'invalid' }), offer({ referralExpiresAt: new Date(Date.now() + 1000).toISOString() }), offer({ finalAmountCents: 1 })]) {
    const response = await route(codeFile, async () => NextResponse.json(data)).POST(request({ ...selected, code: 'campanha' }, { cookie: oldCookies }));
    assert.equal(response.status, 502);
    assert.equal(response.headers.get('set-cookie'), null);
  }
  const response = await route(codeFile, async () => new NextResponse('not json')).POST(request({ ...selected, code: 'campanha' }));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get('set-cookie'), null);
});

test('malformed payloads and cross-site requests never reach backend or change cookies', async () => {
  let called = false;
  const handler = route(codeFile, async () => { called = true; });
  for (const payload of ['{', 'null', '[]', { ...selected, code: '' }, { ...selected, code: 'one two' }, { ...selected, code: 'a'.repeat(101) }, { ...selected, code: 'campanha', cycle: 'LIFETIME' }, { ...selected, code: 'campanha', planId: 'bad' }]) {
    const response = await handler.POST(request(payload, { cookie: oldCookies }));
    assert.equal(response.status, 400);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal(response.headers.get('set-cookie'), null);
  }
  for (const headers of [{ origin: 'https://evil.test' }, { 'sec-fetch-site': 'cross-site' }]) {
    const response = await handler.POST(request({ ...selected, code: 'campanha' }, headers));
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('set-cookie'), null);
  }
  assert.equal(called, false);
});

test('plan/cycle quote refresh only writes matching validated quote; failures clear quote and retain referral', async () => {
  let forwarded;
  const data = offer({ cycle: 'YEARLY' });
  const response = await route(quoteFile, async (_, destination, body) => { forwarded = { destination, body }; return NextResponse.json(data); }).POST(request({ planId, cycle: 'YEARLY', referralToken: 'forged' }, { cookie: oldCookies }));
  assert.deepEqual(forwarded, { destination: '/affiliate-links/public/quote', body: { planId, cycle: 'YEARLY', referralToken: referral } });
  assert.equal(response.cookies.get('odp_referral'), undefined);
  assert.equal(JSON.parse(response.cookies.get('odp_referral_quote').value).cycle, 'YEARLY');
  assert.equal((await response.json()).quoteToken, undefined);
  for (const backend of [async () => server.referralJson({ message: 'Plano indisponível' }, 400), async () => NextResponse.json(offer({ cycle: 'MONTHLY' }))]) {
    const failed = await route(quoteFile, backend).POST(request(selected, { cookie: oldCookies }));
    assert.equal(failed.cookies.get('odp_referral'), undefined);
    assert.equal(failed.cookies.get('odp_referral_quote').maxAge, 0);
  }
});

test('quote route rejects malformed requests and no referral means no offer', async () => {
  let called = false;
  const handler = route(quoteFile, async () => { called = true; });
  for (const body of ['{', '[]', { ...selected, cycle: 'LIFETIME' }]) assert.equal((await handler.POST(request(body))).status, 400);
  assert.deepEqual(await (await handler.POST(request(selected))).json(), { active: false });
  assert.equal(called, false);
});

test('explicit removal clears both cookies and cross-origin removal is denied', async () => {
  const handler = route(quoteFile, async () => { throw Error('not called'); });
  const response = await handler.DELETE(new NextRequest('https://example.test/api/affiliate-referral/quote', { method: 'DELETE', headers: { cookie: oldCookies, origin: 'https://example.test' } }));
  assert.deepEqual(await response.json(), { active: false });
  for (const name of ['odp_referral', 'odp_referral_quote']) { assert.equal(response.cookies.get(name).maxAge, 0); assert.equal(response.cookies.get(name).httpOnly, true); }
  const denied = await handler.DELETE(new NextRequest('https://example.test/api/affiliate-referral/quote', { method: 'DELETE', headers: { origin: 'https://evil.test' } }));
  assert.equal(denied.status, 403);
  assert.equal(denied.headers.get('set-cookie'), null);
});

test('checkout rejects absent, tampered, expired or stale plan/cycle quotes before payment', async () => {
  let called = false;
  const handler = route(checkoutFile, async () => { called = true; return NextResponse.json({ ok: true }); });
  for (const quote of [undefined, '{', { ...selected, quoteId, quoteToken: 'forged' }, { ...selected, quoteId, quoteToken: signed, expiresAt: new Date(0).toISOString() }, { ...selected, planId: quoteId, quoteId, quoteToken: signed }, { ...selected, cycle: 'MONTHLY', quoteId, quoteToken: signed }]) {
    const cookie = `odp_referral=${referral}${quote === undefined ? '' : `; odp_referral_quote=${encodeURIComponent(typeof quote === 'string' ? quote : JSON.stringify(quote))}`}`;
    const response = await handler.POST(request({ ...selected, referralToken: 'forged', quoteToken: signed, idempotencyKey: 'forged' }, { cookie }), { params: Promise.resolve({ kind: 'new-user' }) });
    assert.equal(response.status, 409);
    assert.equal(response.headers.get('set-cookie'), null);
  }
  assert.equal(called, false);
});

test('code cookies can be used for checkout and only cookie quote controls attribution/idempotency', async () => {
  const response = await route(codeFile, async () => NextResponse.json(offer())).POST(request({ ...selected, code: 'campanha' }));
  const cookie = response.cookies.getAll().map(({ name, value }) => `${name}=${encodeURIComponent(value)}`).join('; ');
  let forwarded;
  const checkout = await route(checkoutFile, async (_, destination, body) => { forwarded = { destination, body }; return NextResponse.json({ ok: true }); }).POST(request({ ...selected, referralToken: 'forged', quoteToken: 'forged', idempotencyKey: 'forged' }, { cookie }), { params: Promise.resolve({ kind: 'existing-user' }) });
  assert.equal(checkout.status, 200);
  assert.deepEqual(forwarded, { destination: '/subscription', body: { ...selected, referralToken: 'c'.repeat(43), quoteToken: signed, idempotencyKey: quoteId } });
  assert.equal(checkout.cookies.get('odp_referral_quote').maxAge, 0);
});

test('regular checkout removes forged attribution but retains its regular retry key', async () => {
  let forwarded;
  const handler = route(checkoutFile, async (_, __, body) => { forwarded = body; return NextResponse.json({ ok: true }); });
  const response = await handler.POST(request({ ...selected, referralToken: referral, quoteToken: signed, idempotencyKey: 'regular-retry' }), { params: Promise.resolve({ kind: 'new-user' }) });
  assert.equal(response.status, 200);
  assert.deepEqual(forwarded, { ...selected, idempotencyKey: 'regular-retry' });
  assert.equal((await handler.POST(request('{'), { params: Promise.resolve({ kind: 'new-user' }) })).status, 400);
});

test('Free signup forwards only cookie referral without quotation and preserves indication cookies', async () => {
  for (const cookie of [`odp_referral=${referral}`, oldCookies]) {
    let forwarded;
    const response = await route(checkoutFile, async (_, destination, body) => { forwarded = { destination, body }; return NextResponse.json({ ok: true }); }).POST(request({ planId, billingType: 'FREE', referralToken: 'forged', quoteToken: 'forged', idempotencyKey: 'forged' }, { cookie }), { params: Promise.resolve({ kind: 'new-user' }) });
    assert.equal(response.status, 200);
    assert.deepEqual(forwarded, { destination: '/subscription/new-user', body: { planId, billingType: 'FREE', referralToken: referral } });
    assert.equal(response.headers.get('set-cookie'), null);
  }
  const rejected = await route(checkoutFile, async () => server.referralJson({ message: 'Plano pago não admite cadastro Free' }, 400)).POST(request({ planId, billingType: 'FREE' }, { cookie: oldCookies }), { params: Promise.resolve({ kind: 'new-user' }) });
  assert.equal(rejected.status, 400);
  assert.equal(rejected.headers.get('set-cookie'), null);
});

test('anonymous code endpoint is public without exposing other referral endpoints', () => {
  const { middleware } = load('src/middleware.ts', { 'next/server': { NextRequest, NextResponse } });
  assert.equal(middleware(new NextRequest('https://example.test/api/affiliate-referral/code')).headers.get('x-middleware-next'), '1');
  assert.equal(middleware(new NextRequest('https://example.test/api/affiliate-referral/private')).status, 307);
});
