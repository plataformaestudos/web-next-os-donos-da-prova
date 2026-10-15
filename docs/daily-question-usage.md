# Consumo diário no caderno

Implementado em 15/10/2026. O cabeçalho do caderno mostra uma barra compacta com
questões distintas visualizadas hoje e limite diário para alunos Free. No desktop,
fica junto às estatísticas; no celular, em linha própria. Ocultar acertos e erros
mantém o indicador de consumo visível. Ao atingir o limite, aparece o link Ver planos.

O consumo vem em `data.nextQuestion.dailyUsage` ao abrir o caderno e em
`data.dailyUsage` na resposta de próxima questão, depois de registrar as visualizações.
Contém limite, visualizadas/restantes hoje e `dailyResetAt`, ou `null` para plano
pago, equipe e Free sem limite. A elegibilidade é verificada antes de consultar a
contagem do indicador. Cota explicitamente zero permanece esgotada.

Durante a navegação, uma única requisição entrega questão e consumo. A URL mantém
a sequência pelo histórico nativo do navegador; Voltar/Avançar e links diretos são
suportados. A abertura inicial respeita `seq`/`seqRandom`, evitando entregar uma
questão padrão antes da solicitada. A interface mantém o contador confirmado
durante a troca, com o carregamento centralizado já utilizado pelo caderno.

`GET /question-books/user/daily-usage` permanece autenticado e sem gravações, apenas
para a virada do dia, retorno após pelo menos um minuto sem nova entrega/consulta,
ou tentativa manual. Só um snapshot de Free com limite habilita essa consulta no
cliente; planos pagos/equipe não a executam. Revalidações mantêm o contador visível.
Se a leitura do consumo falhar após uma questão já entregue, o backend omite o
campo; a interface conserva o último valor confirmado, indica a falha e oferece
nova tentativa. Não inventa saldo nem incrementa localmente.

Responder atualiza estatísticas por `GET /question-books/:id/stats`, que exige
sessão, UUID e propriedade do caderno ou acesso de equipe. Essa leitura não entrega
outra questão e não altera visualizações. As respostas de entrega, estatísticas e
consumo têm `Cache-Control: private, no-store`.

A mudança preserva a regra de limite do acesso às questões e o endpoint legado
`/question-books/user/question-limit`. Requer publicar o backend antes do frontend;
não há migration ou configuração externa nova.

Validação local: testes do serviço de consumo e controller HTTP no backend,
`node --test test/dashboard-free-plan.test.cjs test/daily-question-usage.test.cjs`
e `test/browser/checkout/daily-question-usage-browser.cjs`. Os testes de navegador
usam API simulada, conforme `test/browser/checkout/README.md`.
