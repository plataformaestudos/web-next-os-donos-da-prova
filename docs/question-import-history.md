# Importações recentes

Ao abrir `/importacao-questoes`, a aba **Importações recentes** lista os registros acessíveis, com dez itens por página. Mostra arquivo, módulo raiz, data, situação, progresso e questões identificadas/salvas/inválidas. Nome do arquivo e **Abrir** levam a `/importacao-questoes/:id`; a tela existente encaminha para o preview quando disponível.

A aba **Nova importação** preserva o formulário de upload. `/importacao-questoes?nova=1` abre diretamente esse formulário. Voltar do detalhe retorna ao histórico. Importações concluídas, falhas e encerradas permanecem visíveis; abrir não reenvia nem reprocessa o documento.

O histórico atualiza a cada cinco segundos quando a página contém um processamento ativo e também oferece **Atualizar**. A lista tem estados de carregamento, vazio e erro. O cache é separado por usuário/papel e a API aplica as permissões.

Publicar primeiro o backend com `GET /question-imports` paginado. Não há migration nova. Manter a configuração de piloto do backend.

## Validação manual

1. Entrar como editor piloto e abrir Importações. Conferir lista vazia ou histórico, paginação e situação.
2. Enviar um DOCX em Nova importação, voltar ao histórico e abri-lo pelo arquivo ou por Abrir.
3. Conferir atualização do processamento e retomada do preview sem digitar o ID.
4. Salvar parte das questões, voltar ao histórico e verificar o total salvo ao atualizar.
5. Conferir registros concluídos, com falha e encerrados, mantendo o comportamento da tela de detalhe.
6. Testar outro editor (somente seu histórico), administrador (histórico completo) e falha de conexão com nova tentativa por Atualizar.
7. Em tela estreita, conferir rolagem horizontal da tabela e navegação das abas.

Verificações locais: `npx tsc --noEmit`, lint dos arquivos alterados e `npm run test:question-imports`.
