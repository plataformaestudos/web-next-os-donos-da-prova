# Imagens de questões importadas

Regressão: o DOCX gera `<p><img ...></p>`, inclusive dentro de marcas como
`strong`. A extensão de imagens do editor precisa aceitar conteúdo inline;
caso contrário, o parser descarta essas imagens. URLs públicas permanecem no
HTML salvo pela API. Conteúdo composto somente por imagem também precisa ser
considerado preenchido ao serializar uma edição.

O teste usa o frontend real com uma API e um PNG locais. Não acessa banco,
Supabase ou Storage remoto. Requer Playwright e Chromium disponíveis no ambiente,
como os demais testes em `test/browser`.

Em um terminal, iniciar a fixture:

```bash
node test/browser/question-images-fixture.cjs
```

Em outro, iniciar o frontend apontando explicitamente para ela:

```bash
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4041 npm run dev -- --hostname 127.0.0.1 --port 3141
```

Executar:

```bash
node test/browser/question-images-browser.cjs
```

Se necessário, informar `ODP_PLAYWRIGHT_MODULE` com o caminho do módulo instalado
e `ODP_CHROMIUM_PATH` com o executável do Chromium.

Asserções: carregamento efetivo das imagens no enunciado, alternativas e comentário
em `questions/view`, no preview de `/questoes`, no caderno e na edição. O salvamento
precisa preservar as URLs, inclusive ao alterar uma alternativa que contém somente
imagem. Também cobre imagens legadas fora de parágrafos e erros JavaScript.

Encerrar os dois processos locais após o teste. A fixture mantém alterações apenas
em memória. Este teste não substitui a conferência de uma questão no ambiente
implantado nem verifica a disponibilidade do Storage real.
