const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const flush = async () => { for (let i = 0; i < 5; i++) await new Promise(setImmediate); };
const free = { planName: 'Free', hasDailyQuestionLimit: true, dailyQuestionLimit: 15, questionsViewedToday: 4, questionsRemainingToday: 11, dailyResetAt: new Date(Date.now() + 60000).toISOString() };
function renderUsage(usage = free, network = async () => ({ data: free })) {
  const slots = []; const effects = []; const events = new Map(); const timers = new Map(); const calls = [];
  let cursor = 0; let tree; let question = { dailyUsage: usage }; let role = 'STUDENT'; let mounted = true;
  const same = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const hooks = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], next => { slots[i] = next; queueMicrotask(() => { if (mounted) render(); }); }]; },
    useRef(initial) { const i = cursor++; if (!(i in slots)) slots[i] = { current: initial }; return slots[i]; },
    useCallback(fn, deps) { const i = cursor++; if (!slots[i] || !same(slots[i].deps, deps)) slots[i] = { fn, deps }; return slots[i].fn; },
    useEffect(fn, deps) { const i = cursor++; const previous = slots[i]; if (!previous || !same(previous.deps, deps)) { slots[i] = { deps, cleanup: previous?.cleanup }; effects.push(() => { slots[i].cleanup?.(); slots[i].cleanup = fn(); }); } },
  };
  const jsx = (type, props) => ({ type, props });
  const dependencies = {
    react: hooks, 'react/jsx-runtime': { jsx, jsxs: jsx },
    antd: { Button: 'Button', Flex: 'Flex', Progress: 'Progress', Typography: { Text: 'Text', Link: 'Link' }, theme: { useToken: () => ({ token: {} }) } },
    '@/app/context/user.context': { useUser: () => ({ user: { id: 'student' } }) },
    '@/util/roles': { Roles: { STUDENT: 'STUDENT' }, canAccess: () => role === 'STUDENT' },
    '@/util/http-client/fetch-client.util': { default: { fetch: async (...args) => { calls.push(args); return network(...args); } } },
    '@/ui/home/free-plan-usage.model': { usagePercentage: (used, limit) => limit <= 0 ? 100 : Math.min(100, used / limit * 100) },
  };
  const originalWindow = global.window; const originalDocument = global.document;
  const eventTarget = { addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name) };
  global.window = { ...eventTarget, setTimeout: (fn, delay) => { const id = {}; timers.set(id, { fn, delay }); return id; }, clearTimeout: id => timers.delete(id) };
  global.document = { ...eventTarget, visibilityState: 'visible' };
  const source = fs.readFileSync(path.join(__dirname, '../src/question-books/daily-question-usage.component.tsx'), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } });
  const mod = { exports: {} };
  new Function('require', 'exports', 'module', outputText)(name => { if (!(name in dependencies)) throw Error(name); return dependencies[name]; }, mod.exports, mod);
  function render() { cursor = 0; tree = mod.exports.DailyQuestionUsage({ question, mobile: false }); while (effects.length) effects.shift()(); }
  function nodes(node, type) { if (!node || typeof node !== 'object') return []; if (Array.isArray(node)) return node.flatMap(n => nodes(n, type)); return [...(node.type === type ? [node] : []), ...nodes(node.props?.children, type)]; }
  render();
  return { calls, events, timers, tree: () => tree, text: () => JSON.stringify(tree), nodes: type => nodes(tree, type), deliver: value => { question = { dailyUsage: value }; render(); }, role: value => { role = value; render(); }, unmount: () => { mounted = false; slots.forEach(slot => slot?.cleanup?.()); global.window = originalWindow; global.document = originalDocument; } };
}

test('uses question snapshots without requests on mount, delivery or ordinary focus', () => {
  const ui = renderUsage();
  try {
    assert.equal(ui.nodes('Progress')[0].props.percent, 4 / 15 * 100);
    ui.events.get('focus')();
    ui.deliver({ ...free, questionsViewedToday: 5 });
    ui.events.get('focus')();
    assert.equal(ui.calls.length, 0);
    assert.match(ui.text(), /5.*15/);
    assert.doesNotMatch(ui.text(), /Consultando/);
  } finally { ui.unmount(); }
});

test('only known Free quotas can enable exceptional refreshes', async () => {
  for (const value of [null, undefined]) {
    const ui = renderUsage(null);
    try { ui.deliver(value); assert.equal(ui.tree(), null); assert.equal(ui.events.size, 0); assert.equal(ui.calls.length, 0); } finally { ui.unmount(); }
  }
  for (const role of ['ADMIN', 'COLLABORATOR']) {
    const ui = renderUsage();
    try { ui.role(role); assert.equal(ui.tree(), null); assert.equal(ui.events.size, 0); assert.equal(ui.calls.length, 0); } finally { ui.unmount(); }
  }
});

test('a return after inactivity refreshes once without replacing the indicator with loading', async () => {
  const actualNow = Date.now;
  const started = actualNow();
  const ui = renderUsage();
  try {
    Date.now = () => started + 61_000;
    ui.events.get('focus')(); await flush();
    ui.events.get('focus')(); await flush();
    assert.equal(ui.calls.length, 1);
    assert.match(ui.text(), /4.*15/);
    assert.doesNotMatch(ui.text(), /Consultando|Carregando/);
  } finally { Date.now = actualNow; ui.unmount(); }
});

test('zero remains exhausted and the day boundary refresh is read-only', async () => {
  const ui = renderUsage({ ...free, dailyQuestionLimit: 0 });
  try {
    assert.equal(ui.nodes('Progress')[0].props.percent, 100);
    assert.match(ui.text(), /Limite de hoje atingido/);
    [...ui.timers.values()][0].fn(); await flush();
    assert.equal(ui.calls.length, 1);
    assert.equal(ui.calls[0][0], '/question-books/user/daily-usage');
    assert.equal(ui.calls[0][1].cache, 'no-store');
  } finally { ui.unmount(); }
});

test('a failed refresh preserves the confirmed count and can be retried', async () => {
  let fail = true;
  const ui = renderUsage(free, async () => { if (fail) throw Error('Fixture'); return { data: { ...free, questionsViewedToday: 6 } }; });
  try {
    [...ui.timers.values()][0].fn(); await flush();
    assert.match(ui.text(), /4.*15/);
    assert.match(ui.text(), /Não foi possível atualizar/);
    fail = false; ui.nodes('Button')[0].props.onClick(); await flush();
    assert.match(ui.text(), /6.*15/);
    assert.doesNotMatch(ui.text(), /Não foi possível atualizar/);
  } finally { ui.unmount(); }
});

test('new deliveries take precedence over stale background responses', async () => {
  let resolve;
  const ui = renderUsage(free, () => new Promise(done => { resolve = done; }));
  try {
    [...ui.timers.values()][0].fn(); await flush();
    assert.match(ui.text(), /4.*15/);
    ui.deliver({ ...free, questionsViewedToday: 7 });
    resolve({ data: free }); await flush();
    assert.match(ui.text(), /7.*15/);
  } finally { ui.unmount(); }
});

test('missing metadata preserves the previous snapshot without an automatic extra request', () => {
  const ui = renderUsage();
  try { ui.deliver(undefined); assert.match(ui.text(), /4.*15/); assert.match(ui.text(), /Não foi possível atualizar/); assert.equal(ui.calls.length, 0); } finally { ui.unmount(); }
});
