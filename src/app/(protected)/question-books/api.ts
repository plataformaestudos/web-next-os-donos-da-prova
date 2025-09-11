import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { QuestionBookModel } from "@/question-books/question-book.model";
import { CACHE_TAGS } from "@/util/cache-tags.util";

export async function getQuestionBook(id: string) {
  return HttpClient.fetch<ResponseModel<QuestionBookModel>>(
    `/question-books/${id}`,
    {
      method: "GET",
      next: {
        tags: [CACHE_TAGS.QUESTION_BOOKS],
      },
    }
  ).then((r) => r.data);
}
