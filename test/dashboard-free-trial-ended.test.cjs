const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(relative, dependencies = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  });
  const module = { exports: {} };
  new Function('require', 'exports', 'module', outputText)(name => {
    if (!(name in dependencies)) throw Error(`Unexpected import: ${name}`);
    return dependencies[name];
  }, module.exports, module);
  return module.exports;
}
const jsx = (type, props) => ({ type, props });
const styles = relative => Object.fromEntries([...fs.readFileSync(path.join(__dirname, '..', relative), 'utf8').matchAll(/export const (\w+)/g)].map(([, name]) => [name, name]));
const model = load('src/ui/home/free-plan-usage.model.ts');
const usage = {
  planName: 'Free', hasExpiration: true, expiresAt: '2026-10-31T01:00:00Z',
  durationDays: 15, daysRemaining: 15, daysUsed: 0,
  hasDailyQuestionLimit: true, dailyQuestionLimit: 15, questionsViewedToday: 2,
  questionsRemainingToday: 13, dailyResetAt: '2026-10-17T03:00:00Z',
};
const { FreePlanUsageCard } = load('src/ui/home/free-plan-usage.component.tsx', {
  'react/jsx-runtime': { jsx, jsxs: jsx },
  '@ant-design/icons': { CalendarOutlined: 'Calendar', ReadOutlined: 'Read', RightOutlined: 'Right' },
  antd: { Progress: 'Progress' },
  'styled-components': { useTheme: () => ({}) },
  './free-plan-usage.model': model,
  './free-plan-usage.style': styles('src/ui/home/free-plan-usage.style.ts'),
});

function render({ reason = null, freePlanUsage = null, staff = false, error = false } = {}) {
  const { HomeContent } = load('src/ui/home/home.component.tsx', {
    'react/jsx-runtime': { jsx, jsxs: jsx }, react: { useEffect() {} },
    './home.style': styles('src/ui/home/home.style.ts'),
    '@/components/AppLoading': { AppLoading: 'Loading' },
    '@/components/WhatsAppFloatButton': { WhatsAppFloatButton: 'WhatsApp' },
    '@/util/http-client/fetch-client.util': { default: { fetch() { throw Error('Unexpected request'); } } },
    antd: { Progress: 'Progress' }, 'next/image': { default: 'Image' },
    '@tanstack/react-query': { useQuery: () => ({
      data: { freePlanUsage, loginsInCurrentMonth: [], totalAnswers: 0, totalBooksFavorited: 0, answersByDayInCurrentMonth: [], statsLastBookAnswered: null },
      isLoading: false, isError: error, refetch() {}, dataUpdatedAt: 1,
    }) },
    '@/app/context/user.context': { useUser: () => ({ user: { id: 'student', profile: {}, staff } }) },
    '@/util/roles': { hasStaffAccess: user => user.staff },
    '@/free-plan-upgrade/study-access-provider.component': { useStudyAccess: () => ({ access: reason === undefined ? null : { reason } }) },
    './free-plan-usage.component': { FreePlanUsageCard },
    './free-plan-usage.model': model,
  });
  const nodes = [];
  const text = [];
  function visit(node) {
    if (node === null || node === undefined || typeof node === 'boolean') return;
    if (Array.isArray(node)) return node.forEach(visit);
    if (typeof node !== 'object') { text.push(String(node)); return; }
    if (typeof node.type === 'function') return visit(node.type(node.props));
    nodes.push(node);
    visit(node.props?.children);
  }
  visit(HomeContent({ userProfile: { name: 'Aluno' } }));
  return { text: text.join(''), nodes: type => nodes.filter(node => node.type === type) };
}

test('confirmed expired Free replaces consumption in its dashboard grid position', () => {
  const result = render({ reason: 'FREE_TRIAL_EXPIRED' });
  assert.match(result.text, /Seu período gratuito terminou/);
  assert.match(result.text, /Veja os planos para continuar estudando/);
  assert.doesNotMatch(result.text, /Questões visualizadas hoje|dias restantes/);
  assert.equal(result.nodes('PlansLink')[0].props.href, '/assinatura?tab=planos');
  assert.equal(result.nodes('Content')[0].props.$hasFreePlanUsage, true);
  assert.equal(result.nodes('CardPerformance')[0].props.$hasFreePlanUsage, true);
});

test('confirmed expiration takes precedence over a stale active dashboard snapshot', () => {
  const result = render({ reason: 'FREE_TRIAL_EXPIRED', freePlanUsage: usage });
  assert.match(result.text, /Seu período gratuito terminou/);
  assert.doesNotMatch(result.text, /Questões visualizadas hoje|15 dias restantes/);
});

test('active Free retains its original consumption card and expiration', () => {
  const result = render({ freePlanUsage: usage });
  assert.match(result.text, /15 dias restantes/);
  assert.match(result.text, /30\/10\/2026, 22:00/);
  assert.match(result.text, /Questões visualizadas hoje/);
  assert.doesNotMatch(result.text, /Seu período gratuito terminou|0 de 15 dias utilizados/);
});

test('paid, absent history, expired paid and an unconfirmed lookup do not invent a Free notice', () => {
  for (const reason of [null, undefined, 'FREE_DAILY_LIMIT_REACHED']) {
    const result = render({ reason });
    assert.doesNotMatch(result.text, /Seu período gratuito terminou/);
    assert.equal(result.nodes('PlansLink').length, 0);
    assert.equal(result.nodes('Content')[0].props.$hasFreePlanUsage, false);
  }
});

test('staff never see a Free notice or usage even if stale state is present', () => {
  const result = render({ reason: 'FREE_TRIAL_EXPIRED', freePlanUsage: usage, staff: true });
  assert.doesNotMatch(result.text, /Seu período gratuito terminou|Questões visualizadas hoje/);
  assert.equal(result.nodes('Content')[0].props.$hasFreePlanUsage, false);
});

test('an authenticated expiration remains visible independently of an optional dashboard failure', () => {
  assert.match(render({ reason: 'FREE_TRIAL_EXPIRED', error: true }).text, /Seu período gratuito terminou/);
});

test('an activated subscription removes the ended Free card and frees its grid area', () => {
  assert.match(render({ reason: 'FREE_TRIAL_EXPIRED' }).text, /Seu período gratuito terminou/);
  const activated = render({ reason: null });
  assert.doesNotMatch(activated.text, /Seu período gratuito terminou/);
  assert.equal(activated.nodes('Content')[0].props.$hasFreePlanUsage, false);
});
