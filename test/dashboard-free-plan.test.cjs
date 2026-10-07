const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/ui/home/free-plan-usage.model.ts'), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const mod = { exports: {} };
new Function('exports', 'module', outputText)(mod.exports, mod);
const { nextUsageRefreshDelay, hasFreePlanIndicators, usagePercentage } = mod.exports;

const free = {
  planName: 'Free',
  hasExpiration: true,
  expiresAt: '2026-10-30T18:00:00.000Z',
  durationDays: 30,
  daysRemaining: 24,
  daysUsed: 6,
  hasDailyQuestionLimit: true,
  dailyQuestionLimit: 15,
  questionsViewedToday: 1,
  questionsRemainingToday: 14,
  dailyResetAt: '2026-10-08T03:00:00.000Z',
};

test('daily consumption refresh follows the server timezone boundary', () => {
  const now = Date.parse('2026-10-08T02:59:40.000Z');
  assert.equal(nextUsageRefreshDelay(free, now), 20100);
});

test('duration-only Free refreshes as the rounded remaining days change', () => {
  const now = Date.parse('2026-10-07T17:59:40.000Z');
  assert.equal(nextUsageRefreshDelay({ ...free, hasDailyQuestionLimit: false, dailyResetAt: null }, now), 20100);
});

test('when remaining time is a whole day, refresh is scheduled at the next day', () => {
  const now = Date.parse('2026-10-07T18:00:00.000Z');
  assert.equal(nextUsageRefreshDelay({ ...free, hasDailyQuestionLimit: false, dailyResetAt: null }, now), 86400100);
});

test('expiration and elapsed boundaries never create a zero-delay loop', () => {
  const now = Date.parse('2026-10-07T18:00:00.000Z');
  assert.equal(nextUsageRefreshDelay({ ...free, expiresAt: '2026-10-07T18:00:00.000Z' }, now), 1000);
  assert.equal(nextUsageRefreshDelay({ ...free, expiresAt: '2026-10-07T17:00:00.000Z' }, now), 1000);
});

test('missing, unbounded and incomplete boundaries do not schedule a timer', () => {
  assert.equal(nextUsageRefreshDelay(null), null);
  assert.equal(nextUsageRefreshDelay(undefined), null);
  assert.equal(nextUsageRefreshDelay({ ...free, hasExpiration: false, hasDailyQuestionLimit: false }), null);
  assert.equal(nextUsageRefreshDelay({ ...free, expiresAt: null, dailyResetAt: null }), null);
});

test('explicit zero allowance remains visible with a bounded exhausted progress bar', () => {
  assert.equal(hasFreePlanIndicators({ ...free, hasExpiration: false, dailyQuestionLimit: 0 }), true);
  assert.equal(usagePercentage(0, 0), 100);
  assert.equal(usagePercentage(18, 15), 100);
  assert.equal(usagePercentage(1, 15), 100 / 15);
});
