import { loadQuestionReports } from "@/question-reports/load-question-reports.action";
import { QuestionReportStatus } from "@/types/question-report-status.types";
import { QuestionReportCategory, QuestionReportSubcategory } from "@/types/question-report.types";
import { QuestionReportsPageClient } from "./pageClient";

type SearchParams = Promise<{
  page?: string;
  itemsPerPage?: string;
  status?: QuestionReportStatus;
  category?: QuestionReportCategory;
  subcategory?: QuestionReportSubcategory;
  questionText?: string;
}>;

export default async function QuestionReportsPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const { 
    page = "1", 
    itemsPerPage = "10",
    status,
    category,
    subcategory,
    questionText
  } = searchParams;

  const pageNumber = parseInt(page, 10) || 1;
  const itemsPerPageNumber = parseInt(itemsPerPage, 10) || 10;

  const filters = {
    ...(status && { status }),
    ...(category && { category }),
    ...(subcategory && { subcategory }),
    ...(questionText && { questionText }),
  };

  const data = await loadQuestionReports(pageNumber, itemsPerPageNumber, filters);

  return (
    <QuestionReportsPageClient
      reports={data.reports}
      total={data.total}
      currentPage={data.page}
      itemsPerPage={data.itemsPerPage}
      currentFilters={filters}
    />
  );
}
