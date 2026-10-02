# Gerenciamento de usuários

`/gerenciar-usuarios` é exclusiva de administradores. Permite convidar um novo
administrador ou editor (colaborador), acompanhar o status e reenviar o link.
O próprio convidado define a senha em `/accept-invitation` e depois faz login.

A tela agora contém apenas a lista paginada e filtros por nome, e-mail, documento,
tipo de acesso e status. Inclui alunos, administradores, editores e convites.
Os filtros são combinados e executados pelo backend, com contagem/paginação dos
resultados; aplicar/limpar filtros ou trocar o tamanho retorna à primeira página.

**Adicionar usuário** abre um diálogo com nome, e-mail, documento opcional e acesso
administrativo/editor. **Editar** abre o mesmo padrão de diálogo para alterar nome,
documento e papel da equipe/convite. E-mail de login e status são somente leitura.
Não há edição nem conversão de alunos para equipe. A API impede remover o próprio
acesso administrativo e rejeita campos de identidade/senha/status.

Para alunos, o menu **Ações** permite bloquear/desbloquear, enviar recuperação de
senha e excluir, sempre com confirmação. Recuperação usa o e-mail de login no
Auth, não permite escolher uma senha/destinatário e exige desbloquear antes.
Exclusão reutiliza a autoexclusão existente: anonimiza o perfil, registra a exclusão,
inativa assinaturas no banco e remove o Auth. Não é reversível e o fluxo depende
de CPF nos metadados do usuário. Bloqueio não cancela assinatura; exclusão não
cancela cobranças externas no provedor automaticamente.

Administradores e colaboradores recebem indicação de acesso sem assinatura no
perfil, sem botão/menu de gerenciamento de assinatura. O caminho direto de
assinatura informa essa regra. O backend também dispensa o plano nos módulos,
cadernos e limites comerciais, mantendo a autorização por papel.

Esta entrega depende do backend de convites e da migration
`1790769600000-staff-user-invitations.ts`. Configurar SMTP, `FRONTEND_URL`, os
Redirect URLs e os templates do Supabase conforme `backend/docs/staff-users.md`.
Os templates customizados são configurados no painel Supabase Auth com o Site URL e
`{{ .TokenHash }}`: convite em `/accept-invitation` e recuperação no callback
`/auth/confirm`, preservando o destino de recuperação comum ou reenvio de convite.
O link padrão `{{ .ConfirmationURL }}` também é suportado. Não definir a chave
de serviço do Supabase no frontend.
Antes de publicar a atualização da lista, executar também as migrations fornecidas
`1790856000000-staff-invitation-document.ts` e
`1790859600000-account-access-controls.ts` no backend. Não gerar outras migrations.
Elas adicionam o documento do convite e políticas restritivas para rejeitar tokens
de contas bloqueadas/excluídas nas tabelas que já possuem RLS. O backend revalida
o estado da conta nas requisições protegidas e invalida a sessão Redis ao bloquear.

O middleware permite acessar convite, callback de autenticação e recuperação de
senha sem o cookie de login do backend. O token do convite é validado pelo
Supabase e novamente pelo backend antes de definir a senha. Tokens são removidos
da URL após processar o link. O formulário exige senha com pelo menos 8 caracteres,
letra maiúscula, número e caractere especial.

Validação local:

```bash
npm run test:staff-users
npx tsc --noEmit
npx eslint src/staff-users/*.ts src/staff-users/*.tsx 'src/app/(public)/accept-invitation/page.tsx' 'src/app/(protected)/gerenciar-usuarios/page.tsx'
```

O teste ponta a ponta com recebimento real de e-mail depende do SMTP. Usar janela
anônima ao abrir o convite para testar um usuário diferente do administrador.
Conferir convite de ambos os papéis, definição de senha, login, ausência de
assinatura, reenvio/link expirado e bloqueio de acesso de editor/aluno ao gerenciamento.

Os quatro testes do cliente cobrem filtros/paginação, limpeza, edição/cadastro e
as requisições de ações dos alunos. Não substituem o teste visual dos diálogos.
Testar manualmente os filtros combinados, edição/reenvio, bloqueio com aluno já
logado, desbloqueio e recuperação recebida por e-mail. Para exclusão, usar somente
uma conta descartável com CPF cadastrado e conferir anonimização/assinaturas.
Nenhuma conta real foi bloqueada/excluída durante a implementação. Build Next.js
de produção e teste visual ponta a ponta não fazem parte dessas verificações locais.
