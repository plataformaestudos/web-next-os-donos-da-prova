import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import {  QuestionBookModel } from "@/question-books/question-book.model";
import { CACHE_TAGS } from "@/util/cache-tags.util";
import { BookFolderModel } from "@/question-books/book-folder.model";

export async function getQuestionBook(id: string) {
    const res = await HttpClient.fetch<ResponseModel<QuestionBookModel>>(
        `/question-books/${id}`,
        {
            method: "GET",
            next: {
                tags: [CACHE_TAGS.QUESTION_BOOKS],
            },
        }
    );
    return res.data;
}

export async function getBookFolders() {
    const res = await HttpClient.fetch<ResponseModel<BookFolderModel>>(
        `/book-folders/user/with-question-books`,
        {
            method: "GET",
            next: {
                tags: [CACHE_TAGS.BOOK_FOLDERS],
            },
        }
    );
    return res.data;
}
