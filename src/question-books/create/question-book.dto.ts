export interface QuestionBookDTO {
  id: string;
  name: string;
  folderId: string;
  modules: Array<{
    moduleId: string;
    quantityQuestions: number;
  }>;
}
