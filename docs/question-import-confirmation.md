# Confirmar questões importadas — issue #6

O preview agora oferece “Salvar questões válidas”. A confirmação usa
`POST /question-imports/:id/confirm` implementado no backend e só envia o ID e a
versão do rascunho. Requer o backend com as issues #8 e #10 aplicadas; esta tela
não exige migration nem dependência adicional.

## Como funciona

- Antes de abrir a confirmação, consulta todas as páginas do lote. Mostra quantas
  estão elegíveis, quantas serão ignoradas, quantas ficam pendentes, já foram
  salvas ou estão em andamento.
- Elegíveis são apenas rascunhos aprovados, válidos ou válidos com avisos, com
  persistência `PENDING` ou `FAILED`. Itens falhos elegíveis entram numa nova
  tentativa; o botão específico “Tentar novamente apenas as falhas” envia só eles.
- Envia sequencialmente lotes de 20 (limite da API: 50), mostrando avanço. Cada
  lote grava cada questão em transação independente; resultados anteriores não
  são desfeitos por falha posterior.
- Atualiza contadores e os itens visíveis. Questões salvas recebem estado e link
  para o cadastro normal. Falhas exibem o motivo, continuam no lote e podem ser
  tentadas novamente sem enviar as já salvas.
- Após erro de rede/servidor, não repete o POST automaticamente. Atualiza os
  rascunhos primeiro; estados `SAVED` não voltam a ser enviados. A API também
  reconhece uma repetição como `ALREADY_SAVED`, sem criar duplicatas.
- Lotes parcialmente salvos continuam revisáveis até expirarem. Questões inválidas
  ou não aprovadas ficam disponíveis para correção; salvar novas aprovadas inicia
  outro lote. Quando todas forem salvas, o lote passa a somente leitura.

## Validação manual

Usar ambiente de teste descartável com backend #8/#10 e Storage privado/público
configurado. Importar um DOCX de aproximadamente 400 questões e conferir:

1. Os totais da confirmação cobrem todas as páginas, não apenas a página aberta.
2. Pendentes, excluídas e inválidas não são enviadas; aprovada com aviso pode ser.
3. Progresso ocorre por lotes; uma falha não desfaz sucessos anteriores.
4. Cada sucesso abre a questão no cadastro normal e preserva comentário,
   alternativas, resposta e módulo.
5. Atualizar/reabrir a página não inicia outro salvamento; já salvas não são
   reenviadas. Simular resposta perdida e confirmar estados após atualização.
6. Tentar novamente falhas envia somente itens ainda em `FAILED`, aprovados e
   válidos; sucesso limpa a falha e remove a opção de retry para esse item.
7. Aprovar e confirmar outros itens enquanto o lote está parcial; os anteriores
   continuam salvos e os novos são adicionados sem duplicidade.
8. Conferir resultados para 401/403, conflito de versão, armazenamento de imagem
   indisponível e lote expirado.

Não foi feito reset de banco nem teste contra o Storage de produção.
