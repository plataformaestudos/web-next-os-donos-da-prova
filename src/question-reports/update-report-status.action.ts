"use server";

import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/util/cache-tags.util";
import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { QuestionReportStatus } from "@/types/question-report-status.types";

export async function updateQuestionReportStatus(
  reportId: string,
  status: QuestionReportStatus
): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const response = await HttpClient.fetch<ResponseModel<null>>(
      `/question-reports/${reportId}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      }
    );

    if (response.statusCode >= 400 || response.error) {
      return { 
        success: false, 
        error: response.error ?? "Erro ao atualizar status do report" 
      };
    }

    // Invalidar cache para atualizar o contador de reports pendentes
    revalidateTag(CACHE_TAGS.QUESTION_REPORTS);

    return { success: true, error: null };

  } catch (err: unknown) {
    return { 
      success: false, 
      error: err instanceof Error ? err?.message ?? "Erro ao atualizar status do report" : "Erro ao atualizar status do report" 
    };
  }
}
