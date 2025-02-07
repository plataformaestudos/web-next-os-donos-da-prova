export interface QuestionModel {
  id: string;
  text: string;
}

export interface QuestionAlternativeModel {
  id: string;
  text: string;
  is_correct: boolean;
}
