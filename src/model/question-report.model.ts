import { QuestionReportStatus } from "@/types/question-report-status.types";

export interface QuestionReportModel {
  id: string;
  category: string;
  subcategory: string;
  description: string;
  status: QuestionReportStatus;
  question: {
    id: string | null;
    text: string | null;
  };
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface QuestionReportViewModel extends QuestionReportModel {
  key: string;
}
