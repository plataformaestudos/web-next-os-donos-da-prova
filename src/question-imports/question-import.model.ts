export type QuestionImportStatus =
  | "PENDING"
  | "QUEUED"
  | "PROCESSING"
  | "READY"
  | "PARTIALLY_SAVED"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";

export interface QuestionImportIssue {
  code: string;
  severity: "ERROR" | "WARNING";
  field?: string;
  questionOrder?: number;
  message: string;
  suggestedFix?: string;
}

export interface QuestionImportSummary {
  totalItems: number;
  processedItems: number;
  validItems: number;
  invalidItems: number;
  warningItems: number;
  approvedItems: number;
  pendingReviewItems: number;
  excludedItems: number;
  savedItems: number;
  failedItems: number;
  errorCount: number;
}

export interface QuestionImport {
  id: string;
  status: QuestionImportStatus;
  progress: number;
  statusMessage: string | null;
  rootModuleId: string | null;
  startQuestionNumber?: number;
  endQuestionNumber?: number | null;
  sourceFileName: string;
  sourceFileSizeBytes: number;
  parserVersion: string | null;
  createdAt: string;
  startedAt: string | null;
  processedAt: string | null;
  expiresAt: string | null;
  globalErrors: QuestionImportIssue[];
  canRetry: boolean;
  retryRequiresFile: boolean;
  summary: QuestionImportSummary;
}

export interface AcceptedQuestionImport {
  id: string;
  status: QuestionImportStatus;
  statusUrl: string;
  previousImportId?: string;
}

export interface RecentQuestionImport {
  id: string;
  sourceFileName: string;
  status: QuestionImportStatus;
  progress: number;
  createdAt: string;
  expiresAt: string | null;
  totalItems: number;
  invalidItems: number;
  savedItems: number;
  rootModule: { id: string; name: string } | null;
}

export interface QuestionImportsPage {
  items: RecentQuestionImport[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
