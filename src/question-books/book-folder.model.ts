export interface BookFolderModel {
    folders:{
        id: string;
        name: string;
        questionBooks: QuestionBookBookFolderModel[];
        nrOfQuestionBooks: number;
    }[];
    questionBooksWithoutFolder: QuestionBookBookFolderModel[];
}

export interface QuestionBookBookFolderModel {
    id: string;
    name: string;
    createdAt: string;
    isPublic: boolean;
    favorite: boolean;
    userId: string;
    folderId?: string;
    questionsCount: number;
}
 

