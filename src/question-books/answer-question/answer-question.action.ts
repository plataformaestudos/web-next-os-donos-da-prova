"use server";

import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";

export async function answerQuestion({
  questionBookQuestionId,
  alternativeId,
}: {
  questionBookQuestionId: string;
  alternativeId: string;
}): Promise<{
  success: boolean;
  data: { isCorrect: boolean; correctAlternativeId: string } | null;
  error: string | null;
}> {
  try {
    const res = await HttpClient.fetch<
      ResponseModel<{ isCorrect: boolean; correctAlternativeId: string }>
    >("/user-answers", {
      method: "POST",
      body: JSON.stringify({
        questionBookQuestionId,
        alternativeId,
      }),
    });

    if (res.statusCode >= 400 || res.error) {
      return { success: false, data: null, error: res.error ?? "Erro ao responder questão" };
    }

    return { success: true, data: res.data ?? null, error: null };

  } catch (err: unknown) {
    return { success: false, data: null, error: err instanceof Error ? err?.message ?? "Erro ao responder questão" : "Erro ao responder questão" };
  }
}
