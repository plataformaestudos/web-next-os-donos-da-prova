export interface BookFolderWithQuestionBooksModel {
    folders:{
        id: string;
        name: string;
        questionBooks: QuestionBookBookFolderModel[];
        nrOfQuestionBooks: number;
    }[];
    questionBooksWithoutFolder: QuestionBookBookFolderModel[];
}

export interface BookFolderModel {
    id: string;
    name: string;
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
 

