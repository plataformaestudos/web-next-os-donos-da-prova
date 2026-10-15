# Intervalo no DOCX e navegação da revisão

A aba Nova importação permite informar Questão inicial e Questão final. Os
valores correspondem aos números escritos no DOCX, não à posição no lote.
Inicial em branco equivale a 1; final em branco importa até o fim do documento,
respeitando os limites de segurança do importador.

Inicial 200 ignora questões anteriores a 200 e permite um documento que já
começa nesse número. Final 200 inclui o enunciado, alternativas, resposta e todo
o comentário da questão 200, encerrando antes da próxima questão. Inicial 200
e final 500 selecionam o intervalo inclusivo. Lacunas e números fora de sequência
dentro do intervalo continuam sendo erros; uma inicial configurada não os oculta.

O formulário envia `startQuestionNumber` e `endQuestionNumber` em multipart
somente quando preenchidos. Inteiros positivos são obrigatórios e a final não
pode ser menor que a inicial. Novas tentativas enviam somente o arquivo: o backend
preserva o módulo raiz e o intervalo do lote anterior.

A revisão, o editor e o resultado da confirmação exibem o número original do
DOCX. A posição interna `itemOrder` continua sendo usada para ordenar o lote.
O acompanhamento mostra o intervalo configurado.

O diálogo de revisão oferece "Salvar e revalidar" no topo e no final. Ambos
acionam o mesmo salvamento, com as mesmas regras de permissão, alterações,
conflito de versão e proteção contra envio duplicado.

Na revisão, duas setas flutuantes permitem ir ao início da lista e ao final junto
da paginação. Os controles têm nomes acessíveis, alvos de toque de 48 pixels e
espaço reservado para não cobrir a lista. A navegação respeita a preferência de
movimento reduzido e o container que efetivamente rola no layout protegido.
Trocar página ou quantidade de itens leva ao início da lista depois de carregar
os dados correspondentes; atualizações automáticas não mudam a posição de leitura.

## Implantação

Aplicar a migration `1791936000000-question-import-number-range` no ambiente
autorizado, atualizar API e worker para a mesma versão e depois publicar o
frontend. O backend aceita uploads antigos sem intervalo, usando 1 até o fim;
o frontend novo depende da API nova para aceitar os dois campos adicionais.

O filtro de questões salvas fica para uma entrega posterior.

## Verificação

- `npm run test:question-imports`: valida limites/ordem do intervalo e os campos
  multipart enviados, inclusive a preservação das regras de retry.
- `npm run build` e ESLint dos arquivos alterados.
- Em navegador mobile e desktop: preencher início/fim, enviar DOCX, conferir
  numeração original e editor, navegar pelas setas e trocar a quantidade para 50.
- No backend: parser, revalidação, confirmação, nova tentativa e integração
  com PostgreSQL/Redis descartáveis e Pandoc 3.6.4.

Validação local em 14/10/2026: 27 testes do frontend e 265 testes do backend
aprovados; a execução padrão do backend ignorou 22 testes de integração opt-in.
Builds de produção dos dois repositórios, lint focado e `git diff --check`
aprovados. O build frontend mantém avisos preexistentes de configuração e hooks
fora dos arquivos desta mudança.
A suíte de integração PostgreSQL/BullMQ foi executada separadamente em serviços
descartáveis novos: 17 testes aprovados, incluindo o intervalo no fluxo HTTP
até a confirmação e o retry. Storage nessa integração usa um adaptador controlado;
não houve chamadas aos buckets reais. A suíte de worker em processos separados
não foi executada nesta tarefa.

Na primeira integração, o processo Jest/TypeScript ultrapassou o limite RSS de
768 MiB exigido pelo teste. A suíte completa passou com
`NODE_OPTIONS=--max-old-space-size=512`, mantendo o limite RSS original e as URLs
locais explícitas. Isso limita o heap do processo de testes e não altera a
configuração de memória do worker implantado.

A migration também foi validada em 24 lotes preexistentes de fixtures locais,
preservando dados e aplicando os padrões 1/null, com rejeição de intervalo
invertido. Essa verificação foi revertida ao final da transação.

Os testes de navegador usam frontend local e respostas HTTP controladas:
upload em 375/1440 px; revisão em 320/375/390/1280 px, setas, área de toque,
ausência de overflow horizontal, troca para 50, resposta atrasada, retorno em
cache e atualização sem reposicionar a leitura. Não equivalem a uma execução
com Supabase/Storage real ou à implantação no ambiente remoto.
