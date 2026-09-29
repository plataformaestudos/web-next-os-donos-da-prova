import type { QuestionImport } from "./question-import.model";
import type {
  DraftField,
  DraftPatch,
  ImportItem,
  ItemFilters,
} from "./import-preview.model";

export function canEditImport(batch: QuestionImport, now = Date.now()) {
  return (
    ["READY", "PARTIALLY_SAVED"].includes(batch.status) &&
    (!batch.expiresAt || Date.parse(batch.expiresAt) > now)
  );
}
export function canEditItem(item: ImportItem) {
  return !["SAVING", "SAVED"].includes(item.persistenceStatus);
}
export function canApproveItem(item: ImportItem) {
  return (
    canEditItem(item) &&
    ["VALID", "VALID_WITH_WARNINGS"].includes(item.validationStatus)
  );
}
export function itemSearch(filters: ItemFilters) {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
  });
  for (const field of [
    "validationStatus",
    "reviewStatus",
    "hasWarnings",
  ] as const) {
    if (filters[field] !== undefined) params.set(field, String(filters[field]));
  }
  filters.modulePath?.forEach((part) => params.append("modulePath[]", part));
  return params.toString();
}

// Untouched fields must not be resent: doing so clears recoverable parser issues.
export function buildDraftPatch(
  item: ImportItem,
  edited: ImportItem,
  reviewed: DraftField[],
): DraftPatch {
  const patch: DraftPatch = { version: item.version };
  for (const field of reviewed) {
    if (field === "modulePath") patch.modulePath = edited.modulePath;
    else if (field === "sourceNumber") patch.sourceNumber = edited.sourceNumber;
    else
      Object.assign((patch.payload ??= {}), { [field]: edited.payload[field] });
  }
  return patch;
}

export const validityLabels = {
  PENDING: "Validação pendente",
  VALID: "Válida sem avisos",
  VALID_WITH_WARNINGS: "Válida com avisos",
  INVALID: "Inválida",
};
export const reviewLabels = {
  PENDING: "Revisão pendente",
  APPROVED: "Aprovada",
  EXCLUDED: "Excluída",
};
export const moduleLabels = {
  PENDING: "Módulo pendente",
  EXISTING: "Módulo será reaproveitado",
  WILL_CREATE: "Módulo será criado ao confirmar",
  UNRESOLVED: "Corrigir módulo",
};
