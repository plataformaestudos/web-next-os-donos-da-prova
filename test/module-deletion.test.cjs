const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function actions(response, failure) {
  const requests = [], tags = [], paths = [];
  const source = fs.readFileSync(path.join(__dirname, '../src/modules/delete/delete-module.action.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  const module = { exports: {} };
  const requireMock = name => {
    if (name === 'next/cache') return { revalidateTag: tag => tags.push(tag), revalidatePath: path => paths.push(path) };
    if (name === '@/util/cache-tags.util') return { CACHE_TAGS: Object.fromEntries(['MODULES', 'CHILD_MODULES', 'ROOT_MODULES', 'QUESTIONS', 'QUESTION_BOOKS', 'PLANS', 'NOTIFICATIONS', 'QUESTION_REPORTS'].map(key => [key, key])) };
    if (name === '@/util/http-client/fetch-server.util') return { default: { fetch: async (...args) => {
      requests.push(args);
      if (failure) throw failure;
      return response;
    } } };
    throw new Error(`Unexpected dependency: ${name}`);
  };
  new Function('require', 'exports', 'module', outputText)(requireMock, module.exports, module);
  return { ...module.exports, requests, tags, paths };
}

test('loads uncached server impact with an encoded module id', async () => {
  const client = actions({ data: { modules: 3, questions: 4 } });
  assert.deepEqual(await client.loadModuleDeletionImpact('safe/id'), { modules: 3, questions: 4 });
  assert.deepEqual(client.requests, [['/modules/safe%2Fid/deletion-impact', { cache: 'no-store' }]]);
  assert.deepEqual(client.tags, []);
});

test('sends the reviewed confirmation and invalidates dependent views after success', async () => {
  const client = actions({ data: {}, error: null });
  assert.deepEqual(await client.deleteModule('safe/id', 'reviewed-token'), { success: true, error: null });
  assert.deepEqual(client.requests, [['/modules/safe%2Fid', { method: 'DELETE', body: JSON.stringify({ confirmationToken: 'reviewed-token' }) }]]);
  for (const tag of ['MODULES', 'CHILD_MODULES', 'ROOT_MODULES', 'QUESTIONS', 'QUESTION_BOOKS', 'PLANS', 'NOTIFICATIONS', 'QUESTION_REPORTS']) assert.ok(client.tags.includes(tag));
  assert.ok(client.paths.includes('/question-books'));
});

test('preserves server conflicts and does not invalidate views after a rejected delete', async () => {
  const client = actions(null, new Error('O conteúdo mudou. Confira o impacto atualizado antes de excluir.'));
  assert.deepEqual(await client.deleteModule('module', 'old-token'), { success: false, error: 'O conteúdo mudou. Confira o impacto atualizado antes de excluir.' });
  assert.deepEqual(client.tags, []);
  assert.deepEqual(client.paths, []);
});
