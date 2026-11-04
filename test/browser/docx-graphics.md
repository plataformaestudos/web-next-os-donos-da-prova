# Setas, símbolos e tabelas do Word

Para incluir o comentário real com espaçamento, gerar também no backend:

```bash
PANDOC_BIN=/caminho/para/pandoc-3.6.4 \
node -r ts-node/register -r tsconfig-paths/register scripts/docx-graphics-evidence.ts \
  /tmp/odp-spacing-evidence/browser-data.json \
  test/fixtures/question-imports/documents/raciocinio-logico-espacamento.docx
```

Passar `ODP_DOCX_SPACING_DATA=/tmp/odp-spacing-evidence/browser-data.json` ao iniciar
a fixture, junto de `ODP_DOCX_GRAPHICS_DATA`. Executar
`node test/browser/docx-spacing-browser.cjs` para conferir 20 linhas vazias reais,
altura visível, ausência de espaço extra entre as pistas e preservação após
editar/salvar/reabrir, no preview e nas telas de estudo, em desktop e celular.
Para incluir o mesmo comentário na comparação de pixels, passar
`ODP_DOCX_SPACING_DATA` também ao executar `preview-parity-browser.cjs`.
As evidências específicas ficam em `/tmp/odp-spacing-evidence/browser`.

O preview somente leitura usa o próprio `TiptapEditor` da plataforma, após resolver
exclusivamente as imagens autorizadas do rascunho. O editor de revisão compartilha
o schema, incluindo tabelas, listas, alinhamento, links, subscritos/sobrescritos e
fórmulas. Fonte, espaçamento, bordas e dimensões usam o mesmo CSS. O HTML do DOCX
não é injetado diretamente na página.

Além da matriz de edição abaixo, executar com os mesmos servidores locais:

```bash
node test/browser/preview-parity-browser.cjs
```

O teste compara HTML normalizado, estilos computados, dimensões e igualdade dos
pixels entre preview, `questions/view`, administração e cadernos. Exercita desktop
e celular, setas/tabela e um enunciado rico com células mescladas, lista, expoente
e fórmula. A largura do conteúdo é igualada, e a captura usa a mesma posição sobre
fundo branco, sem marca d'água externa. Os estilos são medidos nos componentes
originais. Metadados, botões e a largura disponível de cada tela são distintos;
o renderizador do conteúdo é o mesmo. Evidências ficam em
`/tmp/odp-docx-evidence/parity` ou `ODP_PREVIEW_PARITY_ARTIFACTS`.

Se o frontend real estiver aberto na porta 3000, usar uma cópia isolada do projeto
para o teste da porta 3142. Não compartilhar `.next` entre servidores ou entre
`next dev` e `next build`. Se a cópia usar um symlink para `node_modules` fora
do projeto, iniciar sem `--turbopack` para que o Webpack resolva as dependências.

O teste carrega dados produzidos pelo parser real do backend, a partir do recorte
das questões com setas e tabela de Raciocínio Lógico. A API e o Storage usados
pelo navegador são fixtures locais; nenhum dado é enviado a serviços reais.

No repositório do backend, preparar os dados:

```bash
PANDOC_BIN=/caminho/para/pandoc-3.6.4 \
node -r ts-node/register -r tsconfig-paths/register scripts/docx-graphics-evidence.ts \
  /tmp/odp-docx-evidence/browser-data.json
```

No frontend, iniciar a fixture em um terminal:

```bash
ODP_DOCX_GRAPHICS_DATA=/tmp/odp-docx-evidence/browser-data.json \
node test/browser/docx-graphics-fixture.cjs
```

Em outro terminal, iniciar o frontend apontando explicitamente para a fixture:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4042 \
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3142 --turbopack
```

Executar com Playwright/Chromium instalados:

```bash
node test/browser/docx-graphics-browser.cjs
```

Se necessário, indicar `ODP_PLAYWRIGHT_MODULE` e `ODP_CHROMIUM_PATH` como nos
demais testes de navegador. Screenshots e resultados ficam em
`/tmp/odp-docx-evidence/browser`, ou em `ODP_DOCX_GRAPHICS_ARTIFACTS`.

Cobertura:

- Preview da importação e edição de rascunhos, preservando referências canônicas.
- `questions/view`, visualização administrativa e edição/salvamento da questão.
- Preview das listas geral e por módulo.
- Caderno de questões e resolução após resposta.
- Formulário de nova questão com conteúdo estruturado.
- Imagens, tabelas e símbolos no enunciado, alternativas e comentários; células
  mescladas com `rowspan`/`colspan`.
- Desktop ADMIN e celular STUDENT nas telas de estudo; carregamento efetivo dos
  PNGs, dimensões originais, bordas e células da tabela, ausência de erros JavaScript.

Encerrar somente os dois processos iniciados para o teste. As fixtures mantêm
alterações em memória. Upload/fila, persistência SQL e Storage reais não fazem
parte deste teste. O DOCX completo fornecido pelo usuário é mantido fora do Git.
