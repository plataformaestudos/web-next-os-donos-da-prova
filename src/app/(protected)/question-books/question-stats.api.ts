import HttpClient from "@/util/http-client/fetch-client.util";
import { ResponseModel } from "@/model/common.model";
import { QuestionGeneralStats } from "@/model/question.model";

export async function getQuestionGeneralStats(questionId: string): Promise<QuestionGeneralStats | null> {
  try {
    const response = await HttpClient.fetch<ResponseModel<QuestionGeneralStats>>(
      `/questions/${questionId}/general-stats`,
      { method: "GET" }
    );
    return response.data || null;
  } catch (error) {
    console.error("Erro ao buscar estatísticas gerais da questão:", error);
    return null;
  }
}
