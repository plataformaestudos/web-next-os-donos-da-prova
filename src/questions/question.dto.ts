export interface UpsertQuestionDTO {
  id?: string;
  text: string;
  comment?: string;
  alternatives: {
    id?: string;
    text: string;
    is_correct: boolean;
  }[];
}
