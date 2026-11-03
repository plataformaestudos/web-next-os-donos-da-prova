const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const origin = 'http://127.0.0.1:3146';
const api = 'http://127.0.0.1:4046';
const product = { id: '11111111-1111-4111-8111-111111111111', title: 'Reforma Tributária: 200 Questões Comentadas', description: 'Treine com questões inéditas e comentários para uma preparação com mais direção.', priceCents: 6790, status: 'ACTIVE', currentFileId: 'pdf-fixture' };
const content = {
  headline: 'A Reforma Tributária pode fazer a diferença na sua prova.', headlineHighlight: 'Sua preparação também.', heroLabel: 'Ebook de Reforma Tributária',
  description: 'Treine com 200 questões inéditas e comentadas, desenvolvidas para colocar seu conhecimento à prova antes que a banca faça isso.',
  bannerDesktopUrl: `${api}/cover.svg`, bannerMobileUrl: `${api}/cover.svg`, coverUrl: `${api}/cover.svg`, ctaText: 'Quero minhas 200 questões',
  benefitsTitle: 'Ler a teoria é importante. Saber aplicá-la é essencial.', benefitsDescription: 'Treinar com questões ajuda a identificar dúvidas e fortalecer a preparação antes do dia decisivo.',
  benefits: [
    { title: 'Além da memorização', description: 'Coloque o raciocínio à prova e descubra os pontos que merecem uma nova revisão.' },
    { title: 'Conteúdo com foco', description: 'Organize a preparação com uma abordagem direta dos temas do material.' },
    { title: 'Treino ativo', description: 'Pratique antes da prova e fortaleça sua compreensão dos conceitos.' },
  ],
  contentsTitle: 'O que você encontra no ebook?', contentsDescription: 'Conheça a estrutura do material e prepare seus próximos passos.',
  contents: [
    { title: '200 questões inéditas', description: 'Questões organizadas para exercitar o conhecimento.' },
    { title: 'Gabarito confiável', description: 'Confira suas respostas durante os estudos.' },
    { title: 'Comentários detalhados', description: 'Entenda os fundamentos de cada resposta.' },
    { title: 'Material em PDF', description: 'Leve seus estudos no celular ou computador.' },
  ],
  highlights: [{ title: '200', description: 'Questões inéditas' }, { title: '100%', description: 'Comentadas' }, { title: 'Reforma Tributária', description: 'Tema do material' }, { title: '90 páginas', description: 'Formato PDF' }],
  strategyTitle: 'Vá além da memorização.', strategyDescription: 'Prática e revisão para os seus estudos.', strategy: [{ title: 'Prática ativa', description: 'Resolva as questões e teste seu conhecimento.' }, { title: 'Interpretação e raciocínio', description: 'Leia os comentários para compreender cada resposta.' }, { title: 'Identificação de pontos críticos', description: 'Revise os temas em que encontrar dificuldades.' }],
  samplesTitle: 'Conheça o material antes de começar.', samplesDescription: 'Amostras ilustrativas usadas exclusivamente nesta fixture local.',
  samples: [{ title: 'Questões', description: 'Exemplo de uma página de questões.', imageUrl: `${api}/sample.svg` }, { title: 'Gabarito', description: 'Exemplo da organização das respostas.', imageUrl: `${api}/sample.svg` }, { title: 'Comentários', description: 'Exemplo de comentário do material.', imageUrl: `${api}/sample.svg` }],
  audienceTitle: 'Para quem é este ebook?', audienceDescription: 'Uma preparação que acompanha seus objetivos.', audience: [{ title: 'Concurseiros da área fiscal', description: 'Pratique os temas presentes no material.' }, { title: 'Estudantes de Reforma Tributária', description: 'Aprofunde seus estudos com exercícios.' }, { title: 'Candidatos em revisão', description: 'Identifique os temas que precisam de atenção.' }],
  finalTitle: 'Sua próxima questão pode revelar o que ainda falta dominar.', finalDescription: 'Garanta o material completo e comece a treinar.',
  faqTitle: 'Perguntas frequentes', faq: [{ question: 'Preciso criar conta para comprar?', answer: 'Não. A compra acontece sem criar conta e sem senha.' }, { question: 'Quando recebo o material?', answer: 'O download e o link por email são liberados após a confirmação do pagamento.' }],
  seoTitle: 'Ebook de teste', seoDescription: 'Fixture local', socialImageUrl: '', showHighlights: true, showStrategy: true, showSamples: true, showAudience: true,
};
const initial = () => ({ id: '22222222-2222-4222-8222-222222222222', ebookId: product.id, path: '/reforma-tributaria', content: structuredClone(content), sections: { benefits: true, contents: true, faq: true }, published: null });
let draft = initial();
let published = structuredClone(draft);
let state = { saves: [], uploads: 0, orders: 0 };
const book = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="580" viewBox="0 0 460 580"><rect x="62" y="25" width="330" height="510" fill="#003e65" rx="3"/><path d="M62 25h20v510H62z" fill="#002843"/><rect x="82" y="25" width="310" height="85" fill="#fff"/><text x="105" y="65" font-family="sans-serif" font-size="17" font-weight="700" fill="#003e65">OS DONOS DA PROVA</text><text x="105" y="162" font-family="sans-serif" font-size="32" font-weight="900" fill="#fff">REFORMA</text><text x="105" y="200" font-family="sans-serif" font-size="32" font-weight="900" fill="#fff">TRIBUTÁRIA</text><path d="M105 225h245" stroke="#db000b" stroke-width="5"/><text x="105" y="330" font-family="sans-serif" font-size="95" font-weight="900" fill="#fff">200</text><text x="105" y="370" font-family="sans-serif" font-size="19" fill="#cfe5ff">QUESTÕES COMENTADAS</text><text x="105" y="480" font-family="sans-serif" font-size="12" fill="#fff">MATERIAL DE TESTE • FIXTURE LOCAL</text></svg>`;
const sample = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="650"><rect width="500" height="650" fill="white"/><text x="35" y="60" font-family="sans-serif" font-size="15" font-weight="700" fill="#003e65">OS DONOS DA PROVA • AMOSTRA</text><path d="M35 90h430" stroke="#db000b" stroke-width="3"/><text x="35" y="140" font-family="sans-serif" font-size="18" font-weight="700" fill="#003e65">QUESTÃO 01</text>${Array.from({length:13},(_,i)=>`<rect x="35" y="${180+i*26}" width="${i%3===0?340:425}" height="8" fill="#e2e8f0"/>`).join('')}<text x="35" y="600" font-family="sans-serif" font-size="12" fill="#475569">Página ilustrativa para testes locais</text></svg>`;
http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const pathname = new URL(req.url, api).pathname;
  if (pathname === '/cover.svg' || pathname === '/sample.svg') { res.writeHead(200, { 'Content-Type': 'image/svg+xml' }); return res.end(pathname === '/cover.svg' ? book : sample); }
  if (pathname === '/upload.png') { res.writeHead(200, { 'Content-Type': 'image/png' }); return res.end(fs.readFileSync(path.join(__dirname, '../../public/images/passaro.png'))); }
  let raw = ''; for await (const chunk of req) raw += chunk;
  const body = req.headers['content-type']?.includes('application/json') && raw ? JSON.parse(raw) : {};
  let result = { data: [] }, status = 200;
  if (pathname === '/__state') result = { ...state, draft, published };
  else if (pathname === '/__reset') { draft = initial(); published = structuredClone(draft); state = { saves: [], uploads: 0, orders: 0 }; result = {}; }
  else if (pathname === '/auth/me') result = { id: 'local-admin', email: 'admin@example.test' };
  else if (pathname === '/profiles/me') result = { data: { id: 'profile', user_id: 'local-admin', name: 'Admin de teste', role_id: 'ebacbfdf-547f-46c7-a31d-8e83225994b7' } };
  else if (pathname === '/admin/ebooks') result = { data: [product], total: 1 };
  else if (pathname === `/admin/ebooks/${product.id}`) result = product;
  else if (pathname === '/admin/ebook-pages' && req.method === 'GET') result = { data: [draft], total: 1 };
  else if (pathname === '/admin/ebook-pages' && req.method === 'POST' || pathname === `/admin/ebook-pages/${draft.id}` && req.method === 'PATCH') { Object.assign(draft, body); state.saves.push(structuredClone(body)); result = draft; }
  else if (pathname.endsWith('/preview')) result = { page: { ...draft, ebook: product }, issues: [] };
  else if (pathname.endsWith('/images')) { state.uploads++; result = { url: `${api}/upload.png?image=${state.uploads}` }; }
  else if (pathname.endsWith('/publish')) { published = structuredClone(draft); draft.published = { path: draft.path, at: new Date().toISOString() }; result = draft; }
  else if (pathname === '/public/ebook-pages') {
    const requested = new URL(req.url, api).searchParams.get('path');
    result = { ...published, ebook: product };
    if (requested === '/ebook-legado') { result.content = { ...content }; for (const key of ['heroLabel','headlineHighlight','coverUrl','highlights','strategy','samples','audience']) delete result.content[key]; result.path = requested; }
    else if (requested !== published.path) { status = 404; result = { message: 'Não encontrada' }; }
  } else if (pathname === '/public/ebook-orders') { state.orders++; status = 400; result = { message: 'Fixture sem cobrança' }; }
  else if (pathname === '/public/plans') result = { data: [] };
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(result));
}).listen(4046, '127.0.0.1', () => console.log(`Ebook landing fixture: ${api}`));
