# Entrada e acompanhamento de importações DOCX — issue #4

## Entrega e próxima etapa

A rota `/importacao-questoes` oferece seleção explícita de módulo raiz, validação
de DOCX (1 byte a 30 MB), upload com progresso e criação de rascunho. O nome do
arquivo aparece como sugestão textual e nunca seleciona o módulo automaticamente.

O acompanhamento fica em `/importacao-questoes/:id`. Atualizar a página ou reabrir
esse endereço consulta o lote existente, sem repetir o envio. Ao receber `READY`,
`PARTIALLY_SAVED` ou `COMPLETED`, a página abre `/importacao-questoes/:id/preview`.
A rota agora oferece [preview, editor, aprovação e diálogo de erros](question-import-preview.md)
da issue #5. Confirmação/salvamento parcial pertence à issue #6.

## Pré-requisitos

- Backend com PR #21 e migrations anteriores aplicadas, Redis, Pandoc 3.6.4 e bucket
  privado configurados conforme `backend/docs/question-import-upload.md`.
- `NEXT_PUBLIC_API_BASE_URL` apontando para o backend. O navegador envia cookies
  com credenciais: configurar CORS para a origem exata do frontend e cookies conforme
  o ambiente. Nenhuma chave de serviço vai para o navegador.
- Aplicar a migration backend `1790632800000-question-import-menu.ts` depois de
  disponibilizar estas rotas. Na pasta backend:

  ```bash
  NODE_OPTIONS='-r tsconfig-paths/register' make migrate
  ```

- Administrador/colaborador-editor com perfil e papel configurados, e pelo menos
  um módulo raiz existente. O guard do frontend usa `src/util/roles.ts`; a API
  valida independentemente papel e proprietário do lote.

## Comportamento

- Polling a cada 2 segundos durante preparação/fila/processamento, com interrupção
  nos estados terminais; cancelamento da consulta ao desmontar e atualização ao
  retomar a janela. Erro transitório de leitura tenta novamente após 5 segundos.
- HTTP 401/403/404 interrompe polling e oculta dados antigos. O cache inclui o usuário
  e o formulário reinicia se a identidade mudar.
- Totais do parser só ficam completos ao terminar. “Válidas pela análise” não significa
  “aprovadas”; questões com avisos podem também ser válidas ou inválidas.
- `FAILED`: erro global legível e nova seleção do documento para `/retry`, que usa
  a raiz original e retorna um novo ID. `READY` com questões inválidas segue para o resumo.
- `EXPIRED`: informa encerramento e permite iniciar uma nova importação.
- HTTP 503 contendo `importId` abre o acompanhamento desse lote. Upload não é repetido
  automaticamente: perda da resposta pode significar que o servidor já recebeu o arquivo.
- Axios já existente faz o multipart sem forçar `Content-Type`. MIME vazio do sistema
  operacional é normalizado para DOCX; tipo explícito incompatível é rejeitado. O backend
  continua validando assinatura, estrutura e limites do arquivo.

## Verificação automatizada

Na pasta frontend (Node 20 ou posterior):

```bash
npm run test:question-imports
npx tsc --noEmit
npx eslint src/question-imports 'src/app/(protected)/question-imports' src/ui/navbar/use-menus.hook.ts src/ui/navbar/navbar.component.tsx 'src/app/(protected)/home/role-based-pages-cards.component.tsx' next.config.ts
npm run build
```

Os testes usam servidor HTTP local descartável para validar multipart, raiz,
retry, status, tratamento de erro e ausência de reenvio automático, além dos limites
de arquivo e estados. Não usam banco, Redis, credenciais ou arquivos reais do usuário.
Eles não substituem o teste de navegador e Supabase abaixo.

Resultado desta implementação: 10 testes passaram, TypeScript passou e lint dos
arquivos alterados passou. O build completo do frontend foi tentado, mas o Webpack
parou ao ler o `package.json` vazio na raiz do workspace (`../package.json` em relação
ao frontend). Esse arquivo preexistente está fora deste repositório e não foi alterado.
Para repetir o build, execute o frontend em um checkout cuja pasta ancestral não
contenha esse JSON inválido, ou regularize esse arquivo conforme o projeto raiz.
Os avisos de `experimental.appDir` e Browserslist também já existem no ambiente.

## Roteiro manual (pendente de ambiente autenticado)

1. Entrar como administrador e como editor: ver “Importar questões” no menu.
   Entrar como aluno: não ver o item e ser redirecionado ao abrir a URL diretamente.
2. Abrir a tela sem escolher raiz/arquivo: o envio permanece desabilitado.
3. Selecionar `.doc`, PDF, DOCX vazio e arquivo maior que 30 MB: ver erro local e
   não enviar. Trocar por DOCX válido remove o erro. Não inferir raiz pelo nome.
4. Selecionar uma raiz e um DOCX em `scripts/import-samples` (na raiz do workspace).
   Observar progresso do envio, fila e processamento. Duplo clique não duplica POST.
5. Copiar o endereço com ID, atualizar e reabrir durante o processamento: continuar
   no mesmo lote. Quando pronto, abrir o resumo automaticamente, inclusive com erros
   locais nas questões. Conferir os totais com a resposta do backend.
6. Simular perda de rede durante polling e restaurar: exibir aviso e retomar consultas.
   Com sessão expirada, mostrar ação para entrar novamente, sem polling contínuo.
7. Usar DOCX estruturalmente inválido: ver falha global; selecionar outro arquivo e
   reenviar. Confirmar novo ID e manutenção da raiz, sem alterar o lote anterior.
8. Consultar lote de outro editor, ID inexistente e lote expirado: mostrar o estado
   apropriado, sem exibir dados indevidos. Administrador pode consultar outro editor.
9. Conferir layout em celular e desktop e navegação/seleção por teclado.

Ao reportar falhas, enviar passo, papel do usuário, mensagem da tela e status/corpo
da requisição afetada, sem cookies ou tokens.
