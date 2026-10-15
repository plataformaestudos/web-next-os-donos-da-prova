import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import {  QuestionBookModel } from "@/question-books/question-book.model";
import { CACHE_TAGS } from "@/util/cache-tags.util";
import { BookFolderWithQuestionBooksModel } from "@/question-books/book-folder.model";

export async function getQuestionBook(id: string, filter: { seq?: string; seqRandom?: string } = {}) {
    const params = new URLSearchParams();
    if (filter.seq) params.set("seq", filter.seq);
    if (filter.seqRandom === "true") params.set("seqRandom", "true");
    if (params.size) params.set("onlyNotAnswered", "false");
    const res = await HttpClient.fetch<ResponseModel<QuestionBookModel>>(
        `/question-books/${id}${params.size ? `?${params}` : ""}`,
        {
            method: "GET",
            cache: "no-store",
            next: {
                tags: [CACHE_TAGS.QUESTION_BOOKS],
            },
        }
    );
    return res.data;
}

export async function getBookFolders() {
    const res = await HttpClient.fetch<ResponseModel<BookFolderWithQuestionBooksModel>>(
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
