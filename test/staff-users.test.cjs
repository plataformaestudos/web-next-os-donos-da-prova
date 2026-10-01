const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function api() {
  const requests = [];
  class HttpError extends Error {}
  const source = fs.readFileSync(path.join(__dirname, '../src/staff-users/staff-users.api.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const module = { exports: {} };
  const requireMock = (name) => {
    if (name === '@/util/http-client/fetch-client.util') return { default: {
      fetch: async (...args) => { requests.push(args); return { message: 'ok' }; },
    } };
    if (name === '@/lib/errors') return { HttpError };
    throw new Error(`Unexpected dependency: ${name}`);
  };
  new Function('require', 'exports', 'module', outputText)(requireMock, module.exports, module);
  return { ...module.exports, requests };
}

test('encodes and combines the five filters with server pagination', async () => {
  const client = api();
  await client.listStaffUsers(2, 10, {
    name: ' Aluno & teste ', email: ' aluno+teste@example.com ', doc: '123.456.789-00',
    role: 'STUDENT', status: 'BLOCKED',
  });
  const [url, options] = client.requests[0];
  const params = new URL(url, 'https://example.com').searchParams;
  assert.deepEqual(Object.fromEntries(params), {
    page: '2', limit: '10', name: 'Aluno & teste', email: 'aluno+teste@example.com',
    doc: '123.456.789-00', role: 'STUDENT', status: 'BLOCKED',
  });
  assert.equal(options.cache, 'no-store');
});

test('cleared filters do not send empty query parameters', async () => {
  const client = api();
  await client.listStaffUsers(1, 20, { name: ' ', email: '', role: undefined });
  assert.equal(client.requests[0][0], '/admin/users?page=1&limit=20');
});

test('staff creation and editing keep document, role and the expected methods', async () => {
  const client = api();
  await client.inviteStaffUser({ name: 'Editor', email: 'editor@example.com', doc: '123', role: 'COLLABORATOR' });
  await client.updateStaffUser('safe/id', { name: 'Administrador', doc: '', role: 'ADMIN' });
  const [create, edit] = client.requests;
  assert.equal(create[0], '/admin/users/invitations');
  assert.equal(create[1].method, 'POST');
  assert.equal(JSON.parse(create[1].body).doc, '123');
  assert.equal(edit[0], '/admin/users/safe%2Fid');
  assert.equal(edit[1].method, 'PATCH');
  assert.deepEqual(JSON.parse(edit[1].body), { name: 'Administrador', doc: '', role: 'ADMIN' });
});

test('student actions only send access state; password recovery and deletion use the server-side identity', async () => {
  const client = api();
  await client.setStudentAccess('student', true);
  await client.setStudentAccess('student', false);
  await client.resetStudentPassword('student');
  await client.removeStudent('student');
  assert.deepEqual(client.requests.map(([url, options]) => [url, options.method, options.body]), [
    ['/admin/users/student/access', 'POST', JSON.stringify({ blocked: true })],
    ['/admin/users/student/access', 'POST', JSON.stringify({ blocked: false })],
    ['/admin/users/student/reset-password', 'POST', undefined],
    ['/admin/users/student', 'DELETE', undefined],
  ]);
});
