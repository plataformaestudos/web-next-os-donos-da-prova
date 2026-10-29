const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function client() {
  const requests = [];
  const source = fs.readFileSync(path.join(__dirname, '../src/ebooks/admin/api.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  const module = { exports: {} };
  const requireMock = (name) => {
    if (name === '@/util/http-client/fetch-client.util') return { default: { fetch: async (...args) => { requests.push(args); return {}; } } };
    throw new Error(`Unexpected dependency: ${name}`);
  };
  new Function('require', 'exports', 'module', outputText)(requireMock, module.exports, module);
  return { ...module.exports, requests };
}
test('price input preserves cents and accepts Brazilian decimal notation', () => {
  const api = client();
  for (const [input, cents] of [['19,90', 1990], ['0.29', 29], ['1', 100], [' 1,2 ', 120], ['21474836,47', 2147483647]]) assert.equal(api.reaisToCents(input), cents);
  for (const input of ['', '0', '-1', '1.234', 'NaN', '1e3', '21.474.836,47', '21474836,48']) assert.throws(() => api.reaisToCents(input));
});
test('catalog pagination, create and update match backend contracts', async () => {
  const api = client();
  await api.adminEbookApi.ebooks(3);
  await api.adminEbookApi.saveEbook(undefined, { title: 'Livro', description: 'Texto', priceCents: 1990 });
  await api.adminEbookApi.saveEbook('product-id', { title: 'Livro', description: 'Texto', priceCents: 1990, status: 'ACTIVE' });
  assert.equal(api.requests[0][0], '/admin/ebooks?page=3&limit=20');
  assert.equal(api.requests[1][1].method, 'POST');
  assert.equal(api.requests[2][1].method, 'PATCH');
  assert.equal(JSON.parse(api.requests[2][1].body).priceCents, 1990);
  for (const [, options, , errorOptions] of api.requests) { assert.equal(options.cache, 'no-store'); assert.notEqual(options.credentials, 'omit'); assert.equal(errorOptions.suppressGlobalError, true); }
});
test('hiding sections persists their structured content and all explicit flags', async () => {
  const api = client();
  const data = { ebookId: 'product-id', path: '/ebooks/livro', sections: { benefits: false, contents: false, faq: false }, content: { benefits: [{ title: 'Preservado', description: 'Texto' }], contents: [{ title: 'Conteúdo', description: 'Texto' }], faq: [{ question: 'Pergunta', answer: 'Resposta' }] } };
  await api.adminEbookApi.savePage('page-id', data);
  assert.equal(api.requests[0][0], '/admin/ebook-pages/page-id');
  assert.deepEqual(JSON.parse(api.requests[0][1].body), data);
});
test('preview, draft save, publish and unpublish are separate authenticated operations', async () => {
  const api = client();
  await api.adminEbookApi.preview('page-id');
  await api.adminEbookApi.publish('page-id');
  await api.adminEbookApi.unpublish('page-id');
  assert.deepEqual(api.requests.map(([url, options]) => [url, options.method || 'GET']), [
    ['/admin/ebook-pages/page-id/preview', 'GET'], ['/admin/ebook-pages/page-id/publish', 'POST'], ['/admin/ebook-pages/page-id/unpublish', 'POST'],
  ]);
  assert.equal(api.requests.some(([url]) => url.includes('public/ebook-orders')), false);
});
test('file and banner uploads use backend multipart with the expected file field', async () => {
  const api = client();
  const pdf = new File(['%PDF-'], 'livro.pdf', { type: 'application/pdf' });
  await api.adminEbookApi.uploadPdf('product-id', pdf);
  await api.adminEbookApi.uploadImage('page-id', new File(['image'], 'banner.png', { type: 'image/png' }));
  assert.equal(api.requests[0][0], '/admin/ebooks/product-id/files');
  assert.equal(api.requests[1][0], '/admin/ebook-pages/page-id/images');
  for (const [, options] of api.requests) { assert.ok(options.body instanceof FormData); assert.ok(options.body.get('file') instanceof File); assert.equal(options.method, 'POST'); }
});
test('orders and email status use administrative endpoints without visitor tokens', async () => {
  const api = client();
  await api.adminEbookApi.orders(2);
  await api.adminEbookApi.order('order-id');
  await api.adminEbookApi.email('order-id');
  await api.adminEbookApi.resend('order-id');
  assert.deepEqual(api.requests.map(([url]) => url), ['/admin/ebook-orders?page=2&limit=20', '/admin/ebook-orders/order-id', '/admin/ebook-orders/order-id/email', '/admin/ebook-orders/order-id/email']);
  assert.equal(api.requests[3][1].method, 'POST');
  assert.ok(api.requests.every(([, options]) => options.body === undefined));
});
test('DELETE accepts the backend 204 response and includes session credentials', async () => {
  const api = client();
  const previous = global.fetch;
  let request;
  global.fetch = async (...args) => { request = args; return new Response(null, { status: 204 }); };
  try { await api.removeEbookPage('page-id'); assert.equal(request[1].method, 'DELETE'); assert.equal(request[1].credentials, 'include'); }
  finally { global.fetch = previous; }
});
test('draft dirty checking ignores JSONB/Form key order but detects text and visibility changes', () => {
  const api = client();
  const first = { ebookId: 'id', path: '/ebooks/teste', content: { headline: 'Título', benefits: [{ title: 'Item', description: 'Descrição' }] }, sections: { benefits: true, faq: false, contents: false } };
  const reordered = { path: '/ebooks/teste', ebookId: 'id', sections: { faq: false, contents: false, benefits: true }, content: { benefits: [{ description: 'Descrição', title: 'Item' }], headline: 'Título' } };
  assert.equal(api.equalPageDrafts(first, reordered), true);
  assert.equal(api.equalPageDrafts(first, { ...reordered, sections: { ...reordered.sections, benefits: false } }), false);
  assert.equal(api.equalPageDrafts(first, { ...reordered, content: { ...reordered.content, headline: 'Outro título' } }), false);
});
