const http = require('node:http');
const fs = require('node:fs');
const input = process.env.ODP_DOCX_GRAPHICS_DATA;
if (!input) throw new Error('Informe ODP_DOCX_GRAPHICS_DATA gerado pelo script do backend.');
const source = JSON.parse(fs.readFileSync(input, 'utf8'));
const importId = '22222222-2222-4222-8222-222222222222';
const bookId = '66666666-6666-4666-8666-666666666666';
const moduleInfo = { id: '77777777-7777-4777-8777-777777777777', name: 'Raciocínio Lógico' };
const questionId = index => `55555555-5555-4555-8555-${String(index + 1).padStart(12, '0')}`;
const items = source.items.map((item, index) => ({
  ...item, id: `33333333-3333-4333-8333-${String(index + 1).padStart(12, '0')}`,
  version: 1, reviewStatus: 'APPROVED', persistenceStatus: 'PENDING', savedQuestionId: null, saveError: null,
}));
const questions = source.items.map((item, index) => ({
  id: questionId(index), ...item.published, modules: [moduleInfo],
  alternatives: item.published.alternatives.map((a, i) => ({ id: `alternative-${index}-${i}`, text: a.text, is_correct: item.published.answer === String.fromCharCode(65 + i) })),
}));
// Extra contract fixture exercises tables/images in statements and alternatives too.
const diagram = questions[0].comment.match(/<img\b[^>]*>/)[0];
const table = questions[1].comment.match(/<table>[\s\S]*<\/table>/)[0];
const merged = '<table><tbody><tr><th colspan="2"><p>Cabeçalho</p></th><th><p>Fim</p></th></tr><tr><td rowspan="2"><p>Grupo</p></td><td><p>Valor</p></td><td><p>V</p></td></tr><tr><td><p>Outro</p></td><td><p>F</p></td></tr></tbody></table>';
questions.push({ id: questionId(2), type: 'MULTIPLE_CHOICE', text: `<p>Contrato visual de tabelas e setas</p>${diagram}${table}${merged}<p style="text-align:center">Fórmula $x_{i}^2$ e <sup>expoente</sup> / <sub>índice</sub></p><ul><li><p>Passo de uma lista</p></li></ul>`, comment: `${diagram}${table}`, modules: [moduleInfo], alternatives: [{ id: 'contract-a', text: `${diagram}${table}`, is_correct: true }, { id: 'contract-b', text: '<p>Outra alternativa</p>', is_correct: false }] });
const canonical = html => html.replace(/http:\/\/127\.0\.0\.1:4042\/storage\/v1\/object\/public\/question-images\/([0-9a-f]{64})/g, 'import-image://$1');
items.push({ ...items[0], id: '33333333-3333-4333-8333-000000000003', itemOrder: 3, sourceNumber: 3, payload: { text: canonical(questions[2].text), comment: canonical(questions[2].comment), alternatives: questions[2].alternatives.map(a => ({ text: canonical(a.text) })), type: 'MULTIPLE_CHOICE', answer: 'A', difficultyLevel: 5 } });
if (process.env.ODP_DOCX_SPACING_DATA) {
  const spacing = JSON.parse(fs.readFileSync(process.env.ODP_DOCX_SPACING_DATA, 'utf8')).items[0];
  items.push({ ...items[0], ...spacing, id: '33333333-3333-4333-8333-000000000004', itemOrder: 4, sourceNumber: 4, version: 1, reviewStatus: 'APPROVED', persistenceStatus: 'PENDING' });
  questions.push({ id: questionId(3), ...spacing.published, modules: [moduleInfo], alternatives: spacing.published.alternatives.map((a, i) => ({ id: `spacing-${i}`, text: a.text, is_correct: spacing.published.answer === String.fromCharCode(65 + i) })) });
}
const writes = [], draftWrites = [];
const summary = () => ({ totalItems: items.length, processedItems: items.length, validItems: items.length, invalidItems: 0, warningItems: 0, approvedItems: items.filter(i => i.reviewStatus === 'APPROVED').length, pendingReviewItems: items.filter(i => i.reviewStatus === 'PENDING').length, excludedItems: 0, savedItems: 0, failedItems: 0, errorCount: 0 });
const batch = () => ({ id: importId, status: 'READY', progress: 100, statusMessage: null, rootModuleId: moduleInfo.id, sourceFileName: 'Raciocínio Lógico — gráficos.docx', sourceFileSizeBytes: 20000, parserVersion: source.parserVersion, createdAt: new Date().toISOString(), startedAt: null, processedAt: new Date().toISOString(), expiresAt: null, globalErrors: [], canRetry: false, retryRequiresFile: false, summary: summary() });
const assets = { imageUrls: Object.fromEntries(Object.entries(source.urls).map(([hash, url]) => [`import-image://${hash}`, url])), imagesExpireAt: null, assetErrors: [] };
const stats = { totalQuestions: questions.length, totalAnswers: 0, correctAnswers: 0, wrongAnswers: 0, firstQuestion: 1 };
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3142');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, 'http://fixture'); const path = url.pathname;
  let raw = ''; for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  let data = [];
  if (path.startsWith('/storage/')) {
    const image = source.images.find(i => i.id === path.split('/').pop());
    if (!image) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': 'image/png' }); return res.end(Buffer.from(image.base64, 'base64'));
  }
  if (path === '/auth/me') { res.setHeader('Content-Type', 'application/json'); return res.end(JSON.stringify({ id: 'fixture-user', email: 'fixture@example.test' })); }
  if (path === '/profiles/me') data = { id: 'profile', user_id: 'fixture-user', name: 'Pessoa de teste', nickname: 'Teste', role_id: req.headers.cookie?.includes('student') ? '8f36e1ce-e12e-4237-b16b-4ad7723d8f2b' : 'ebacbfdf-547f-46c7-a31d-8e83225994b7' };
  else if (path === `/question-imports/${importId}`) data = batch();
  else if (path === `/question-imports/${importId}/summary`) data = summary();
  else if (path === `/question-imports/${importId}/items`) data = { items, total: items.length, page: 1, pageSize: 10, totalPages: 1, ...assets };
  else if (path.startsWith(`/question-imports/${importId}/items/`)) {
    const item = items.find(i => i.id === path.split('/').pop());
    if (req.method === 'PATCH') { draftWrites.push(body); item.payload = { ...item.payload, ...body.payload }; item.reviewStatus = 'PENDING'; item.version++; }
    data = { item, ...assets, summary: summary() };
  }
  else if (path.endsWith('/module-paths')) data = items.map(i => ({ modulePath: i.modulePath, count: 1 }));
  else if (path === '/modules/root-modules') data = [moduleInfo];
  else if (path === '/questions') data = { questions, modules: [moduleInfo] };
  else if (/^\/questions\/[^/]+$/.test(path)) {
    const question = questions.find(q => q.id === path.split('/').pop());
    data = { ...question, questionAlternatives: question.alternatives.map(a => ({ ...a, isCorrect: a.is_correct })) };
  }
  else if (path.startsWith('/management/questions/')) {
    const question = questions.find(q => q.id === path.split('/').pop());
    if (req.method === 'PUT') { writes.push(body); Object.assign(question, body); }
    data = question;
  }
  else if (path === '/question-books/user/study-access') data = { reason: null };
  else if (path === '/question-books/user/daily-usage') data = null;
  else if (path === `/question-books/${bookId}`) {
    const order = Number(url.searchParams.get('seq')) || 1; const question = questions[order - 1];
    data = { id: bookId, name: 'Caderno de gráficos e tabelas', questionsCount: questions.length, folder: null, questionBookStats: stats,
      nextQuestion: { ...question, id: `entry-${order}`, questionId: question.id, module: moduleInfo, alternatives: question.alternatives.map(a => ({ ...a, isCorrect: a.is_correct })), userAnswer: { alternativeId: question.alternatives.find(a => a.is_correct).id }, orderDetails: { questionOrder: order, previousOrder: order > 1 ? order - 1 : null, nextOrder: order < questions.length ? order + 1 : null, nextUnansweredOrder: null, previousUnansweredOrder: null } } };
  }
  else if (path.endsWith('/timer')) data = { questionBookId: bookId, elapsedTimeMs: 0, lastUpdated: new Date().toISOString() };
  else if (path === `/question-books/${bookId}/stats`) data = stats;
  else if (path.endsWith('/general-stats')) data = { totalAnswers: 0, correctAnswers: 0, incorrectAnswers: 0, accuracyPercentage: 0, difficulty: 5 };
  else if (path.endsWith('/stats') || path.endsWith('/user-stats')) data = null;
  else if (path === '/__state') data = { writes, draftWrites, questions };
  res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ statusCode: 200, data, total: questions.length }));
});
server.listen(4042, '127.0.0.1', () => console.log('Fixture local de gráficos/tabelas em 4042.'));
process.on('SIGTERM', () => server.close());
