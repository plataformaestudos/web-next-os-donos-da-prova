"use server";

import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";

export async function answerQuestion({
  questionBookQuestionId,
  alternativeId,
}: {
  questionBookQuestionId: string;
  alternativeId: string;
}) {
  return HttpClient.fetch<
    ResponseModel<{ isCorrect: boolean; correctAlternativeId: string }>
  >("/user-answers", {
    method: "POST",
    body: JSON.stringify({
      questionBookQuestionId,
      alternativeId,
    }),
  }).then((response) => {
    if (response.statusCode >= 400) {
      throw response.error ?? response.message;
    }
    return response;
  });
}
