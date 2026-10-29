import HttpClient from "@/util/http-client/fetch-client.util";
import type { AdminEbook, AdminEbookPage, AdminOrder, AdminOrderDetail, EbookFile, EmailDelivery, PageDraft, PagePreview, Paginated } from "./types";

const request = <T>(path: string, init: RequestInit = {}) => HttpClient.fetch<T>(`/admin/${path}`, { ...init, cache: "no-store" }, false, { suppressGlobalError: true });
const json = (method: string, body?: unknown): RequestInit => ({ method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
const upload = <T>(path: string, file: File) => {
  const body = new FormData();
  body.append("file", file);
  return request<T>(path, { method: "POST", body });
};
export const adminEbookApi = {
  ebooks: (page: number, limit = 20) => request<Paginated<AdminEbook>>(`ebooks?page=${page}&limit=${limit}`),
  ebook: (id: string) => request<AdminEbook>(`ebooks/${id}`),
  saveEbook: (id: string | undefined, data: { title: string; description: string; priceCents: number; status?: AdminEbook["status"] }) => request<AdminEbook>(id ? `ebooks/${id}` : "ebooks", json(id ? "PATCH" : "POST", data)),
  files: (id: string) => request<EbookFile[]>(`ebooks/${id}/files`),
  uploadPdf: (id: string, file: File) => upload<EbookFile>(`ebooks/${id}/files`, file),
  pages: (page: number) => request<Paginated<AdminEbookPage>>(`ebook-pages?page=${page}&limit=20`),
  savePage: (id: string | undefined, data: PageDraft) => request<AdminEbookPage>(id ? `ebook-pages/${id}` : "ebook-pages", json(id ? "PATCH" : "POST", data)),
  preview: (id: string) => request<PagePreview>(`ebook-pages/${id}/preview`),
  publish: (id: string) => request<AdminEbookPage>(`ebook-pages/${id}/publish`, json("POST")),
  unpublish: (id: string) => request<AdminEbookPage>(`ebook-pages/${id}/unpublish`, json("POST")),
  uploadImage: (id: string, file: File) => upload<{ url: string }>(`ebook-pages/${id}/images`, file),
  orders: (page: number) => request<Paginated<AdminOrder>>(`ebook-orders?page=${page}&limit=20`),
  order: (id: string) => request<AdminOrderDetail>(`ebook-orders/${id}`),
  email: (id: string) => request<EmailDelivery>(`ebook-orders/${id}/email`),
  resend: (id: string) => request<{ status: "QUEUED" }>(`ebook-orders/${id}/email`, json("POST")),
};
async function binaryRequest(path: string, method = "GET") {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/admin/${path}`, { method, credentials: "include", cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "Acesso administrativo não autorizado." : "Não foi possível concluir a operação.");
  return response;
}
export async function removeEbookPage(id: string) {
  await binaryRequest(`ebook-pages/${id}`, "DELETE");
}
export async function downloadAdminPdf(id: string, file: EbookFile) {
  const response = await binaryRequest(`ebooks/${id}/files/${file.id}/download`);
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.originalName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export function ebookAdminError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Não foi possível concluir a operação. Tente novamente.";
}
/** Prices are parsed as decimal strings so R$ 19,90 persists exactly as 1990 cents. */
export function reaisToCents(value: string): number {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) throw new Error("Informe o preço em reais com até duas casas decimais.");
  const [whole, fraction = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents < 1 || cents > 2147483647) throw new Error("Informe um preço entre R$ 0,01 e R$ 21.474.836,47.");
  return cents;
}

/** API JSONB and Ant Form can return identical content with different key order. */
export function equalPageDrafts(first: PageDraft, second: PageDraft): boolean {
  const normalize = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(normalize);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => [key, normalize(item)]));
    return value;
  };
  return JSON.stringify(normalize(first)) === JSON.stringify(normalize(second));
}
