# Orientações para agentes — Frontend

Frontend de Os Donos da Prova. Repositório `plataformaestudos/web-next-os-donos-da-prova`; branch principal `main`. Guia conferido em 05/10/2026. Quando o workspace completo estiver disponível, leia também `../AGENTS.md`. Este arquivo conserva as orientações essenciais para um clone separado.

## Estrutura e padrões

- Next.js 15 App Router, React 19, TypeScript strict, Ant Design, styled-components e React Query. Confira versões exatas no manifest/lockfile.
- `src/app/(public)/` e `src/app/(protected)/`: páginas e layouts. Grupos não aparecem na URL. `src/app/auth/` contém handlers/callbacks de autenticação.
- `src/middleware.ts`: encaminhamento inicial por presença de cookie e lista de rotas públicas; não comprova validade da sessão nem substitui autorização da API.
- `next.config.ts`: aliases portugueses, rewrites e redirects. Considere URL pública e rota interna ao acrescentar página ou proteção.
- `src/ui/` e `src/components/`: componentes compartilhados. `src/<feature>/`: UI/actions/DTOs específicos. Preserve Ant Design, tema, linguagem e comportamento responsivo atuais; evite introduzir outro design system.
- `src/util/http-client/fetch-client.util.ts`: cliente com credenciais, `HttpError`/`UnauthorizedError` e eventos globais de erro. `fetch-server.util.ts`: encaminha cookie da requisição do Next para a API.
- `src/services/content-management.server.ts`: acesso administrativo por backend. `src/app/context/user.context.tsx`: identidade e perfil. `src/app/hooks/useAuthGuard.tsx` e `src/util/roles.ts`: autorização visual existente.
- `src/staff-users/`, `src/question-imports/`, `src/signup/` e `src/components/AppPlanCardNewPlan/`: gestão, importação, cadastro e contratação de conta existente.

Confira branch/status/diff antes de editar e preserve trabalho alheio. Prefira mudanças localizadas, siga os padrões da área e não reescreva componentes grandes sem necessidade. Distingua Server Component de Client Component; não importe serviços/segredos de servidor no bundle cliente.

## Dados, autorização e tipos

- Dados de negócio passam pela API. Não reintroduza consultas `supabase.from(...)` a tabelas sensíveis nem uploads/alterações diretos do cliente no Storage para contornar os endpoints existentes.
- Uso de Supabase Auth no navegador e leitura de imagens públicas são fluxos distintos do acesso às tabelas. Nunca colocar service role, senha de banco, segredos JWT ou Asaas em variáveis `NEXT_PUBLIC_*`.
- `NEXT_PUBLIC_API_BASE_URL` determina a API. Mantenha envio de credenciais e confira CORS/cookies entre hosts. Cookie do domínio do frontend não é automaticamente enviado ao domínio do backend.
- Reutilize `canAccess`, `hasStaffAccess` e `Roles`. ADMIN gerencia usuários e planos; conteúdo/importações seguem regras ADMIN/COLLABORATOR. Equipe dispensa assinatura, mas colaborador não recebe permissão de administrador.
- Menu/layout/guard visual evitam navegação indevida; a API precisa autorizar a operação. Evite renderizar conteúdo privado antes da validação do usuário.
- Perfil vem de `/profiles/me`; identidade de `/auth/me`. Não aceite role/identidade escolhidos pelo cliente nem volte a buscar perfil diretamente no Supabase.
- Respeite `string | null | undefined` nos campos do perfil, como nickname. Use fallback consciente para a saudação; não esconda erro de build com cast/`!` ou removendo strictness.
- Verifique cada contrato: respostas podem usar `data`/metadados ou formato próprio, e perfil pode usar snake_case. Preserve filtros/paginação no servidor, invalidação do React Query e chaves de cache por usuário/papel.

## Login, logout, convite e recuperação

A sessão principal é cookie `access_token` + JWT/Redis no backend; Supabase Auth local sozinho não comprova acesso à plataforma.

- Logout usa `src/services/logout.service.ts`: primeiro revoga no backend; depois chama o handler local `/auth/logout` para remover cookie legado; encerra Supabase Auth local. O contexto limpa usuário/cache e a interface faz navegação completa para login.
- Preserve revalidação em `pageshow` de página restaurada e controle de versões das requisições no contexto. Uma resposta antiga não deve restaurar usuário após logout.
- Falha na revogação deve permitir nova tentativa, sem informar saída concluída. Não substitua a sequência por `router.push('/login')` ou apenas `auth.signOut()`.
- Endpoints de identidade e estado autenticado não devem usar cache compartilhado. Teste botão Voltar, refresh, acesso direto e replay do cookie anterior pelo backend.
- Preserve rotas públicas de convite/callback/recuperação e logout local no middleware; não transforme toda uma árvore administrativa em pública para liberar um callback.
- Convite vai para `/accept-invitation`; recuperação usa `/auth/confirm` e `/reset-password`, podendo preservar o destino de reenvio de convite. Valide destino relativo permitido e remova tokens da URL depois de processar.
- Templates, assuntos e SMTP/Resend são configurados no projeto Supabase correspondente; não são templates HTML versionados neste frontend. Não diagnostique email de homologação alterando o projeto de produção.
- Tela `/gerenciar-usuarios` é somente ADMIN. Edição de aluno não promove para equipe; bloqueio não cancela assinatura e exclusão local não confirma cancelamento externo. Leia `docs/staff-users.md` para as ações existentes.

## Testes e build

Execute nesta pasta e selecione o necessário ao fluxo alterado:

| Mudança | Comandos |
| --- | --- |
| Build de produção | `npm run build` |
| Auth/logout/cookie/middleware | `npm run test:auth` |
| Gestão de usuários | `npm run test:staff-users` |
| Importação DOCX | `npm run test:question-imports` |
| Tipos | `npx tsc --noEmit` |
| Lint dos arquivos alterados | `npx eslint <arquivos-alterados> --max-warnings 0` |
| Espaços/conflitos | `git diff --check` |

Specs do cliente usam `node --test` em `test/*.test.cjs`. Não equivalem a teste visual/ponta a ponta com backend, SMTP, navegador e Supabase reais. Para auth, validar em homologação login → Sair → Voltar; para convite, usar conta/janela descartável; para DOCX, testar upload/revisão/confirmação conforme docs.

`npm run lint` atualmente chama `next lint`; confira compatibilidade/configuração antes de depender desse wrapper. Prefira ESLint direto e focado. `npx tsc --noEmit` pode depender dos tipos gerados pelo Next; confira ordem de geração/build antes de classificar uma ausência desses arquivos como regressão.

Não suprima falhas com `ignoreBuildErrors`, `ignoreDuringBuilds`, `any` ou exclusão de testes para obter build verde. Separe avisos preexistentes de falhas introduzidas e reporte o que foi realmente verificado.

## Dependências e implantação

- Existem `package-lock.json`, `yarn.lock` e `pnpm-lock.yaml`. Dockerfile escolhe Yarn primeiro se seu lockfile existir. Não remova arquivos como limpeza sem verificar o impacto; preserve a estratégia de instalação usada no ambiente.
- Não execute atualização global de dependências/formatação/autofix em tarefa pontual. Alterações de dependência devem manter o lockfile pertinente consistente.
- Dockerfile atual usa Node 18 e copia `.next/standalone`, enquanto `output: 'standalone'` aparece comentado no `next.config.ts` conferido. Se a tarefa envolver Docker/deploy, verifique esse contrato e a versão de runtime; não considere que `next build` local valida a imagem Docker. Não altere esses pontos incidentalmente.
- Preview Vercel já falhou por limitação do plano para repositório privado de organização. Leia o check atual: falha de hospedagem pode não ser falha de código. Não torne repositório público nem mude plano sem escopo autorizado.
- API correspondente: `plataformaestudos/backend`, base `master`. Uma UI que depende de endpoint novo exige rollout compatível do backend antes dela.
- `db.json` era mock antigo sem uso e foi removido/ignorado. Não o recrie nem restaure referências a templates antigos sem necessidade real.
- Feature de afiliados ainda é proposta do workspace: ADMIN administra links/dashboard/clientes; desconto para novos/Free, QR para influencers/ebooks; comissões e desconto temporário adiados. Não renderize telas fingindo integração implementada nem consolide propostas de atribuição/preço como decisões do usuário.

Ao entregar, informe mudanças, testes/build, limitações reais e dependências do backend/configuração externa. Commit/push/PR conforme o pedido atual, com base `main`; não publique na branch de uma tarefa anterior por suposição.
