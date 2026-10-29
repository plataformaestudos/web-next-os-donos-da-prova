const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { NextRequest, NextResponse } = require('next/server');

function load(relativePath, dependencies, fetchMock) {
  const source = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const module = { exports: {} };
  new Function('require', 'exports', 'module', 'fetch', outputText)(name => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  }, module.exports, module, fetchMock);
  return module.exports;
}

function client({ backendError, cleanupOk = true, authError } = {}) {
  const calls = [];
  const { logoutClient } = load('src/services/logout.service.ts', {
    '@/util/http-client/fetch-client.util': { default: { fetch: async (...args) => {
      calls.push(['backend', ...args]);
      if (backendError) throw backendError;
      return { loggedOut: true };
    } } },
    '@/util/supabase/client': { createClient: () => ({ auth: { signOut: async options => {
      calls.push(['supabase', options]);
      if (authError) throw authError;
      return { error: null };
    } } }) },
  }, async (...args) => {
    calls.push(['frontend', ...args]);
    return { ok: cleanupOk };
  });
  return { logoutClient, calls };
}

test('revokes the backend session before clearing the frontend cookie and separate Auth session', async () => {
  const fixture = client();
  await fixture.logoutClient();
  assert.deepEqual(fixture.calls, [
    ['backend', '/auth/logout', { method: 'POST', cache: 'no-store' }, false],
    ['frontend', '/auth/logout', { method: 'POST', credentials: 'same-origin', cache: 'no-store' }],
    ['supabase', { scope: 'local' }],
  ]);
});

test('a backend revocation failure is surfaced without pretending the user logged out', async () => {
  const error = new Error('fixture backend unavailable');
  const fixture = client({ backendError: error });
  await assert.rejects(fixture.logoutClient(), error);
  assert.equal(fixture.calls.length, 1);
});

test('cookie cleanup failures are surfaced so logout can be retried', async () => {
  const fixture = client({ cleanupOk: false });
  await assert.rejects(fixture.logoutClient(), /limpar a sessão/);
  assert.equal(fixture.calls.length, 2);
});

test('failure of the separate Supabase Auth logout does not restore a revoked backend session', async () => {
  const fixture = client({ authError: new Error('fixture Auth unavailable') });
  await fixture.logoutClient();
  assert.equal(fixture.calls.length, 3);
});

const route = load('src/app/auth/logout/route.ts', { 'next/server': { NextRequest, NextResponse } });
test('same-origin cleanup expires the frontend host-only cookie and is not cached', async () => {
  const response = route.POST(new NextRequest('https://www.osdonosdaprova.com.br/auth/logout', {
    method: 'POST', headers: { origin: 'https://www.osdonosdaprova.com.br', cookie: 'access_token=fixture-only' },
  }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /access_token=;/);
  assert.match(cookie, /Path=\//);
  assert.match(cookie, /Max-Age=0/);
  assert.match(cookie, /HttpOnly/);
  assert.doesNotMatch(cookie, /Domain=/);
});

test('cross-origin requests cannot clear the frontend cookie', () => {
  const response = route.POST(new NextRequest('https://www.osdonosdaprova.com.br/auth/logout', {
    method: 'POST', headers: { origin: 'https://untrusted.example' },
  }));
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('set-cookie'), null);
});

const publicEbookPaths = load('src/ebooks/public-path.ts', {});
const { middleware } = load('src/middleware.ts', { 'next/server': { NextRequest, NextResponse }, '@/ebooks/public-path': publicEbookPaths });
test('cleanup remains reachable after API cookie expiration; protected history URLs redirect to login without a token', async () => {
  const cleanup = await middleware(new NextRequest('https://www.osdonosdaprova.com.br/auth/logout', { method: 'POST' }));
  assert.equal(cleanup.headers.get('x-middleware-next'), '1');
  const protectedResponse = await middleware(new NextRequest('https://www.osdonosdaprova.com.br/home'));
  assert.equal(new URL(protectedResponse.headers.get('location')).pathname, '/login');
});

test('ebook checkout and order routes are public without relaxing the ebooks ADMIN route', async () => {
  for (const route of ['/ebooks/checkout', '/ebooks/recuperar', '/ebooks/pedido/22222222-2222-4222-8222-222222222222']) {
    const response = await middleware(new NextRequest(`https://www.osdonosdaprova.com.br${route}`));
    assert.equal(response.headers.get('x-middleware-next'), '1');
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
    assert.match(response.headers.get('cache-control'), /no-store/);
  }
  const response = await middleware(new NextRequest('https://www.osdonosdaprova.com.br/ebooks'));
  assert.equal(new URL(response.headers.get('location')).pathname, '/login');
});

test('custom ebook routes reject application roots and ambiguous URL shapes', () => {
  for (const route of ['/admin/ebook', '/gerenciar-usuarios/ebook', '/questions/ebook', '/questoes/ebook', '/ebooks/admin', '/auth/ebook', '/api/ebook', '//concurso/ebook', '/concurso/../ebook', '/concurso/%65book', '/concurso/ebook?admin=1']) {
    assert.equal(publicEbookPaths.isCustomEbookPath(route), false, route);
  }
  assert.equal(publicEbookPaths.isCustomEbookPath('/concurso1/ebook'), true);
});

test('a custom page opens only when the public API confirms the exact published path', async () => {
  const previous = process.env.NEXT_PUBLIC_API_BASE_URL;
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://fixture-api.example.test';
  try {
    let calls = 0;
    const fixture = load('src/middleware.ts', { 'next/server': { NextRequest, NextResponse }, '@/ebooks/public-path': publicEbookPaths }, async (url, options) => {
      calls++;
      assert.equal(options.credentials, 'omit');
      assert.equal(options.cache, 'no-store');
      return { ok: true, json: async () => ({ path: new URL(url).searchParams.get('path') === '/concurso1/ebook' ? '/concurso1/ebook' : '/different/ebook' }) };
    });
    const published = await fixture.middleware(new NextRequest('https://fixture.example.test/concurso1/ebook'));
    assert.equal(published.headers.get('x-middleware-next'), '1');
    const mismatch = await fixture.middleware(new NextRequest('https://fixture.example.test/other/ebook'));
    assert.equal(new URL(mismatch.headers.get('location')).pathname, '/login');
    const admin = await fixture.middleware(new NextRequest('https://fixture.example.test/admin/ebook'));
    assert.equal(new URL(admin.headers.get('location')).pathname, '/login');
    assert.equal(calls, 2);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
    else process.env.NEXT_PUBLIC_API_BASE_URL = previous;
  }
});
