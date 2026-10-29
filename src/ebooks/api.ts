import HttpClient from "@/util/http-client/fetch-client.util";
import { CreateEbookOrder, EbookEmailStatus, EbookOrder, EbookOrderCreated, PublicEbookPage } from "./types";

const options = { suppressGlobalError: true };
const post = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body), cache: "no-store", credentials: "omit" });
export function fetchPublicEbookPage(path: string) {
  return HttpClient.fetch<PublicEbookPage>(`/public/ebook-pages?path=${encodeURIComponent(path)}`, { cache: "no-store", credentials: "omit" }, false, options);
}
export function createEbookOrder(body: CreateEbookOrder) {
  return HttpClient.fetch<EbookOrderCreated>("/public/ebook-orders", post(body), false, options);
}
export function fetchEbookOrder(orderId: string, accessToken: string, queryAsaas = false) {
  const action = queryAsaas ? 'refresh' : 'status';
  return HttpClient.fetch<EbookOrder>(`/public/ebook-orders/${encodeURIComponent(orderId)}/${action}`, post({ accessToken }), false, options);
}
export function fetchEbookEmailStatus(orderId: string, accessToken: string) {
  return HttpClient.fetch<{ status: EbookEmailStatus }>(`/public/ebook-orders/${encodeURIComponent(orderId)}/email-status`, post({ accessToken }), false, options);
}
export function resendEbookEmail(orderId: string, accessToken: string) {
  return HttpClient.fetch<{ status: "QUEUED" }>(`/public/ebook-orders/${encodeURIComponent(orderId)}/email`, post({ accessToken }), false, options);
}
export function recoverEbookAccess(email: string) {
  return HttpClient.fetch<unknown>("/public/ebook-delivery/recover", post({ email }), false, options);
}
export async function downloadEbook(orderId: string, accessToken: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/public/ebook-orders/${encodeURIComponent(orderId)}/download`, { ...post({ accessToken }), headers: { "Content-Type": "application/json" }, referrerPolicy: "no-referrer" });
  if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "Este acesso expirou ou não está disponível. Recupere o link pelo email da compra." : "Não foi possível baixar o ebook. Tente novamente.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ebook.pdf";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export const ebookAccessStorageKey = (orderId: string) => `odp:ebook:access:${orderId}`;
export const ebookAttemptStorageKey = (pageId: string) => `odp:ebook:attempt:${pageId}`;
