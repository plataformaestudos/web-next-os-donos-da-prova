import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
// import { CACHE_TAGS } from "@/util/cache-tags.util";

interface QuestionStats {
  totalAnswers: number;
  correctAnswers: number;
  accuracyPercentage: number;
  answers: Array<{
    id: string;
    alternativeId: string;
    isCorrect: boolean;
    answeredAt: string;
    alternativeText: string;
  }>;
}

export async function getQuestionStats(questionId: string): Promise<QuestionStats | null> {
  try {
    const response = await HttpClient.fetch<ResponseModel<QuestionStats>>(
      `/questions/${questionId}/user-stats`,
      { method: "GET" }  // coloca CACHE_TAGS ?
    );
    return response.data || null;
  } catch (error) {
    console.error("Erro ao buscar estatísticas da questão:", error);
    return null;
  }
}
