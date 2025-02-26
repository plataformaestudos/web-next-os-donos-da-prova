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

export interface QuestionModuleModel {
  id: string;
  name: string;
}

export interface FullQuestion extends QuestionModel {
  alternatives: QuestionAlternativeModel[];
  modules: QuestionModuleModel[];
}
