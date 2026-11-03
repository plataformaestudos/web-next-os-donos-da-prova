# Landing de ebooks e editor — 02/11/2026

Referência: tela desktop `a3be0354cd7f473ca12a6d3219dd66d5` do projeto Stitch
`13950572830661714754`. O layout público e a prévia usam o mesmo `EbookLanding`.

A página ganhou abertura com chamada em destaque, imagem responsiva, faixa de
destaques, diferenciais, conteúdo acompanhado de capa, estratégia de estudo,
amostras, público-alvo, oferta final e FAQ expansível. O preço vem do catálogo e
os botões continuam encaminhando ao checkout de ebooks. Amostras e números do
Stitch não são inseridos automaticamente nas páginas existentes.

O editor contém os mesmos blocos em ordem, campos de texto, imagens desktop e
mobile, capa adicional, uploads de amostras e controles de visibilidade. FAQ agora
é personalizável: salvar não substitui as perguntas nem força sua exibição.
Ocultar blocos preserva textos/imagens. A marca, o mascote e os textos operacionais
de pagamento/entrega seguem o fluxo da plataforma.

Imagens locais aparecem na prévia sem serem enviadas imediatamente. Salvar usa
o endpoint ADMIN de upload e grava URLs públicas; PDFs completos permanecem
privados. Remover uma amostra ajusta também o vínculo dos uploads locais dos
itens seguintes. Rascunho e publicação continuam separados.

A prévia em iframe usa viewports de 1200 e 390 px, inclusive quando reduzida ao
lado do formulário. Estilos e tipografia são sincronizados com a página pública.
Âncoras e FAQ funcionam dentro do iframe; compras e saídas para outras páginas
ficam desabilitadas. Expandir mantém os dados do editor.

## Implantação

Implantar primeiro a API que aceita os campos opcionais, depois o frontend.
Não há migration: novos dados ficam no `content` JSONB existente, sem modificar
as três flags legadas de `sections`. Novas flags de blocos ficam em `content`.
O contrato completo está em `backend/docs/ebook-pages.md` no workspace.

O novo estilo passa a valer no deploy do frontend. Para acrescentar textos,
imagens e blocos a uma página existente, salvar o rascunho e publicar no painel.
Nada foi publicado nem alterado remotamente durante o desenvolvimento.

## Verificação

- Build dos dois repositórios, TypeScript e ESLint focado.
- 66 testes da API: autorização/DTOs/Storage simulado, limites dos campos novos,
  compatibilidade legada e validação de publicação dos blocos opcionais.
- 8 testes administrativos do frontend e 2 testes de imagens locais/listas.
- Chromium com API local: larguras 360/390/768/1440, imagens e responsividade,
  FAQ por teclado, destino de compra, página legada, edição não salva, visibilidade,
  upload/remoção de amostras, persistência de FAQ e prévia expandida.

Os builds apresentam avisos preexistentes fora dos arquivos alterados. Esses
testes não validam PostgreSQL, Supabase Storage, Asaas, entrega de emails ou
cobranças reais. Não houve mudança de esquema nem de integrações financeiras.

Para reproduzir a validação visual, use terminais separados:

```bash
node test/browser/ebook-landing-fixture.cjs
```

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4046 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:4046 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-fixture npm run build
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4046 NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:4046 NEXT_PUBLIC_SUPABASE_ANON_KEY=local-fixture npm run start -- --hostname 127.0.0.1 --port 3146
```

```bash
ODP_PLAYWRIGHT_MODULE=/caminho/para/node_modules/playwright node test/browser/ebook-landing-browser.cjs
```

O navegador bloqueia hosts externos. As imagens da fixture são ilustrações
locais de teste, não ativos enviados aos produtos. Capturas e `results.json`
ficam em `/tmp/odp-ebook-layout-artifacts`. Encerre apenas os processos criados
para esta validação ao terminar.
