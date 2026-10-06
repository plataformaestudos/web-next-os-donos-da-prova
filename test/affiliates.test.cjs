const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');
function load(file, dependencies) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  const mod = { exports: {} };
  new Function('require', 'exports', 'module', outputText)(name => { if (!(name in dependencies)) throw Error(name); return dependencies[name]; }, mod.exports, mod);
  return mod.exports;
}
function checkout(backend) {
  return load('src/app/api/affiliate-checkout/[kind]/route.ts', {
    'next/server': { NextRequest, NextResponse },
    '@/affiliates/referral-server': { REFERRAL_COOKIE: 'odp_referral', QUOTE_COOKIE: 'odp_referral_quote', affiliateBackend: backend },
  }).POST;
}
test('checkout forwards only server cookie attribution and matching signed quote', async () => {
  let forwarded;
  const route = checkout(async (_, destination, body) => { forwarded = { destination, body }; return NextResponse.json({ ok: true }); });
  const quote = encodeURIComponent(JSON.stringify({ planId: 'plan', cycle: 'QUARTERLY', quoteToken: 'signed', quoteId: 'quote' }));
  await route(new NextRequest('https://example.test/api/affiliate-checkout/existing-user', { method: 'POST', headers: { cookie: `odp_referral=server-token; odp_referral_quote=${quote}`, origin: 'https://example.test', 'Content-Type': 'application/json' }, body: JSON.stringify({ planId: 'plan', cycle: 'QUARTERLY', referralToken: 'forged', quoteToken: 'forged' }) }), { params: Promise.resolve({ kind: 'existing-user' }) });
  assert.equal(forwarded.destination, '/subscription');
  assert.deepEqual(forwarded.body, { planId: 'plan', cycle: 'QUARTERLY', referralToken: 'server-token', quoteToken: 'signed', idempotencyKey: 'quote' });
});
test('checkout rejects another website before reaching payment backend', async () => {
  let called = false;
  const response = await checkout(async () => { called = true; })(new NextRequest('https://example.test/api/affiliate-checkout/new-user', { method: 'POST', headers: { origin: 'https://evil.test' }, body: '{}' }), { params: Promise.resolve({ kind: 'new-user' }) });
  assert.equal(response.status, 403); assert.equal(called, false);
});
test('changing billing cycle cannot reuse previous signed quote', async () => {
  let forwarded;
  const quote = encodeURIComponent(JSON.stringify({ planId: 'plan', cycle: 'MONTHLY', quoteToken: 'old' }));
  await checkout(async (_, __, body) => { forwarded = body; return NextResponse.json({ ok: true }); })(new NextRequest('https://example.test/api/affiliate-checkout/new-user', { method: 'POST', headers: { cookie: `odp_referral=ref; odp_referral_quote=${quote}` }, body: JSON.stringify({ planId: 'plan', cycle: 'YEARLY' }) }), { params: Promise.resolve({ kind: 'new-user' }) });
  assert.equal(forwarded.quoteToken, undefined); assert.equal(forwarded.referralToken, 'ref');
});
test('quarterly offer summary explains regular price, discount, final amount and first charge cadence', () => {
  const prices = load('src/plans/plan-price-display.ts', {});
  const { quoteSummary } = load('src/affiliates/quote-summary.ts', { '@/plans/plan-price-display': prices });
  const result = quoteSummary('QUARTERLY', { baseAmountCents: 12990, discountAmountCents: 2598, finalAmountCents: 10392 });
  assert.match(result, /Valor regular por ciclo: R\$\s129,90/);
  assert.match(result, /Desconto por ciclo: R\$\s25,98/);
  assert.match(result, /Valor final: R\$\s103,92 cobrados a cada 3 meses/);
  assert.match(result, /primeira cobrança corresponde ao valor final do ciclo/);
});
test('lifetime-only plan cannot appear as an available recurring checkout price', () => {
  const prices = load('src/plans/plan-price-display.ts', {});
  const lifetimeOnly = { monthValue: null, quarterlyValue: null, semiannualValue: null, annualValue: null, allowLifetime: true, lifetimeValue: 999, cardDisplayCycle: null, cardDisplayMode: 'CYCLE_TOTAL' };
  assert.deepEqual(prices.getPlanRecurringPrices(lifetimeOnly), []);
  assert.equal(prices.getPlanCardPrice(lifetimeOnly), null);
  assert.equal(prices.formatCycleCharge('LIFETIME', 999), 'Ciclo indisponível para contratação');
  assert.equal(prices.getPlanCardPrice({ ...lifetimeOnly, quarterlyValue: 129.90 }).detail, 'cobrados a cada 3 meses');
});
