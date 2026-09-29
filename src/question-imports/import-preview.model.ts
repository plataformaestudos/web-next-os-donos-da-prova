import type {
  QuestionImportIssue,
  QuestionImportSummary,
} from "./question-import.model";

export type ReviewStatus = "PENDING" | "APPROVED" | "EXCLUDED";
export type ValidationStatus =
  | "PENDING"
  | "VALID"
  | "VALID_WITH_WARNINGS"
  | "INVALID";
export interface DraftPayload {
  text: string;
  comment: string;
  alternatives: { text: string }[];
  answer: string | null;
  type: "MULTIPLE_CHOICE" | "RIGHT_OR_WRONG" | null;
  difficultyLevel: number;
}
export interface ImportItem {
  id: string;
  itemOrder: number;
  sourceNumber: number | null;
  version: number;
  payload: DraftPayload;
  previewPayload: DraftPayload;
  modulePath: string[];
  resolvedModuleId: string | null;
  moduleResolutionStatus: "PENDING" | "EXISTING" | "WILL_CREATE" | "UNRESOLVED";
  issues: QuestionImportIssue[];
  validationStatus: ValidationStatus;
  reviewStatus: ReviewStatus;
  persistenceStatus: "PENDING" | "SAVING" | "SAVED" | "FAILED";
  savedQuestionId: string | null;
  saveError: QuestionImportIssue | null;
}
export interface ImportAssets {
  imageUrls: Record<string, string>;
  imagesExpireAt: string | null;
  assetErrors: (QuestionImportIssue & { itemId: string })[];
}
export interface ImportPage {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export interface ImportItemsPage extends ImportPage, ImportAssets {
  items: ImportItem[];
}
export interface ImportItemDetail extends ImportAssets {
  item: ImportItem;
}
export interface ImportMutationResult extends ImportItemDetail {
  summary: QuestionImportSummary;
}
export interface ImportErrorEntry extends QuestionImportIssue {
  scope: "IMPORT" | "ITEM";
  itemId: string | null;
  sourceNumber: number | null;
  reviewStatus: ReviewStatus | null;
}
export interface ImportErrorsPage extends ImportPage {
  errors: ImportErrorEntry[];
}
export interface ItemFilters {
  page: number;
  pageSize: number;
  validationStatus?: ValidationStatus;
  reviewStatus?: ReviewStatus;
  hasWarnings?: boolean;
  modulePath?: string[];
}
export interface DraftPatch {
  version: number;
  sourceNumber?: number | null;
  modulePath?: string[];
  payload?: Partial<DraftPayload>;
}
export type DraftField = keyof DraftPayload | "sourceNumber" | "modulePath";

export interface ConfirmImportRequestItem {
  id: string;
  version: number;
}

export interface ImportConfirmationItemResult {
  itemId: string;
  itemOrder?: number;
  outcome: "SAVED" | "IGNORED" | "FAILED";
  code: string;
  message: string;
  currentVersion?: number;
  questionId?: string;
  moduleId?: string;
  createdModuleIds?: string[];
  issues?: QuestionImportIssue[];
}

export interface ImportConfirmationResult {
  id: string;
  status: import("./question-import.model").QuestionImportStatus | null;
  summary: QuestionImportSummary | null;
  summaryUnavailable: boolean;
  saved: number;
  ignored: number;
  failed: number;
  results: ImportConfirmationItemResult[];
}
