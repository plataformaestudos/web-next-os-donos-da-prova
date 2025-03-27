import { QuestionType } from "@/model/question.model";

export interface UpsertQuestionDTO {
  id?: string;
  text: string;
  type: QuestionType;
  comment?: string;
  alternatives: {
    id?: string;
    text: string;
    is_correct: boolean;
  }[];
  modules: string[];
}
