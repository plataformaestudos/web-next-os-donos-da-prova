import type { QuestionImportStatus } from "./question-import.model";

export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const MAX_DOCX_BYTES = 30 * 1024 * 1024;
export const IMPORT_PATH = "/importacao-questoes";
export const MAX_QUESTION_NUMBER = 2147483647;

export function validateQuestionRange(
  start?: number | null,
  end?: number | null,
): string | null {
  for (const value of [start, end]) {
    if (
      value != null &&
      (!Number.isInteger(value) || value < 1 || value > MAX_QUESTION_NUMBER)
    )
      return "Informe números inteiros positivos para as questões inicial e final.";
  }
  if (end != null && end < (start ?? 1))
    return "A questão final deve ser maior ou igual à questão inicial.";
  return null;
}

export function validateDocument(
  file: Pick<File, "name" | "size" | "type">,
): string | null {
  if (!/\.docx$/i.test(file.name))
    return "Selecione um arquivo .docx. Arquivos .doc não são aceitos.";
  if (!file.size) return "O documento está vazio. Selecione outro arquivo.";
  if (file.size > MAX_DOCX_BYTES)
    return "O documento deve ter no máximo 30 MB.";
  // Some operating systems do not supply a MIME type. The backend validates
  // the ZIP signature and document structure regardless of the client metadata.
  if (file.type && file.type !== DOCX_MIME)
    return "O tipo do arquivo não corresponde a um documento DOCX.";
  return null;
}

export function isProcessing(status: QuestionImportStatus) {
  return ["PENDING", "QUEUED", "PROCESSING"].includes(status);
}

export function hasPreview(status: QuestionImportStatus) {
  return ["READY", "PARTIALLY_SAVED", "COMPLETED"].includes(status);
}

export function isImportId(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export const statusLabels: Record<QuestionImportStatus, string> = {
  PENDING: "Preparando importação",
  QUEUED: "Aguardando processamento",
  PROCESSING: "Identificando questões",
  READY: "Documento processado",
  PARTIALLY_SAVED: "Questões salvas parcialmente",
  COMPLETED: "Importação concluída",
  FAILED: "Falha no processamento",
  EXPIRED: "Importação encerrada",
};
