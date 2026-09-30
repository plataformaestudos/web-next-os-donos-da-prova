# Gerenciamento de usuários

`/gerenciar-usuarios` é exclusiva de administradores. Permite convidar um novo
administrador ou editor (colaborador), acompanhar o status e reenviar o link.
O próprio convidado define a senha em `/accept-invitation` e depois faz login.

Administradores e colaboradores recebem indicação de acesso sem assinatura no
perfil, sem botão/menu de gerenciamento de assinatura. O caminho direto de
assinatura informa essa regra. O backend também dispensa o plano nos módulos,
cadernos e limites comerciais, mantendo a autorização por papel.

Esta entrega depende do backend de convites e da migration
`1790769600000-staff-user-invitations.ts`. Configurar SMTP, `FRONTEND_URL`, os
Redirect URLs e os templates do Supabase conforme `backend/docs/staff-users.md`.
O link do template deve preservar `{{ .ConfirmationURL }}` e seu redirecionamento;
não definir a chave de serviço do Supabase no frontend.

O middleware permite acessar convite, callback de autenticação e recuperação de
senha sem o cookie de login do backend. O token do convite é validado pelo
Supabase e novamente pelo backend antes de definir a senha. Tokens são removidos
da URL após processar o link. O formulário exige senha com pelo menos 8 caracteres,
letra maiúscula, número e caractere especial.

Validação local:

```bash
npx tsc --noEmit
npx eslint src/staff-users/*.ts src/staff-users/*.tsx 'src/app/(public)/accept-invitation/page.tsx' 'src/app/(protected)/gerenciar-usuarios/page.tsx'
```

O teste ponta a ponta com recebimento real de e-mail depende do SMTP. Usar janela
anônima ao abrir o convite para testar um usuário diferente do administrador.
Conferir convite de ambos os papéis, definição de senha, login, ausência de
assinatura, reenvio/link expirado e bloqueio de acesso de editor/aluno ao gerenciamento.
