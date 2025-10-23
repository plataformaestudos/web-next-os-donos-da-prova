"use server";

import HttpClient from "@/util/http-client/fetch-server.util";
import { ResponseModel } from "@/model/common.model";
import { QuestionReportModel } from "@/model/question-report.model";
import { QuestionReportStatus } from "@/types/question-report-status.types";
import { QuestionReportCategory, QuestionReportSubcategory } from "@/types/question-report.types";

interface QuestionReportFilters {
  status?: QuestionReportStatus;
  category?: QuestionReportCategory;
  subcategory?: QuestionReportSubcategory;
  questionText?: string;
}

export async function loadQuestionReports(
  page: number = 1,
  itemsPerPage: number = 10,
  filters: QuestionReportFilters = {}
): Promise<{
  reports: QuestionReportModel[];
  total: number;
  page: number;
  itemsPerPage: number;
  totalPages: number;
}> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      itemsPerPage: itemsPerPage.toString(),
    });

    if (filters.status) {
      queryParams.set('status', filters.status);
    }
    if (filters.category) {
      queryParams.set('category', filters.category);
    }
    if (filters.subcategory) {
      queryParams.set('subcategory', filters.subcategory);
    }
    if (filters.questionText) {
      queryParams.set('questionText', filters.questionText);
    }

    const response = await HttpClient.fetch<ResponseModel<QuestionReportModel[]>>(
      `/question-reports?${queryParams.toString()}`,
      {
        method: "GET",
      }
    );

    return {
      reports: response.data || [],
      total: response.total || 0,
      page: response.page || page,
      itemsPerPage: response.itemsPerPage || itemsPerPage,
      totalPages: response.totalPages || Math.ceil((response.total || 0) / (response.itemsPerPage || itemsPerPage)),
    };
  } catch (error) {
    console.error("Erro ao carregar reports de questões:", error);
    return {
      reports: [],
      total: 0,
      page: 1,
      itemsPerPage: 10,
      totalPages: 0,
    };
  }
}
