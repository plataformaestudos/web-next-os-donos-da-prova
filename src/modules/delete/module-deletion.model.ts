export interface ModuleDeletionImpact {
    moduleId: string;
    moduleName: string;
    modules: number;
    questions: number;
    sharedQuestions: number;
    questionBooks: number;
    bookItems: number;
    answers: number;
    blockedByImports: boolean;
    confirmationToken: string;
}
