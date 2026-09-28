import axios from "axios";
import type { ModuleModel } from "@/model/module.model";
import type { ResponseModel } from "@/model/common.model";
import type {
  AcceptedQuestionImport,
  QuestionImport,
} from "./question-import.model";
import { DOCX_MIME, isImportId } from "./question-import.rules";

// Upload and polling errors belong to this page, not the global auto-back dialog.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  timeout: 20_000,
});

export async function loadImport(
  id: string,
  signal?: AbortSignal,
): Promise<QuestionImport> {
  const response = await api.get<ResponseModel<QuestionImport>>(
    `/question-imports/${id}`,
    { signal },
  );
  return response.data.data;
}

export async function loadImportRoots(
  signal?: AbortSignal,
): Promise<ModuleModel[]> {
  const response = await api.get<ResponseModel<ModuleModel[]>>(
    "/modules/root-modules",
    { signal },
  );
  return response.data.data.filter((module) => !module.parentModuleId);
}

export async function uploadImport(options: {
  file: File;
  rootModuleId?: string;
  retryId?: string;
  onProgress: (percent: number) => void;
}): Promise<AcceptedQuestionImport> {
  const body = new FormData();
  body.append(
    "file",
    new Blob([options.file], { type: DOCX_MIME }),
    options.file.name,
  );
  if (!options.retryId && options.rootModuleId)
    body.append("rootModuleId", options.rootModuleId);
  const path = options.retryId
    ? `/question-imports/${options.retryId}/retry`
    : "/question-imports";
  // No automatic POST retries: a lost response may already have created a batch.
  const response = await api.post<ResponseModel<AcceptedQuestionImport>>(
    path,
    body,
    {
      timeout: 120_000,
      onUploadProgress: ({ loaded, total }) => {
        if (total)
          options.onProgress(Math.min(100, Math.round((loaded * 100) / total)));
      },
    },
  );
  return response.data.data;
}

export function importErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export function failedImportId(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return;
  const id: unknown = error.response?.data?.importId;
  return typeof id === "string" && isImportId(id) ? id : undefined;
}

export function importErrorMessage(error: unknown, uploading = false): string {
  const status = importErrorStatus(error);
  if (status === 401)
    return "Sua sessão expirou. Entre novamente para continuar.";
  if (status === 403)
    return "Você não tem permissão para acessar a importação de questões.";
  if (status === 404)
    return "Importação não encontrada ou indisponível para seu usuário.";
  if (status === 413)
    return "O documento excede o tamanho permitido (até 30 MB).";
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === "string")
    )
      return message.join(" ");
    if (!error.response)
      return uploading
        ? "A conexão foi interrompida. O servidor pode ter recebido o documento. Não reenviamos automaticamente; uma nova tentativa pode criar outra importação."
        : "Não foi possível atualizar o processamento. Verifique sua conexão; tentaremos novamente.";
  }
  return "Não foi possível concluir a operação. Tente novamente em instantes.";
}
