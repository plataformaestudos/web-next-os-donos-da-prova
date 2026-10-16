const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function load(relativePath, dependencies = {}, globals = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  });
  const module = { exports: {} };
  new Function('require', 'exports', 'module', ...Object.keys(globals), outputText)(name => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  }, module.exports, module, ...Object.values(globals));
  return module.exports;
}

const model = load('src/free-plan-upgrade/study-access.model.ts');
const errors = load('src/lib/errors.ts');
const access = {
  reason: null,
  expiresAt: '2026-10-18T00:00:00.000Z',
  dailyResetAt: '2026-10-16T03:00:00.000Z',
  dailyQuestionLimit: 10,
  questionsViewedToday: 10,
};
const blocked = { ...access, statusCode: 403, code: 'FREE_DAILY_LIMIT_REACHED', reason: 'FREE_DAILY_LIMIT_REACHED', message: 'Limite atingido' };

test('a confirmed allowed state stays allowed even when the last question consumed the daily limit', () => {
  assert.equal(model.parseStudyAccess(access).reason, null);
  assert.equal(model.parseStudyAccessBlock(200, blocked), null);
  assert.equal(model.expirationNoticeKey('student', { ...access, reason: 'FREE_DAILY_LIMIT_REACHED' }), null);
});

test('only structured 403 codes trigger a block; legacy messages and other permission errors do not', () => {
  assert.deepEqual(model.parseStudyAccessBlock(403, blocked), { ...access, reason: 'FREE_DAILY_LIMIT_REACHED' });
  assert.equal(model.parseStudyAccessBlock(401, blocked), null);
  assert.equal(model.parseStudyAccessBlock(403, { message: 'Seu período gratuito expirou' }), null);
  assert.equal(model.parseStudyAccessBlock(403, { ...blocked, code: 'FORBIDDEN' }), null);
  assert.equal(model.parseStudyAccessBlock(403, { ...blocked, reason: 'FREE_TRIAL_EXPIRED' }), null);
  const { reason, ...codeOnly } = blocked;
  assert.equal(model.parseStudyAccessBlock(403, codeOnly).reason, reason);
});

test('malformed or incomplete backend state is ignored instead of estimating eligibility', () => {
  for (const value of [null, [], 'expired', {}, { ...access, expiresAt: 'tomorrow' }, { ...access, dailyQuestionLimit: -1 }, { ...access, questionsViewedToday: '10' }, { ...access, dailyResetAt: undefined }]) {
    assert.equal(model.parseStudyAccess(value), null);
  }
});

test('the source Free preference survives access and explicit-block parsing, while legacy responses stay compatible', () => {
  const upgradeOffer = { planId: 'paid-plan', cycle: 'QUARTERLY' };
  assert.deepEqual(model.parseStudyAccess({ ...access, upgradeOffer }).upgradeOffer, upgradeOffer);
  assert.deepEqual(model.parseStudyAccessBlock(403, { ...blocked, upgradeOffer }).upgradeOffer, upgradeOffer);
  assert.equal(model.parseStudyAccess(access).upgradeOffer, undefined);
  for (const invalid of [null, {}, { planId: '', cycle: 'YEARLY' }, { planId: 'paid', cycle: 'ANNUAL' }]) {
    assert.equal(model.parseStudyAccess({ ...access, upgradeOffer: invalid }), null);
  }
});

test('expiration markers distinguish users and renewed trial boundaries while daily states never mark an auto notice', () => {
  const expired = { ...access, reason: 'FREE_TRIAL_EXPIRED' };
  assert.equal(model.expirationNoticeKey('student-a', expired), model.expirationNoticeKey('student-a', { ...expired }));
  assert.notEqual(model.expirationNoticeKey('student-a', expired), model.expirationNoticeKey('student-b', expired));
  assert.notEqual(model.expirationNoticeKey('student-a', expired), model.expirationNoticeKey('student-a', { ...expired, expiresAt: '2026-11-01T00:00:00Z' }));
});

test('upgrade notices stay out of subscription, checkout and authentication routes in both route names', () => {
  for (const route of ['/assinatura', '/subscription', '/subscription/checkout', '/checkout', '/pagamento/pix', '/payment/confirmation', '/auth/confirm', '/login', '/cadastro', '/reset-password']) {
    assert.equal(model.isUpgradeRouteSuppressed(route), true, route);
  }
  for (const route of ['/home', '/cadernos/123', '/question-books/123', '/subscription-report']) {
    assert.equal(model.isUpgradeRouteSuppressed(route), false, route);
  }
});

function httpClient(responseBody, status = 403) {
  const events = [];
  const responses = [];
  const window = { dispatchEvent: event => events.push(event) };
  const { default: client } = load('src/util/http-client/fetch-client.util.ts', {
    '@/lib/errors': errors,
    '@/free-plan-upgrade/study-access.model': model,
  }, {
    window,
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    fetch: async (...args) => {
      responses.push(args);
      return new Response(JSON.stringify(responseBody), { status });
    },
  });
  return { client, events, responses };
}

test('every intentional blocked attempt can reopen the upgrade modal without generic toast or back event', async () => {
  const { client, events } = httpClient(blocked);
  for (let attempt = 0; attempt < 2; attempt++) {
    await assert.rejects(client.fetch('/question-books/book/next-question', { cache: 'no-store' }), error => {
      assert.equal(error.status, 403);
      assert.equal(error.errorCode, 'FREE_DAILY_LIMIT_REACHED');
      return true;
    });
  }
  assert.deepEqual(events.map(event => event.type), ['studyAccessBlocked', 'studyAccessBlocked']);
});

test('optional silent state and offer lookups throw without global errors or upgrade events', async () => {
  for (const body of [blocked, { message: 'Falha temporária' }]) {
    const { client, events } = httpClient(body);
    await assert.rejects(client.fetch('/question-books/user/study-access', { cache: 'no-store' }, false, { suppressGlobalError: true }));
    assert.equal(events.length, 0);
  }
});

test('aborted delivery cannot open a stale user modal', async () => {
  const { client, events } = httpClient(blocked);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(client.fetch('/question-books/book/next-question', { signal: controller.signal }));
  assert.equal(events.length, 0);
});

test('unrelated 403 errors retain the existing global handling', async () => {
  const { client, events } = httpClient({ message: 'Sem permissão' });
  await assert.rejects(client.fetch('/admin/users'));
  assert.deepEqual(events.map(event => event.type), ['globalHttpError']);
});

test('unauthorized sessions keep the existing UnauthorizedError behavior', async () => {
  const { client, events } = httpClient({ message: 'Unauthorized' }, 401);
  await assert.rejects(client.fetch('/question-books/book'), errors.UnauthorizedError);
  assert.equal(events.length, 0);
});

test('successful last-question delivery has no modal event and preserves credentials and no-store', async () => {
  const payload = { data: { id: 'last-question', remainingToday: 0 } };
  const { client, events, responses } = httpClient(payload, 200);
  assert.deepEqual(await client.fetch('/question-books/book/next-question', { cache: 'no-store' }), payload);
  assert.equal(events.length, 0);
  assert.equal(responses[0][1].credentials, 'include');
  assert.equal(responses[0][1].cache, 'no-store');
});

test('new login and successful logout clear only study-access session notices', () => {
  const storage = new Map([['odp:study-access:a:expired', 'shown'], ['other-key', 'keep']]);
  const scoped = load('src/free-plan-upgrade/study-access.model.ts', {}, {
    window: { sessionStorage: { get length() { return storage.size; }, key: index => [...storage.keys()][index], removeItem: key => storage.delete(key) } },
  });
  scoped.resetStudyAccessNotices();
  assert.deepEqual([...storage], [['other-key', 'keep']]);
});

function providerFixture({ storage = new Map(), fetchState = async () => ({ data: access }) } = {}) {
  const state = [];
  const effects = [];
  const jsx = (type, props) => ({ type, props });
  const fakeReact = {
    createContext: () => ({ Provider: 'StudyAccessProvider' }),
    useCallback: callback => callback,
    useEffect: effect => effects.push(effect),
    useRef: value => ({ current: value }),
    useState: initial => {
      const index = state.length;
      state.push(initial);
      return [initial, next => { state[index] = typeof next === 'function' ? next(state[index]) : next; }];
    },
  };
  const { StudyAccessProvider } = load('src/free-plan-upgrade/study-access-provider.component.tsx', {
    react: fakeReact,
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'next/navigation': { usePathname: () => '/home', useRouter: () => ({ push() {} }) },
    '@/app/context/user.context': { useUser: () => ({ user: { id: 'student-a', profile: { role_id: 'STUDENT' } } }) },
    '@/util/roles': { hasStaffAccess: () => false },
    '@/util/http-client/fetch-client.util': { default: { fetch: fetchState } },
    './upgrade-modal.component': { FreePlanUpgradeModal: 'Modal' },
    './study-access.model': model,
  }, {
    window: {
      sessionStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
      addEventListener() {}, removeEventListener() {},
    },
    document: { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} },
  });
  const rendered = StudyAccessProvider({ children: null });
  return { state, effects, showBlocked: rendered.props.value.showBlocked, storage };
}

test('a delivered block aborts an older optional lookup so a stale allowed response cannot dismiss the popup', async () => {
  let resolveState;
  let signal;
  const fixture = providerFixture({ fetchState: (_path, options) => {
    signal = options.signal;
    return new Promise(resolve => { resolveState = resolve; });
  } });
  const cleanup = fixture.effects[0]();
  fixture.showBlocked({ ...access, reason: 'FREE_DAILY_LIMIT_REACHED' });
  assert.equal(signal.aborted, true);
  resolveState({ data: access });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(fixture.state[0].reason, 'FREE_DAILY_LIMIT_REACHED');
  assert.equal(fixture.state[1], true);
  cleanup();
});

test('automatic SSR expiration opens once across a reload; a new explicit blocked attempt can still reopen it', () => {
  const expired = { ...access, reason: 'FREE_TRIAL_EXPIRED' };
  const initial = providerFixture();
  initial.showBlocked(expired, { automatic: true });
  assert.equal(initial.state[1], true);
  const refreshed = providerFixture({ storage: initial.storage });
  refreshed.showBlocked(expired, { automatic: true });
  assert.equal(refreshed.state[1], false);
  refreshed.showBlocked(expired);
  assert.equal(refreshed.state[1], true);
});

function lifecycleFixture({ initialPath = '/home', userId = 'student-a', fetchState, storage = new Map() }) {
  const hooks = [];
  const listeners = new Map();
  const timers = new Map();
  let cursor = 0;
  let dirty = false;
  let pathname = initialPath;
  let pendingEffects = [];
  let rendered;
  let timerId = 0;
  let now = Date.parse('2026-10-15T12:00:00Z');
  const same = (left, right) => left?.length === right?.length && left.every((value, index) => Object.is(value, right[index]));
  const jsx = (type, props) => ({ type, props });
  const fakeReact = {
    createContext: () => ({ Provider: 'StudyAccessProvider' }),
    useCallback: (callback, deps) => {
      const index = cursor++;
      if (!hooks[index] || !same(hooks[index].deps, deps)) hooks[index] = { value: callback, deps };
      return hooks[index].value;
    },
    useEffect: (effect, deps) => {
      const index = cursor++;
      if (!hooks[index] || !same(hooks[index].deps, deps)) {
        const previous = hooks[index];
        hooks[index] = { deps, cleanup: previous?.cleanup };
        pendingEffects.push(() => {
          previous?.cleanup?.();
          hooks[index].cleanup = effect();
        });
      }
    },
    useRef: value => {
      const index = cursor++;
      hooks[index] ??= { current: value };
      return hooks[index];
    },
    useState: initial => {
      const index = cursor++;
      hooks[index] ??= { value: initial };
      return [hooks[index].value, next => {
        const value = typeof next === 'function' ? next(hooks[index].value) : next;
        if (!Object.is(value, hooks[index].value)) { hooks[index].value = value; dirty = true; }
      }];
    },
  };
  const addEventListener = (type, callback) => {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type).add(callback);
  };
  const removeEventListener = (type, callback) => listeners.get(type)?.delete(callback);
  const { StudyAccessProvider } = load('src/free-plan-upgrade/study-access-provider.component.tsx', {
    react: fakeReact,
    'react/jsx-runtime': { jsx, jsxs: jsx },
    'next/navigation': { usePathname: () => pathname, useRouter: () => ({ push() {} }) },
    '@/app/context/user.context': { useUser: () => ({ user: { id: userId, profile: { role_id: 'STUDENT' } } }) },
    '@/util/roles': { hasStaffAccess: () => false },
    '@/util/http-client/fetch-client.util': { default: { fetch: fetchState } },
    './upgrade-modal.component': { FreePlanUpgradeModal: 'Modal' },
    './study-access.model': model,
  }, {
    Date: class extends Date { static now() { return now; } },
    window: {
      sessionStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
      addEventListener, removeEventListener,
      setTimeout: (callback, delay) => { const id = ++timerId; timers.set(id, { callback, delay }); return id; },
      clearTimeout: id => timers.delete(id),
    },
    document: { visibilityState: 'visible', addEventListener, removeEventListener },
  });
  const flush = () => {
    for (let pass = 0; pass < 20; pass++) {
      if (dirty || !rendered) {
        dirty = false;
        cursor = 0;
        rendered = StudyAccessProvider({ children: null });
      }
      const effects = pendingEffects;
      pendingEffects = [];
      effects.forEach(effect => effect());
      if (!dirty && !pendingEffects.length) return;
    }
    throw new Error('Provider kept rendering without settling');
  };
  const settle = async () => { await new Promise(resolve => setImmediate(resolve)); flush(); };
  flush();
  return {
    settle,
    flush,
    timers,
    storage,
    get modal() { return rendered.props.children[1]; },
    block: next => { rendered.props.value.showBlocked(next); flush(); },
    navigate: next => { pathname = next; dirty = true; flush(); },
    emit: (type, event = {}) => { listeners.get(type)?.forEach(callback => callback(event)); flush(); },
    advance: duration => { now += duration; },
    unmount: () => hooks.forEach(hook => hook?.cleanup?.()),
  };
}

test('passive daily state never interrupts the last question; the next denied delivery opens the popup', async () => {
  let calls = 0;
  const fixture = lifecycleFixture({ fetchState: async () => {
    calls++;
    return { data: { ...access, reason: 'FREE_DAILY_LIMIT_REACHED' } };
  } });
  await fixture.settle();
  assert.equal(fixture.modal.props.open, false);
  fixture.block({ ...access, reason: 'FREE_DAILY_LIMIT_REACHED' });
  assert.equal(fixture.modal.props.open, true);
  await fixture.settle();
  assert.equal(calls, 1, 'opening the popup must not cause a revalidation loop');
  fixture.unmount();
});

test('renewed expiration can notify again while focus checks preserve the once-per-session marker', async () => {
  let next = { ...access, reason: 'FREE_TRIAL_EXPIRED' };
  let calls = 0;
  const fixture = lifecycleFixture({ fetchState: async () => { calls++; return { data: next }; } });
  await fixture.settle();
  assert.equal(fixture.modal.props.open, true);
  fixture.modal.props.onClose();
  fixture.flush();
  fixture.emit('focus');
  await fixture.settle();
  assert.equal(calls, 1, 'immediate focus is throttled');
  fixture.advance(60_001);
  fixture.emit('focus');
  await fixture.settle();
  assert.equal(fixture.modal.props.open, false);
  next = { ...next, expiresAt: '2026-11-01T00:00:00Z' };
  fixture.advance(60_001);
  fixture.emit('visibilitychange');
  await fixture.settle();
  assert.equal(fixture.modal.props.open, true);
  assert.equal(fixture.storage.size, 2);
  fixture.unmount();
});

test('subscription routes suppress the notice and returning rechecks an activated plan without a route loop', async () => {
  let calls = 0;
  let next = { ...access, reason: 'FREE_TRIAL_EXPIRED' };
  const fixture = lifecycleFixture({ initialPath: '/assinatura', fetchState: async () => { calls++; return { data: next }; } });
  await fixture.settle();
  assert.equal(fixture.modal.props.open, false);
  assert.equal(fixture.storage.size, 0, 'suppressed routes do not consume the expiration notice');
  fixture.navigate('/home');
  await fixture.settle();
  assert.equal(fixture.modal.props.open, true);
  fixture.navigate('/assinatura');
  assert.equal(fixture.modal.props.open, false);
  next = { ...access, expiresAt: null, dailyResetAt: null, dailyQuestionLimit: null, questionsViewedToday: null };
  fixture.navigate('/home');
  await fixture.settle();
  assert.equal(fixture.modal, null);
  assert.equal(calls, 3);
  fixture.unmount();
});

test('daily reset deadline refreshes the backend state and closes the blocked daily notice', async () => {
  let calls = 0;
  let next = { ...access, reason: 'FREE_DAILY_LIMIT_REACHED' };
  const fixture = lifecycleFixture({ fetchState: async () => { calls++; return { data: next }; } });
  await fixture.settle();
  fixture.block(next);
  assert.equal(fixture.timers.size, 1);
  const timer = [...fixture.timers.values()][0];
  assert.equal(timer.delay, Date.parse(access.dailyResetAt) - Date.parse('2026-10-15T12:00:00Z') + 100);
  next = { ...access, questionsViewedToday: 0, dailyResetAt: '2026-10-17T03:00:00Z' };
  fixture.advance(timer.delay);
  timer.callback();
  await fixture.settle();
  assert.equal(fixture.modal, null);
  assert.equal(calls, 2);
  fixture.unmount();
});

test('a lookup from an unmounted user cannot show or mark expiration for the following user', async () => {
  let resolvePrevious;
  let signal;
  const storage = new Map();
  const previous = lifecycleFixture({ storage, fetchState: (_path, options) => {
    signal = options.signal;
    return new Promise(resolve => { resolvePrevious = resolve; });
  } });
  previous.unmount();
  assert.equal(signal.aborted, true);
  const current = lifecycleFixture({ userId: 'student-b', storage, fetchState: async () => ({ data: access }) });
  resolvePrevious({ data: { ...access, reason: 'FREE_TRIAL_EXPIRED' } });
  await previous.settle();
  await current.settle();
  assert.equal(current.modal, null);
  assert.equal(storage.size, 0);
  current.unmount();
});
