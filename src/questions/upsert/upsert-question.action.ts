"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/util/cache-tags.util";
import { QuestionType } from "@/model/question.model";
import { UpsertQuestionDTO } from "../question.dto";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { redirect } from "next/navigation";

export async function upsertQuestionAndAlternatives(
  _: { error: string | null },
  {
    id,
    text,
    type = QuestionType.MULTIPLE_CHOICE,
    comment,
    alternatives,
    module,
  }: UpsertQuestionDTO
): Promise<{ error: string | null }> {
  if (!text) {
    return {
      error: "A pergunta não pode ser vazia",
    };
  }

  if (alternatives.length < 2 || alternatives.some(({ text }) => !text)) {
    return {
      error:
        "A pergunta deve ter no mínimo duas alternativas, e todas devem ser preenchidas",
    };
  }

  let questionId: string;
  try {
    const response = await HttpClient.fetch<ResponseModel<{ id: string }>>(
      id ? `/management/questions/${encodeURIComponent(id)}` : "/management/questions", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({ text, type, comment, alternatives, ...(module ? { module } : {}) }),
      });
    questionId = response.data.id;
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Não foi possível salvar a questão." };
  }
  revalidateTag(CACHE_TAGS.QUESTIONS);
  revalidatePath(`/questions/${questionId}`);
  redirect(`/questions/${questionId}`);
}
