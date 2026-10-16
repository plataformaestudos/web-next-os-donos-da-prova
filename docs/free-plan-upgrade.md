# Oferta ao atingir os limites do Free

O aluno recebe uma oferta quando tenta abrir uma questão depois de esgotar a cota
diária ou quando termina seu período gratuito. A última questão entregue continua
disponível para resposta; atingir o contador não abre o modal durante a resolução.
Desde a correção de 16/10/2026, o bloqueio diário é avaliado para a questão escolhida:
revisões de questões já respondidas ou já contabilizadas hoje não abrem o popup
por falta de saldo. Regras em [daily-question-usage.md](daily-question-usage.md).

O modal distingue os dois motivos, mostra uma sugestão de plano com preço e módulos
e oferece **Ver planos** e **Agora não**. A primeira ação abre
`/assinatura?tab=planos`, mantendo a sessão autenticada e o checkout existente.
Esse parâmetro também funciona em acesso direto, refresh e navegação pelo cliente;
links com `campaign` continuam abrindo a aba Planos.

## Oferta

O catálogo autenticado de `/subscription-plans/availables` determina os planos
disponíveis. Cada plano Free pode definir, na administração, **Plano sugerido** e
**Ciclo apresentado** para ambos os limites. Os preços e módulos vêm do plano pago
selecionado. A consulta de acesso informa a preferência do Free do usuário,
inclusive após seu vencimento; ela não é deduzida do nome do plano ou do contador.

Sem configuração (**Seleção automática**), a sugestão usa o primeiro plano pago com ciclo anual contratável na
ordem do catálogo. Sem anual, usa o primeiro plano com ciclo recorrente válido,
respeitando seu ciclo de exibição quando disponível. Planos Free ou sem preços
recorrentes válidos não são sugeridos.

Uma preferência explícita tem prioridade sobre o anual automático. Se o plano/ciclo
configurado não estiver mais disponível para a conta, permanece o aviso com Ver
planos, sem sugerir outro plano silenciosamente. O formulário lista planos pagos
ativos e ciclos com preço positivo; salvar a escolha exige os dois campos.
Voltar à seleção automática limpa os dois. Alterar essa configuração afeta as
próximas consultas das contas vinculadas ao Free, sem mudar seus limites ou vencimento.

Essa extensão exige a migration de backend
`1792108800000-free-plan-upgrade-offer.ts`: banco → API compatível → frontend.
Ela não foi aplicada ao banco da aplicação nem a ambientes remotos nesta tarefa.

Validação da extensão em 16/10/2026: 7 testes da escolha de oferta, 20 do estado de
acesso e 7 do card do dashboard aprovados; build de produção, TypeScript, ESLint
dos arquivos alterados e `git diff --check` aprovados. Build isolado em
`/tmp/odp-free-upgrade-build-vuauyhnk`, sem substituir o `.next` da aplicação.

Quatro cenários do script `test/browser/checkout/free-plan-config-browser.cjs`
passaram com fixture local (claro/escuro, 360/1440 px): seleção de plano/ciclo,
ciclo obrigatório, envio pela server action, recarga com a escolha salva, oferta
nos avisos diário e de vencimento, destino indisponível sem troca silenciosa,
outro Free usando a seleção automática, retorno ao automático e ausência dos
campos ao editar um plano pago. Artefatos em
`/tmp/odp-checkout-artifacts/free-plan-config/`; capturas mobile clara do formulário
e desktop escura do aviso inspecionadas. Os testes de navegador usam API simulada;
persistência e migration reais foram verificadas separadamente no PostgreSQL
descartável do backend, com 118 testes relacionados aprovados. Nenhuma contratação
ou cobrança real foi realizada.

A oferta reutiliza o estilo do card e os cálculos/preços de campanha do checkout.
Mostra o total e a periodicidade de cobrança, sem representar recorrência como
parcelamento. A prévia de campanha é somente leitura; não cria cotação nem inicia
pagamento. A contratação continua revalidando preço e elegibilidade no fluxo
existente. Sem oferta disponível ou em falha de consulta, o motivo do bloqueio e os
botões permanecem acessíveis.

## Estado e repetição

`GET /question-books/user/study-access` fornece o estado confirmado pelo backend,
com `Cache-Control: private, no-store`. O cliente não deduz bloqueios pelo contador
nem por mensagens de erro. Só os códigos estruturados de HTTP 403
`FREE_DAILY_LIMIT_REACHED` e `FREE_TRIAL_EXPIRED` abrem o modal de bloqueio; outros
erros mantêm seu tratamento existente.

O período encerrado também abre um aviso automático na entrada. A marca de exibição
fica no `sessionStorage`, por usuário e vencimento: fechar e atualizar a página não
repete esse aviso. Login/logout limpam as marcas. Uma nova tentativa explícita
bloqueada pode reabrir o modal. O aviso não abre nas rotas de assinatura, checkout
ou autenticação, e equipe/plano pago ativo não recebem oferta por limite Free.

A consulta opcional é revalidada no vencimento, na renovação da cota, ao retornar
da assinatura e ao voltar à aba após pelo menos um minuto. Não há polling por
navegação. Consultas antigas são canceladas ao receber um bloqueio mais recente,
desmontar o provider ou trocar usuário; falhas opcionais não exibem alerta global
nem navegam para trás. Bloqueios na abertura inicial do caderno têm uma tela de
alternativa com Ver planos e Tentar novamente, em vez da página genérica de erro.

## Card no dashboard após o Free

Quando o backend confirma `FREE_TRIAL_EXPIRED`, o espaço do consumo mostra
“Seu período gratuito terminou”, “Veja os planos para continuar estudando” e o
link `/assinatura?tab=planos`. Não apresenta barras nem saldo do plano vencido.
O aviso permanece após fechar o popup e atualizar a página.

O dashboard reutiliza o estado confirmado no `StudyAccessProvider`, sem nova
consulta. A elegibilidade continua sendo a da API: aluno sem assinatura válida,
cuja última assinatura foi um Free vencido. Plano pago ativo, última assinatura
paga, histórico ausente, Free inativo ainda não vencido e equipe não recebem esse
aviso. Uma consulta que falha não inventa um estado de expiração. A confirmação de
nova assinatura válida retira o aviso; um snapshot antigo do consumo não substitui
um vencimento mais recente já confirmado.

O card do Free válido mantém consumo, barra, dias restantes e vencimento em
Brasília. O texto de dias utilizados foi removido conforme solicitado. A regra do
popup permanece igual, e não foi acrescentada notificação no header.

Verificação focada do dashboard: `node test/dashboard-free-trial-ended.test.cjs`.
Validação em navegador: `test/browser/checkout/free-trial-ended-card-browser.cjs`
com a fixture local, nos temas claro/escuro em 360 e 1440 px.

Validação deste card em 16/10/2026:

- 7 testes do dashboard, 19 do estado de acesso e 6 dos indicadores aprovados.
- 18 testes do contrato de acesso no backend aprovados, com repositórios simulados.
- Os 4 cenários de navegador passaram com API simulada local: persistência após
  fechar o popup e atualizar, navegação para a aba Planos, exclusão de plano pago,
  equipe, histórico ausente, última assinatura paga e Free inativo ainda válido.
  Também foi conferido o retorno ao card de consumo para um Free válido.
- Capturas de celular claro e desktop escuro inspecionadas. Resultados e capturas
  em `/tmp/odp-checkout-artifacts/free-trial-ended-card/`.
- Build de produção, TypeScript, ESLint dos componentes alterados e
  `git diff --check` aprovados. Build e tipos executados em cópia isolada em
  `/tmp/odp-free-upgrade-build-p9y9sx4g`, sem alterar o ambiente da aplicação.

Esses testes não acessaram produção nem validaram uma contratação real.

## Validação e publicação

O cenário manual de navegador fica em
`test/browser/checkout/free-plan-upgrade-browser.cjs`, usando a API simulada do
mesmo diretório; requisitos no [README](../test/browser/checkout/README.md).

Validação local conferida em 15/10/2026, sem acesso a serviços reais:

| Comando | Resultado |
| --- | --- |
| `node test/free-plan-study-access.test.cjs` | 19 testes aprovados |
| `node test/free-plan-upgrade-offer.test.cjs` | 5 testes aprovados |
| `node test/auth-logout.test.cjs` | 7 testes aprovados |
| `node test/dashboard-free-plan.test.cjs` | 6 testes aprovados |
| `node test/daily-question-usage.test.cjs` | 7 testes aprovados |
| `node test/affiliates.test.cjs` | 6 testes aprovados |
| `node test/affiliate-discount-ui.test.cjs` | 7 testes aprovados |
| `node test/affiliate-plan-preview.test.cjs` | 9 testes aprovados |
| `node test/affiliate-referral-code.test.cjs` | 13 testes aprovados |

Os 79 testes passaram sem falhas ou testes ignorados. A execução já concluída do
navegador registrou 13 cenários aprovados em
`/tmp/odp-checkout-artifacts/free-plan-upgrade/results.json`: limite diário nos
temas claro/escuro em 360 e 1440 px; acesso inicialmente expirado, dispensa e
refresh da aba Planos; expiração durante uma sessão aberta; campanhas percentual
e em reais; exclusão de plano pago, equipe e plano sem limites; catálogo com erro
ou vazio. O script atual foi conferido contra esses resultados sem repetir a
execução. As capturas mobile clara, desktop escura e campanha percentual também
foram inspecionadas: oferta e ações visíveis, modal dentro da tela e última
questão preservada.

O build de produção (`npm run build`) também passou com código de saída 0 em
cópia isolada do frontend em `/tmp/odp-free-upgrade-build-emx9yxme`, fora do
sandbox: compilação, lint/tipos e geração de 36 páginas concluídos. Permaneceram
avisos legados de `experimental.appDir`, Browserslist, dependências de hooks e
uso de imagem; não foi necessário alterar fonte, configuração ou variáveis de
ambiente para aprovar o build. `npx tsc --noEmit` passou na mesma cópia após o build.

Publicar a API compatível antes do frontend. A extensão de oferta por plano Free
exige a migration descrita em Oferta. As fixtures não validam Supabase, Asaas ou webhooks reais e não geram
cobranças. A validação com a API real de homologação e a publicação não fazem
parte dessas evidências locais.
