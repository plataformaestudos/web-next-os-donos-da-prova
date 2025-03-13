export interface QuestionBookDTO {
  id: string;
  name: string;
  folderId: string;
  modules: Array<{
    moduleId: string;
    treeCode: string;
    quantityQuestions: number;
  }>;
}
