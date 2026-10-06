const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(file, dependencies = {}) {
  const { outputText } = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } });
  const mod = { exports: {} };
  new Function('require', 'exports', 'module', outputText)(name => { if (!(name in dependencies)) throw Error(name); return dependencies[name]; }, mod.exports, mod);
  return mod.exports;
}
const response = (data, ok = true) => ({ ok, json: async () => data });
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const flush = async () => { for (let i = 0; i < 8; i += 1) await new Promise(setImmediate); };
const offer = { active: true, campaign: { title: 'Campanha A', slug: 'campanha-a' }, baseAmountCents: 10000, discountAmountCents: 2000, finalAmountCents: 8000 };

// Execute the actual component's hooks/events without depending on a DOM library.
function renderQuote(network, api = load('src/affiliates/referral-request-queue.ts')) {
  const slots = []; const effects = []; let cursor = 0; let scheduled = false; let tree; let props; let Component;
  const schedule = () => { if (!scheduled) { scheduled = true; queueMicrotask(() => { scheduled = false; render(); }); } };
  const same = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  const hooks = {
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], next => { slots[i] = typeof next === 'function' ? next(slots[i]) : next; schedule(); }]; },
    useRef(initial) { const i = cursor++; if (!(i in slots)) slots[i] = { current: initial }; return slots[i]; },
    useId() { cursor++; return 'discount-code'; },
    useEffect(effect, deps) { const i = cursor++; const previous = slots[i]; if (!previous || !same(previous.deps, deps)) { slots[i] = { deps, cleanup: previous?.cleanup }; effects.push(() => { slots[i].cleanup?.(); slots[i].cleanup = effect(); }); } },
    useSyncExternalStore(subscribe, getSnapshot) { const [, update] = hooks.useState(0); hooks.useEffect(() => subscribe(() => update(value => value + 1)), [subscribe]); return getSnapshot(); },
  };
  const jsx = (type, jsxProps) => ({ type, props: jsxProps });
  Component = load('src/affiliates/referral-quote.component.tsx', {
    react: hooks,
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'Fragment' },
    antd: Object.fromEntries(['Alert', 'Button', 'Input', 'Space', 'Spin'].map(name => [name, name]).concat([['Typography', { Text: 'Text', Paragraph: 'Paragraph' }]])),
    './quote-summary': { quoteSummary: (cycle, amounts) => `${cycle}: ${amounts.finalAmountCents}` },
    './referral-request-queue': api,
    './referral-quote.module.css': { default: {} },
  }).ReferralQuote;
  const readiness = [];
  props = { planId: 'plan-a', cycle: 'MONTHLY', onReadinessChange: value => readiness.push(value) };
  global.fetch = network;
  function render() { cursor = 0; tree = Component(props); while (effects.length) effects.shift()(); }
  function nodes(node, type) { if (!node || typeof node !== 'object') return []; if (Array.isArray(node)) return node.flatMap(child => nodes(child, type)); return [...(node.type === type ? [node] : []), ...nodes(node.props?.children, type), ...nodes(node.props?.action, type), ...nodes(node.props?.description, type)]; }
  render();
  return {
    api, readiness,
    input: () => nodes(tree, 'Input')[0],
    button: text => nodes(tree, 'Button').find(node => node.props.children === text),
    alerts: () => nodes(tree, 'Alert'),
    update: next => { props = { ...props, ...next }; render(); },
    unmount: () => slots.forEach(slot => slot?.cleanup?.()),
  };
}

test('cookie requests finish in order and queue recovers after failure', async () => {
  const { createReferralRequestQueue } = load('src/affiliates/referral-request-queue.ts');
  const queue = createReferralRequestQueue(); const wait = deferred(); const events = [];
  const first = queue.enqueue(async () => { events.push('apply-start'); await wait.promise; events.push('apply-end'); throw Error('invalid'); });
  const rejected = assert.rejects(first, /invalid/);
  const second = queue.enqueue(async () => { events.push('delete'); return 'removed'; });
  await Promise.resolve();
  assert.equal(queue.getPending(), 2); assert.deepEqual(events, ['apply-start']);
  wait.resolve(); await rejected; assert.equal(await second, 'removed');
  assert.deepEqual(events, ['apply-start', 'apply-end', 'delete']); assert.equal(queue.getPending(), 0);
});

test('checkout readiness requires the current plan, cycle and an idle global queue', async () => {
  const api = load('src/affiliates/referral-request-queue.ts');
  const ready = { planId: 'p', cycle: 'MONTHLY', ready: true };
  assert.equal(api.isReferralCheckoutReady(ready, 'p', 'MONTHLY'), true);
  assert.equal(api.isReferralCheckoutReady(ready, 'other', 'MONTHLY'), false);
  assert.equal(api.isReferralCheckoutReady(ready, 'p', 'YEARLY'), false);
  const wait = deferred(); const request = api.referralRequestQueue.enqueue(() => wait.promise);
  assert.equal(api.isReferralCheckoutReady(ready, 'p', 'MONTHLY'), false);
  wait.resolve(); await request; assert.equal(api.isReferralCheckoutReady(ready, 'p', 'MONTHLY'), true);
});

test('quote parser rejects incomplete or invalid cents and drops signed tokens', () => {
  const { parseReferralOffer } = load('src/affiliates/referral-request-queue.ts');
  assert.equal(parseReferralOffer({ active: false }), undefined);
  assert.throws(() => parseReferralOffer({ ...offer, finalAmountCents: '8000' }));
  assert.throws(() => parseReferralOffer({ ...offer, discountAmountCents: -1 }));
  assert.throws(() => parseReferralOffer({ active: true }));
  assert.deepEqual(parseReferralOffer({ ...offer, quoteToken: 'private', referralToken: 'private' }), { campaign: offer.campaign, baseAmountCents: 10000, discountAmountCents: 2000, finalAmountCents: 8000 });
});

test('invalid code preserves the previously displayed offer and allows its checkout', async t => {
  const originalFetch = global.fetch; t.after(() => { global.fetch = originalFetch; });
  const answers = [response(offer), response({ message: 'Código inválido' }, false)];
  const calls = [];
  const view = renderQuote(async (url, options) => { calls.push({ url, body: options.body }); return answers.shift(); });
  t.after(view.unmount);
  await flush();
  assert.equal(view.readiness.at(-1).ready, true);
  view.input().props.onChange({ target: { value: 'nao-existe' } }); await flush();
  view.button('Aplicar').props.onClick();
  assert.equal(view.readiness.at(-1).ready, false);
  await flush();
  assert.equal(calls[1].url, '/api/affiliate-referral/code');
  assert.equal(JSON.parse(calls[1].body).code, 'nao-existe');
  assert.equal(view.readiness.at(-1).ready, true);
  assert.ok(view.alerts().some(alert => alert.props.message === 'Oferta Campanha A'));
  assert.ok(view.alerts().some(alert => alert.props.description === 'O desconto anterior foi mantido.'));
});

test('changing cycle waits for an in-flight code and requires explicit removal after revalidation fails', async t => {
  const originalFetch = global.fetch; t.after(() => { global.fetch = originalFetch; });
  const applied = deferred(); const calls = [];
  const view = renderQuote(async (url, options) => {
    calls.push({ url, method: options.method, body: options.body });
    if (calls.length === 1) return response({ active: false });
    if (calls.length === 2) return applied.promise;
    if (options.method === 'DELETE') return response({ active: false });
    return response({ message: 'Ciclo sem oferta' }, false);
  });
  t.after(view.unmount);
  await flush(); view.input().props.onChange({ target: { value: 'campanha-a' } }); await flush();
  view.button('Aplicar').props.onClick(); await flush();
  view.update({ cycle: 'YEARLY' }); await flush();
  assert.equal(calls.length, 2); assert.equal(view.readiness.at(-1).ready, false);
  applied.resolve(response(offer)); await flush();
  assert.equal(calls.length, 3); assert.equal(JSON.parse(calls[2].body).cycle, 'YEARLY');
  assert.equal(view.readiness.at(-1).ready, false);
  assert.ok(!view.alerts().some(alert => alert.props.message === 'Oferta Campanha A'));
  view.button('Continuar pelo valor regular').props.onClick(); await flush();
  assert.equal(calls[3].method, 'DELETE');
  assert.deepEqual(view.readiness.at(-1), { planId: 'plan-a', cycle: 'YEARLY', ready: true });
});

test('network failure during applying cannot silently approve an uncertain cookie state', async t => {
  const originalFetch = global.fetch; t.after(() => { global.fetch = originalFetch; });
  let count = 0;
  const view = renderQuote(async () => { if (++count === 1) return response(offer); throw Error('Conexão interrompida'); });
  t.after(view.unmount);
  await flush(); view.button('Aplicar').props.onClick(); await flush();
  assert.equal(view.readiness.at(-1).ready, false);
  assert.ok(view.button('Continuar pelo valor regular'));
});

test('unmounting does not abort cookie requests and the next mount waits before detecting its referral', async t => {
  const originalFetch = global.fetch; t.after(() => { global.fetch = originalFetch; });
  const firstResponse = deferred(); let calls = 0;
  const network = async () => { calls += 1; return calls === 1 ? firstResponse.promise : response({ active: false }); };
  const first = renderQuote(network); await flush(); first.unmount();
  const next = renderQuote(network, first.api); t.after(next.unmount); await flush();
  assert.equal(calls, 1); assert.equal(next.readiness.at(-1).ready, false);
  firstResponse.resolve(response(offer)); await flush();
  assert.equal(calls, 2); assert.equal(next.readiness.at(-1).ready, true);
  assert.ok(!next.alerts().some(alert => alert.props.message === 'Oferta Campanha A'));
});
