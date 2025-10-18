export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  RIGHT_OR_WRONG = "RIGHT_OR_WRONG",
}

export interface QuestionModel {
  id: string;
  text: string;
  type: QuestionType;
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

export interface QuestionGeneralStats {
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercentage: number;
  difficulty: number;
}
