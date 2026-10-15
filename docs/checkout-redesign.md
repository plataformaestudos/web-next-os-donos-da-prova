# Redesenho do checkout

Implementação de 06/10/2026 na branch `feat/checkout-redesign`, criada a partir de `feat/affiliate-discounts` para preservar a integração de campanhas existente. Referências: telas Plano, Dados pessoais e Pagamento do projeto Stitch `4326224785775341960`. Os arquivos locais dessas referências foram removidos após a entrega, na limpeza de 14/10/2026.

## Interface

- Marca local, cores e tipografia da plataforma, card central e indicador horizontal de etapas; conteúdo acompanha a altura da página.
- Planos em duas colunas no desktop e uma no celular, seleção por teclado, busca e preços do contrato atual. “Ver módulos” vira o card em 180°; o verso apresenta os módulos e a ação “Voltar”, sem alterar a seleção.
- Dados pessoais agrupados em identificação, endereço e acesso. CEP mantém consulta e alternativa manual; painel de senha reflete os quatro requisitos existentes.
- Pagamento apresenta ciclo, código de campanha, cotação, cartão e aceites. A oferta aplicada usa um bloco compacto com código, valor original riscado e total com desconto lado a lado por ciclo; condições completas ficam em “Detalhes do desconto”.
- As opções de assinatura mostram o total cobrado e o equivalente mensal, como “Trimestral — R$ 140,00 cobrados a cada 3 meses — R$ 46,67/mês”. O anual recebe “⭐ Custo-benefício” na lista e a estrela na seleção. O equivalente mensal é informativo; a periodicidade de cobrança permanece a do ciclo.
- Contratação autenticada reutiliza ciclo, desconto e formulário de cartão. Cartões de plano preservam a alternância para módulos com foco na face visível.
- Tela de sucesso acompanha a identidade do checkout e mantém o destino de login.

## Comportamentos preservados

| Caminho/estado | Comportamento |
| --- | --- |
| Novo usuário pago | Plano → dados pessoais → pagamento; cartão e dois aceites explícitos antes do envio. |
| Novo usuário Free | Duas etapas; payload FREE, cartão vazio e opção de salvar cartão desligada. |
| Usuário logado | Contratação em modal; mantém identidade, validações e aceite existentes. |
| Plano sem ciclo contratável | Excluído da seleção pública; contratação indisponível no card autenticado. |
| Retorno entre etapas | Formulários permanecem montados para preservar dados, plano, cartão e aceites. |
| Troca de plano/ciclo | Revalida a oferta; cotação pendente ou inválida impede confirmação. |
| Código inválido após oferta válida | Mantém oferta anterior conforme o fluxo existente. |
| Remoção do código | Permite contratação pelo valor regular após concluir a atualização. |
| Envio repetido/falha | Preserva bloqueio síncrono de envio, estado de carregamento e recuperação do erro. |

As requisições continuam pelas rotas Next `/api/affiliate-checkout/new-user` e `/api/affiliate-checkout/existing-user`. Não foram modificados contratos, regras financeiras, migrations ou código do backend. O redesenho não acrescenta métodos de pagamento, parcelamento, garantias ou benefícios comerciais.

## Validação

- Build de produção com `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:4029 npm run build`: aprovado.
- `npx tsc --noEmit`: aprovado.
- ESLint dos arquivos alterados com `--max-warnings 0`: aprovado.
- `git diff --check`: aprovado.
- `npm run test:affiliates`: aprovado, sem testes ignorados; inclui rejeição de cotação expirada e incompatível no encaminhamento da contratação.
- `npm run test:auth`: sete testes aprovados, sem testes ignorados.

O build apresentou avisos preexistentes em configuração e arquivos fora desta alteração. O frontend foi compilado contra uma API local de teste; nenhuma cobrança real foi gerada.

Validação final em Chromium/Playwright contra a API local: **22 checks funcionais aprovados**, **33 capturas**, nenhuma exceção JavaScript e nenhum transbordamento horizontal do checkout. Temas claro/escuro e larguras 360, 390, 768 e 1440 px. O seletor de ciclo passou ainda por 16 medições de texto, sem cortes horizontais ou verticais.

Os cenários cobrem busca/seleção por teclado, módulos, navegação/foco, senha divergente, CEP consultado/manual, preservação de campos, cadastro Free, consentimentos explícitos, campanha válida/inválida/removida, mudança de plano/ciclo, cotação pendente/expirada, envio repetido e recuperação de erro nos dois checkouts. O Free chegou à tela de sucesso e manteve o destino de login. As falhas pagas foram respostas deliberadas da fixture; os logs de 404/409 correspondem aos cenários negativos.

As capturas, galerias e resultados históricos foram removidos na limpeza de 14/10/2026. Os seis scripts de validação foram preservados em [test/browser/checkout](../test/browser/checkout/README.md). As novas capturas e resultados são gravados no diretório temporário do sistema; os comandos e requisitos de execução manual estão no README dessa pasta. Os resultados descritos neste documento se referem à validação original, não a uma nova execução após a limpeza.

Next, API de teste e navegador criados para esta execução foram encerrados após salvar os artefatos. Nenhum serviço externo real foi chamado pelo navegador; a consulta de CEP foi interceptada com respostas de teste.

### Validação da animação dos planos

O card usa rotação 3D de 500 ms, frente/verso com altura natural e transferência de foco entre “Ver módulos” e “Voltar”. A face oculta fica `inert` e fora da árvore de acessibilidade. A preferência `prefers-reduced-motion` remove a animação.

Build, ESLint focado e `git diff --check` aprovados após essa alteração. Nove cenários de navegador aprovados: os dois temas em 360/390/768/1440 px e a preferência de movimento reduzido. Verificados rotação, seleção preservada, plano não selecionado permanecendo assim, retorno por teclado, módulos vazios, foco, continuação para dados pessoais e ausência de overflow/exceções JavaScript.

Script preservado: `test/browser/checkout/plan-flip-browser.cjs`.

### Validação do desconto compacto

O bloco aplicado tem fundo discreto, padding menor, valor original riscado ao lado do total de 15 px e remoção como link. Os valores vêm de `baseAmountCents` e `finalAmountCents` da cotação vigente; rótulos próprios para leitores de tela distinguem os dois preços. O detalhamento mantém valores regular/desconto/final, periodicidade, renovação e elegibilidade em uma expansão nativa acessível por teclado. A lógica de aplicação, revalidação e bloqueio da contratação foi preservada.

Build, ESLint focado, `git diff --check` dos arquivos de desconto e testes de afiliados aprovados. Oito cenários adicionais no navegador aprovados: cadastro/modal, claro/escuro, 360/1440 px; preço original riscado e preços lado a lado, detalhes por teclado, manutenção da oferta após código inválido e remoção. Bloco fechado medido entre 102 e 165 px, sem overflow ou exceções JavaScript. Validação com fixtures locais, sem cobranças.

Script preservado: `test/browser/checkout/compact-discount-browser.cjs`.

Script de comparação de preços preservado: `test/browser/checkout/discount-prices-browser.cjs`.

### Validação das opções de assinatura

Equivalente mensal calculado em centavos, arredondado para duas casas e formatado em reais. O destaque do anual usa `StarFilled` dourado na seleção e na opção “Custo-benefício”, sem depender de fonte de emoji.

Build de produção em cópia isolada, ESLint do componente, verificação de espaços focada e testes de afiliados aprovados. Oito cenários no navegador aprovados (cadastro/modal, claro/escuro, 360/1440 px): valores dos quatro ciclos, troca trimestral/anual, estrela visível, texto sem corte, desconto aplicado/removido e ausência de overflow/exceções JavaScript. O build isolado preservou os arquivos gerados pelo servidor de desenvolvimento do workspace.

Script preservado: `test/browser/checkout/subscription-options-browser.cjs`.

## Limites

Testes locais com fixtures verificam a interface e o encaminhamento das requisições, sem validar Asaas, Supabase ou webhooks reais. A integração financeira em homologação/Asaas Sandbox continua sendo uma etapa externa, com contas descartáveis. Nenhum commit, push, PR ou deploy foi realizado nesta entrega.
