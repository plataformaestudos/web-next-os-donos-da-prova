const http = require('node:http');
const id = '10000000-0000-4000-8000-000000000001';
let state = { blocked: false, conflict: false, deleted: false, deletes: 0, previews: 0 };
const roles = { admin: 'ebacbfdf-547f-46c7-a31d-8e83225994b7', collaborator: '8756e86c-a51f-418e-ac9a-8d37fff454b0', student: '8f36e1ce-e12e-4237-b16b-4ad7723d8f2b' };
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3139');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  let raw = ''; for await (const chunk of req) raw += chunk;
  const body = raw ? JSON.parse(raw) : {};
  const path = new URL(req.url, 'http://fixture').pathname;
  const role = /fixture-(admin|collaborator|student)/.exec(req.headers.cookie || '')?.[1] || 'admin';
  let status = 200, result = { data: [] };
  if (path === '/__state') {
    if (req.method === 'POST') state = { blocked: false, conflict: false, deleted: false, deletes: 0, previews: 0, ...body };
    result = state;
  } else if (path === '/auth/me') result = { id: 'local-fixture', email: 'local@example.test' };
  else if (path === '/profiles/me') result = { data: { id: 'local-profile', user_id: 'local-fixture', name: 'Equipe de teste', nickname: null, role_id: roles[role] } };
  else if (path === '/modules/root-modules') result = { data: state.deleted ? [] : [{ id, name: 'Módulo de teste', numberQuestions: 10, treeCode: '1', parentModuleId: null, isLeaf: true }] };
  else if (path === `/modules/${id}/deletion-impact`) {
    state.previews++;
    result = { data: { moduleId: id, moduleName: 'Módulo de teste', modules: 3, questions: 8, sharedQuestions: 2, questionBooks: 4, bookItems: 12, answers: 7, blockedByImports: state.blocked, confirmationToken: 'a'.repeat(64) } };
  } else if (path === `/modules/${id}` && req.method === 'DELETE') {
    state.deletes++;
    if (role !== 'admin') { status = 403; result = { message: 'Acesso negado.' }; }
    else if (state.conflict) { state.conflict = false; status = 409; result = { message: 'O conteúdo mudou. Confira o impacto atualizado antes de excluir.' }; }
    else if (body.confirmationToken !== 'a'.repeat(64)) { status = 400; result = { message: 'Confirmação ausente.' }; }
    else { state.deleted = true; result = { data: {} }; }
  } else if (path.includes('count')) result = { data: 0 };
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
});
server.listen(4039, '127.0.0.1', () => console.log('Module deletion fixture: http://127.0.0.1:4039'));
