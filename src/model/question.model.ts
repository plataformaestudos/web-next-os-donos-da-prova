export interface QuestionModel {
  id: string;
  text: string;
  comment?: string;
}

export interface QuestionAlternativeModel {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface QuestionWithAlternativesModel extends QuestionModel {
  question_alternatives: QuestionAlternativeModel[];
}
