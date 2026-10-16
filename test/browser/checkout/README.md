# Validação manual do checkout

Scripts preservados da validação do redesenho de 06/10/2026. Foram movidos do
workspace para este repositório durante a limpeza de referências em 14/10/2026.
São cenários manuais e não integram automaticamente os comandos `npm test` ou a CI.
As expectativas registradas devem ser reavaliadas quando o checkout mudar.

- `browser.cjs`: etapas, formulários, consentimentos, desconto, Free e modal.
- `plan-flip-browser.cjs`: módulos, seleção, foco e movimento reduzido.
- `compact-discount-browser.cjs`: apresentação compacta do desconto.
- `discount-prices-browser.cjs`: apresentação dos valores regular e final.
- `subscription-options-browser.cjs`: opções de ciclo, texto e equivalente mensal.
- `api-fixture.cjs`: API local simulada, sem banco, cobrança ou SMTP.
- `plan-discount-selection-browser.cjs`: prévia automática ou por código nos cards,
  descontos percentual/em reais, exclusão por plano/ciclo, resumo e remoção nos dois checkouts.
- `daily-question-usage-browser.cjs`: consumo junto da questão, uma entrega por
  navegação, histórico, links diretos, estatísticas sem consumo, planos sem
  indicador, foco após inatividade e falha/recuperação sem bloquear a questão.
- `terms-cache-browser.cjs`: termos carregados só no pagamento, reutilização de
  cache, expiração, mudança de versão e bloqueio/recuperação após falha.
- `free-plan-upgrade-browser.cjs`: oferta nos bloqueios do Free, preservação da
  última questão, expiração e dispensa por sessão, abertura da aba Planos,
  exclusão de equipe/planos pagos e alternativas para falha ou ausência de oferta.
- `free-trial-ended-card-browser.cjs`: card persistente no dashboard após o Free,
  fechamento do popup, refresh, link para Planos e exclusão dos estados inelegíveis,
  nos temas claro/escuro em 360 e 1440 px.
- `free-plan-config-browser.cjs`: configuração da oferta na edição do Free,
  seleção/validação de ciclo, salvamento e recarga, oferta nos dois limites,
  outro Free com seleção automática e remoção da configuração; claro/escuro,
  360/1440 px. Usa a fixture local e não modifica planos reais.

Os três últimos scripts cobrem as features de 15/10/2026. Os scripts anteriores
preservam expectativas do checkout de 06/10 e alguns seletores pressupõem o campo
de código na etapa Pagamento; não devem ser tratados como a suíte atual dessas features.

## Execução local

Executar os comandos a partir da raiz do frontend. É necessária uma instalação
de Playwright com Chromium disponível. Ela pode ficar fora do repositório:
`ODP_PLAYWRIGHT_MODULE` aceita o caminho do módulo `playwright`; quando omitida,
os scripts usam a resolução normal do Node. `PLAYWRIGHT_BROWSERS_PATH` pode apontar
para a instalação local dos navegadores. Não foram adicionadas dependências aos lockfiles.
Os scripts de 15/10 também aceitam `ODP_CHROMIUM_EXECUTABLE_PATH` para usar
um executável Chromium já instalado.

Em terminais separados:

```sh
node test/browser/checkout/api-fixture.cjs
```

```sh
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4029 node node_modules/next/dist/bin/next dev --port 3137
```

```sh
ODP_PLAYWRIGHT_MODULE=/caminho/para/node_modules/playwright node test/browser/checkout/browser.cjs
```

O frontend deve ser aberto em `http://localhost:3137`; a API de teste atende em
`127.0.0.1:4029`. Esses endereços são compartilhados pelos scripts e pela fixture.
Os cenários interceptam o CEP e bloqueiam hosts externos. Encerre somente os
processos de teste criados para essa execução.

A fixture de consumo tem estado global descartável, configurado pelo script diário
em `/__fixture/config`. Execute esse script sem outras instâncias do mesmo teste.
Os códigos `checkout20` e `fixed20` representam respectivamente 20% e R$ 20 de
desconto; o plano Semestral e o ciclo Trimestral do Essencial ficam fora da campanha.

O cenário de upgrade usa os modos `upgrade-free` (cota de três questões) e
`expired` da fixture. Ele altera o estado descartável compartilhado; execute sem
outros cenários usando a mesma API. As ofertas não geram pagamentos.

Conferência de 15/10/2026: a execução registrada de
`free-plan-upgrade-browser.cjs` concluiu os 13 cenários, sem erros de página ou
diálogos inesperados. Inclui limite diário nos temas claro/escuro em 360 e 1440 px,
resposta da última questão antes do bloqueio, dispensa e nova tentativa, aba
Planos com refresh, expiração inicial e durante a sessão, campanhas percentual/em
reais, dispensa de pago/equipe/sem limites e catálogo indisponível/vazio. Os nomes
e as verificações do script atual correspondem ao `results.json` preservado; o
navegador não foi executado novamente nessa conferência. Foram inspecionadas as
capturas `daily-light-360.png`, `daily-dark-1440.png` e
`campaign-percentage.png`, com modal e ações dentro da tela.

As novas capturas e os resultados JSON ficam em `odp-checkout-artifacts/` dentro
do diretório temporário do sistema, separados por cenário. Use
`ODP_CHECKOUT_ARTIFACTS_DIR` para escolher outro destino fora do código-fonte.
As referências visuais, galerias e resultados históricos foram removidos;
o resumo daquela validação permanece em `docs/checkout-redesign.md`.
