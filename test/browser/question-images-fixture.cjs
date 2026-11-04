const http = require('node:http');

const apiOrigin = 'http://127.0.0.1:4041';
const questionId = '55555555-5555-4555-8555-555555555555';
const bookId = '66666666-6666-4666-8666-666666666666';
const imageUrl = `${apiOrigin}/storage/v1/object/public/question-images/question-imports/fixture/image`;
const image = alt => `<img src="${imageUrl}" alt="${alt}" style="width: 2in; height: 1in;" draggable="true">`;
const moduleInfo = { id: '77777777-7777-4777-8777-777777777777', name: 'Lógica' };
// Same paragraph/mark structure produced by the DOCX renderer, plus legacy block images.
let question = {
  id: questionId, type: 'MULTIPLE_CHOICE',
  text: `<p>Questão importada com imagem ${image('Enunciado')}</p>`,
  comment: `<p><strong>Diagrama ${image('Comentário')}</strong></p>`,
  alternatives: [
    { id: 'alternative-a', text: `<p>${image('Alternativa')}</p>`, is_correct: true },
    { id: 'alternative-b', text: image('Imagem legada'), is_correct: false },
  ],
  modules: [moduleInfo],
};
const stats = { totalQuestions: 1, totalAnswers: 0, correctAnswers: 0, wrongAnswers: 0, firstQuestion: 1 };
const writes = [];

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3141');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  let raw = '';
  for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  const path = new URL(req.url, apiOrigin).pathname;
  let data = [];
  if (path.startsWith('/storage/')) {
    // A local bitmap lets the browser assert a successful load, not just an <img> tag.
    res.writeHead(200, { 'Content-Type': 'image/png' });
    return res.end(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9XcAAAAASUVORK5CYII=', 'base64'));
  }
  if (path === '/auth/me') {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ id: 'fixture-admin', email: 'admin@example.test' }));
  }
  if (path === '/profiles/me') data = { id: 'fixture-profile', user_id: 'fixture-admin', role_id: 'ebacbfdf-547f-46c7-a31d-8e83225994b7', name: 'Admin de teste', nickname: 'Admin' };
  else if (path === '/questions') data = { questions: [question], modules: [moduleInfo] };
  else if (path === `/questions/${questionId}`) data = { ...question, questionAlternatives: question.alternatives.map(a => ({ ...a, isCorrect: a.is_correct })) };
  else if (path === `/management/questions/${questionId}`) {
    if (req.method === 'PUT') { writes.push(body); question = { ...question, ...body }; }
    data = question;
  }
  else if (path === '/question-books/user/study-access') data = { reason: null };
  else if (path === '/question-books/user/daily-usage') data = null;
  else if (path === `/question-books/${bookId}`) data = {
    id: bookId, name: 'Caderno com imagens', questionsCount: 1, folder: null, questionBookStats: stats,
    nextQuestion: {
      ...question, id: 'book-entry', questionId, module: moduleInfo,
      alternatives: question.alternatives.map(a => ({ ...a, isCorrect: a.is_correct })),
      userAnswer: { alternativeId: 'alternative-a' },
      orderDetails: { questionOrder: 1, previousOrder: null, nextOrder: null, nextUnansweredOrder: null, previousUnansweredOrder: null },
    },
  };
  else if (path === `/question-books/${bookId}/stats`) data = stats;
  else if (path === `/question-books/${bookId}/timer`) data = { questionBookId: bookId, elapsedTimeMs: 0, lastUpdated: new Date().toISOString() };
  else if (path.endsWith('/general-stats')) data = { totalAnswers: 0, correctAnswers: 0, incorrectAnswers: 0, accuracyPercentage: 0, difficulty: 5 };
  else if (path.endsWith('/stats')) data = null;
  else if (path === '/__state') data = { writes, question };
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ statusCode: 200, total: 1, data }));
});
server.listen(4041, '127.0.0.1', () => console.log('Fixture de imagens local em 4041; sem banco ou Storage remoto.'));
process.on('SIGTERM', () => server.close());
