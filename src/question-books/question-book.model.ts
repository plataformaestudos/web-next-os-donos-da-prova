export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  RIGHT_OR_WRONG = "RIGHT_OR_WRONG",
}

export interface QuestionBookNextQuestionModel {
  id: string;
  text: string;
  comment: string | null;
  type: QuestionType;
  module: {
    id: string;
    name: string;
  };
  alternatives: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  userAnswer: {
    alternativeId: string;
    isCorrect: boolean;
  } | null;
  orderDetails: {
    questionOrder: number;
    previousOrder: number | null;
    nextOrder: number | null;
    nextUnansweredOrder: number | null;
  };
}

export interface QuestionBookModel {
  id: string;
  name: string;
  questionsCount: 12;
  folder: {
    id: string;
    name: string;
  } | null;
  questionBookStats: {
    totalQuestions: number;
    correctAnswers: number;
    totalAnswers: number;
    firstQuestion: number;
    wrongAnswers: number;
  };
  nextQuestion: QuestionBookNextQuestionModel;
}
