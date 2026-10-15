import { QuestionType } from "@/model/question.model";

export interface QuestionDailyUsage {
    planName: string;
    hasDailyQuestionLimit: true;
    dailyQuestionLimit: number;
    questionsViewedToday: number;
    questionsRemainingToday: number;
    dailyResetAt: string;
}

export interface QuestionBookNextQuestionModel {
    dailyUsage?: QuestionDailyUsage | null;
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
        previousUnansweredOrder: number | null;
    };
    questionId?: string;
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


