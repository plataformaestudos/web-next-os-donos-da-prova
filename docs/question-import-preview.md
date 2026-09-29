# Revisão de questões importadas — issue #5

## Entrega

A rota `/importacao-questoes/:id/preview` agora lista todas as questões, inicialmente
10 por página (também 20/50), com enunciado, alternativas, gabarito, comentário,
tipo, dificuldade, número no DOCX e um único caminho de módulos. Excluídas,
inválidas e salvas continuam acessíveis. Filtros de validade, revisão, avisos e
caminho de módulo são combináveis. “Com avisos” também encontra questões inválidas.

“N erros encontrados” abre um diálogo paginado de erros/avisos com campo, motivo,
orientação e botão para abrir a questão, inclusive fora do filtro/página atual.
Questões excluídas continuam nos totais e são identificadas no diálogo.

O editor modal permite guardar rascunhos inválidos, corrigir todos os campos e
marcar explicitamente um campo como revisado mesmo sem mudar seu texto. O PATCH
envia apenas campos alterados/revisados, para não apagar outros problemas de
interpretação do DOCX. Correção válida não aprova automaticamente a questão.

Aprovar, retirar aprovação, excluir e restaurar revisão estão disponíveis por
questão e para selecionadas da página. A aprovação em lote considera somente
itens válidos; inválidos continuam editáveis. Operações são sequenciais, usam a
versão de cada item, não repetem mutações automaticamente e exibem resultado por
questão. Uma falha individual não desfaz os sucessos nem impede as demais; falta
de autenticação/permissão interrompe o restante. Sair da tela interrompe o lote
após a requisição em andamento.

Edições atualizam os totais e preservam a página/filtros enquanto o modal está
aberto. Caso o filtro fique sem resultados naquela página, o paginador ajusta para
a última página existente. Fechar o modal com alterações pede confirmação. A
seleção de itens é restrita à página e limpa ao trocar filtro/página ou concluir
uma ação em lote. Filtros e edições não salvas não são persistidos após recarga.

## Imagens, HTML e concorrência

- O renderer monta elementos React de uma allowlist; HTML do DOCX não é inserido
  diretamente. Fórmulas LaTeX usam KaTeX sem conteúdo confiável (`trust: false`).
- O editor usa Tiptap já instalado, com imagens canônicas e suporte a tabelas,
  listas, estilos básicos, fórmulas e sobrescrito/subscrito. Só o editor da questão
  aberta é montado; a lista usa renderização leve.
- URLs assinadas ficam no contexto de exibição. O estado/HTML do editor continua
  com `import-image://...`; renovar URLs não altera o documento nem marca campos
  como revisados. Reconsultas a cada 10 minutos e ao retomar a janela renovam URLs.
- Nenhum upload ou exclusão de objeto no Storage é disparado pelo editor. Imagens
  existentes podem ser movidas/removidas; novas imagens exigem novo DOCX.
- Falha de imagem mostra aviso/placeholder; texto e referências permanecem.
- Cada edição usa a versão originalmente aberta. HTTP 409 preserva a edição
  local e oferece consulta/comparação com a versão atual. Substituir o conteúdo
  local exige confirmação e nunca reenvia a edição automaticamente.
- Itens salvos/em salvamento e lotes não editáveis são somente leitura. A API
  verifica novamente expiração, propriedade e validade antes de qualquer escrita.

## Aplicação e validação

Disponibilizar primeiro o complemento backend da issue #5: `hasWarnings` em
`GET /question-imports/:id/items` e `GET /question-imports/:id/module-paths`.
Não há nova migration nem dependência npm nesta etapa. Permanecem os requisitos
do [upload](question-import-upload.md): migrations anteriores, Redis, Pandoc,
Storage e sessão autenticada.

Na pasta frontend:

```bash
npm run test:question-imports
npx tsc --noEmit
npx eslint src/question-imports
npm run build
```

Os testes de contrato verificam PATCH parcial, versão enviada/conflito sem retry,
filtros combinados e bloqueio de aprovação de itens inválidos/salvos. Eles não
substituem testes visuais do editor, imagens, fórmulas e tabelas.

Resultado desta etapa: 15 testes aprovados, TypeScript e lint de
`src/question-imports` aprovados. O backend complementar passou nos 26 testes
HTTP focados, build e lint dos arquivos alterados.

O build completo falhou neste workspace com `Build failed because of webpack
errors` e aviso sobre o `package.json` vazio na pasta ancestral (fora do
repositório frontend, impedimento já observado na etapa de upload). Executar em
checkout fora dessa pasta ou regularizar o arquivo raiz antes de repetir o build.
Esse arquivo não foi alterado por esta entrega; o build frontend segue pendente.

## Roteiro manual pendente

1. Importar cada DOCX de `scripts/import-samples` e percorrer todas as páginas;
   conferir também questões com imagens, fórmulas e tabelas no desktop e celular.
2. Abrir “N erros encontrados”; alternar erros/avisos, paginar e abrir uma questão
   que não está na página/filtro atual. Fechar e conferir manutenção da navegação.
3. Testar filtros combinados e módulo que será criado. Remover todos os filtros
   deve revelar novamente os itens excluídos e inválidos.
4. Abrir e fechar o editor sem alterar nada: não deve marcar campos como revisados
   nem pedir confirmação de descarte. Alterar só comentário, salvar e conferir no
   Network que os demais campos não foram enviados.
5. Apagar comentário, salvar rascunho e conferir erro/contagem: aprovação bloqueada.
   Corrigir, salvar e aprovar; editar novamente deve retornar revisão a pendente.
6. Corrigir número, gabarito, tipo, dificuldade e caminho do módulo. Salvar número
   diferente da ordem deve continuar mostrando erro. Módulos são apenas resolvidos
   nesta etapa e não são criados antes da confirmação definitiva.
7. Editar texto dentro de tabela, remover/reordenar alternativas e conferir que
   enunciado/comentário ainda não salvos permanecem; remover alternativa correta
   deve limpar o gabarito. Conferir conteúdo após salvar e reabrir.
8. Editar questão com imagem (inclusive só imagem em um campo), mover/remover a
   imagem e salvar: corpo do PATCH deve conter referência canônica, nunca URL
   assinada. Verificar que nenhum DELETE/upload de Storage ocorreu.
9. Deixar o editor aberto por mais de 15 minutos, com texto ainda não salvo:
   renovação de imagens não pode descartar texto nem marcar novos campos revisados.
10. Alterar a mesma questão em duas abas: segunda recebe conflito, conserva texto
    local e mostra comparação. Carregar versão atual só após confirmação.
11. Aprovar/excluir/restaurar selecionadas, incluindo válidas e inválidas. Simular
    falha de um item e conferir resultado parcial, sem repetição automática.
12. Testar como editor proprietário, outro editor, administrador e aluno; testar
    sessão expirada e lote encerrado. Tentar editar item salvo/em salvamento.

Enviar passo, mensagem, papel e resposta HTTP em caso de falha, sem tokens/cookies.
A confirmação definitiva “Salvar questões válidas” está descrita em
[question-import-confirmation.md](question-import-confirmation.md).
