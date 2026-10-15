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

## Execução local

Executar os comandos a partir da raiz do frontend. É necessária uma instalação
de Playwright com Chromium disponível. Ela pode ficar fora do repositório:
`ODP_PLAYWRIGHT_MODULE` aceita o caminho do módulo `playwright`; quando omitida,
os scripts usam a resolução normal do Node. `PLAYWRIGHT_BROWSERS_PATH` pode apontar
para a instalação local dos navegadores. Não foram adicionadas dependências aos lockfiles.

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

As novas capturas e os resultados JSON ficam em `odp-checkout-artifacts/` dentro
do diretório temporário do sistema, separados por cenário. Use
`ODP_CHECKOUT_ARTIFACTS_DIR` para escolher outro destino fora do código-fonte.
As referências visuais, galerias e resultados históricos foram removidos;
o resumo daquela validação permanece em `docs/checkout-redesign.md`.
