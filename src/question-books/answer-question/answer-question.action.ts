"use server";

import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";

export async function answerQuestion({
  questionId,
  questionBookId,
  alternativeId,
}: {
  questionId: string;
  questionBookId: string;
  alternativeId: string;
}) {
  return HttpClient.fetch<
    ResponseModel<{ isCorrect: boolean; correctAlternativeId: string }>
  >("/user-answers", {
    method: "POST",
    body: JSON.stringify({
      questionId,
      questionBookId,
      alternativeId,
    }),
  }).then((response) => {
    if (response.statusCode >= 400) {
      throw response.error ?? response.message;
    }
    return response;
  });
}
