const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(file, dependencies = {}) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const mod = { exports: {} };
  new Function('require', 'exports', 'module', outputText)(name => {
    if (!(name in dependencies)) throw new Error(name);
    return dependencies[name];
  }, mod.exports, mod);
  return mod.exports;
}
const prices = load('src/plans/plan-price-display.ts');
const { selectUpgradeOffer, formatUpgradeReset } = load('src/free-plan-upgrade/upgrade-offer.model.ts', {
  '@/plans/plan-price-display': prices,
});
const plan = (id, changes = {}) => ({
  id, name: id, description: '', isFree: false, monthValue: null, quarterlyValue: null,
  semiannualValue: null, annualValue: null, uniqueValue: null, lifetimeValue: null,
  allowLifetime: false, durationDays: null, questionLimit: null,
  ...changes,
});

test('prefers the first purchasable annual plan, preserving catalog order and source data', () => {
  const monthly = plan('monthly', { monthValue: 20 });
  const annual = plan('annual-first', { annualValue: 200, monthValue: 30, cardDisplayCycle: 'MONTHLY', cardDisplayMode: 'MONTHLY_EQUIVALENT' });
  const secondAnnual = plan('annual-second', { annualValue: 100 });
  const selected = selectUpgradeOffer([monthly, annual, secondAnnual]);
  assert.equal(selected.id, annual.id);
  assert.equal(selected.cardDisplayCycle, 'YEARLY');
  assert.equal(selected.cardDisplayMode, 'CYCLE_TOTAL');
  assert.equal(annual.cardDisplayCycle, 'MONTHLY');
  assert.equal(annual.cardDisplayMode, 'MONTHLY_EQUIVALENT');
  const price = prices.getPlanCardPrice(selected);
  assert.equal(price.amount, 200);
  assert.match(price.detail, /a cada 12 meses/);
  assert.doesNotMatch(price.headline, /\/mês/);
});

test('excludes Free, lifetime only and invalid recurring prices', () => {
  assert.equal(selectUpgradeOffer([
    plan('free', { isFree: true, annualValue: 100 }),
    plan('lifetime', { allowLifetime: true, lifetimeValue: 500, uniqueValue: 500 }),
    plan('zero', { monthValue: 0, annualValue: -20 }),
    plan('non-finite', { monthValue: NaN, quarterlyValue: Infinity }),
  ]), null);
  assert.equal(selectUpgradeOffer([]), null);
});

test('without annual plans, keeps catalog priority and uses configured valid cycle', () => {
  const selected = selectUpgradeOffer([
    plan('quarterly', { monthValue: 60, quarterlyValue: 140, cardDisplayCycle: 'QUARTERLY' }),
    plan('cheaper', { monthValue: 20 }),
  ]);
  assert.equal(selected.id, 'quarterly');
  assert.equal(selected.cardDisplayCycle, 'QUARTERLY');
  assert.equal(prices.getPlanCardPrice(selected).amount, 140);
  assert.match(prices.getPlanCardPrice(selected).detail, /a cada 3 meses/);
});

test('missing or unavailable display cycle falls back to a purchasable recurring cycle', () => {
  const selected = selectUpgradeOffer([plan('semiannual', { semiannualValue: 240, cardDisplayCycle: 'YEARLY' })]);
  assert.equal(selected.cardDisplayCycle, 'SEMIANNUALLY');
  assert.match(prices.getPlanCardPrice(selected).detail, /a cada 6 meses/);
  const stringPrice = selectUpgradeOffer([plan('decimal-string', { annualValue: '300.50' })]);
  assert.equal(prices.getPlanCardPrice(stringPrice).amount, 300.5);
});

test('reset notice uses the exact server boundary in Brasília and omits absent or invalid dates', () => {
  assert.equal(formatUpgradeReset(null), null);
  assert.equal(formatUpgradeReset('invalid'), null);
  const reset = formatUpgradeReset('2026-10-16T03:00:00.000Z');
  assert.match(reset, /16\/10\/2026/);
  assert.match(reset, /00:00/);
});

test('a configured source Free selects its paid plan and cycle even when another plan has annual pricing', () => {
  const first = plan('annual-first', { annualValue: 500 });
  const chosen = plan('chosen', { monthValue: 25, quarterlyValue: 70, semiannualValue: 120 });
  const selected = selectUpgradeOffer([first, chosen], { planId: 'chosen', cycle: 'SEMIANNUALLY' });
  assert.equal(selected.id, 'chosen');
  assert.equal(selected.cardDisplayCycle, 'SEMIANNUALLY');
  assert.equal(selected.cardDisplayMode, 'CYCLE_TOTAL');
  assert.equal(prices.getPlanCardPrice(selected).amount, 120);
  assert.equal(chosen.cardDisplayCycle, undefined);
});

test('a configured unavailable offer keeps no suggestion instead of silently switching to an unrelated plan', () => {
  const catalog = [plan('annual', { annualValue: 500 }), plan('chosen', { monthValue: 25 }), plan('free', { isFree: true, annualValue: 50 })];
  for (const preference of [
    { planId: 'missing-or-inactive', cycle: 'YEARLY' },
    { planId: 'chosen', cycle: 'YEARLY' },
    { planId: 'free', cycle: 'YEARLY' },
  ]) assert.equal(selectUpgradeOffer(catalog, preference), null);
  assert.equal(selectUpgradeOffer(catalog).id, 'annual');
});
