// Tipos baseados nos enums do backend
export enum QuestionReportCategory {
  ERROR_TEXT = 'Erro no enunciado da questão',
  ANSWER_KEY = 'Erro no gabarito',
  ERROR_ALTERNATIVES = 'Erro nas alternativas',
  ERROR_COMMENT = 'Erro no comentário',
  TECHNICAL_PROBLEM = 'Problema técnico',
  OTHER = 'Outro problema'
}

export enum QuestionReportSubcategory {
  // Erro no texto
  GRAMMAR = 'Erro de gramática',
  SPELLING = 'Erro de ortografia',
  FORMULATION = 'Formulação confusa',
  INCOMPLETE = 'Texto incompleto',
  IMAGE_NOT_SHOWING = 'Imagens não aparecem',
  IMAGE_ILLEGIBLE = 'Imagens ilegíveis',
  NO_STATEMENT = 'Sem enunciado',
  OTHER_TEXT_ERROR = 'Outro erro no texto',

  // Erro no gabarito
  INCORRECT_ANSWER_KEY = 'Gabarito incorreto',
  ILLEGIBLE_ANSWER_KEY = 'Gabarito ilegível',
  ANSWER_KEY_NOT_SHOWING = 'Gabarito não aparece',

  // Erro nas alternativas
  DUPLICATE_ALTERNATIVE = 'Alternativas duplicadas',
  MISSING_ALTERNATIVE = 'Alternativa faltando',
  INCORRECT_ALTERNATIVE = 'Alternativa incorreta',
  ILLEGIBLE_ALTERNATIVE = 'Alternativa ilegível',

  // Erro no comentário
  INCORRECT_EXPLANATION = 'Explicação incorreta',
  INCOMPLETE_EXPLANATION = 'Explicação incompleta',
  CONFUSING_EXPLANATION = 'Explicação confusa',
  COMMENT_IMAGE_NOT_SHOWING = 'Imagem não aparece',
  COMMENT_IMAGE_ILLEGIBLE = 'Imagem ilegível',
  NO_COMMENT = 'Sem comentário',

  // Problema técnico
  NOT_LOADING = 'Questão não carrega',
  WRONG_FORMAT = 'Formato incorreto',
  BROKEN_IMAGE = 'Imagem quebrada',
  SLOW_LOADING = 'Carregamento lento',

  // Outro
  SUGGESTION = 'Sugestão de melhoria',
  DOUBT = 'Dúvida sobre a questão'
}

export interface QuestionReportData {
  questionBookId: string;
  questionBookQuestionId: string;
  category: QuestionReportCategory;
  subcategory: QuestionReportSubcategory;
  description: string;
}
