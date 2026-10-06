import HttpClient from "@/util/http-client/fetch-client.util";
import { HttpError } from "@/lib/errors";

export type AffiliateStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type LinkStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";
export type OfferCycle = string;
export interface Affiliate {
  id: string; name: string; externalReference: string | null;
  contact: string | null; status: AffiliateStatus;
}
export interface AffiliateLink {
  id: string; title: string; slug: string; affiliateId: string | null;
  source: "INFLUENCER" | "EBOOK" | "CAMPAIGN"; status: LinkStatus;
}
export interface AffiliateOffer {
  id: string; version: number; discountType: "FIXED" | "PERCENTAGE";
  discountValue: number; startsAt: string | null; endsAt: string | null;
  plans: { planId: string; cycle: OfferCycle }[];
}
export interface Paged<T> { data: T[]; total: number; page: number; limit: number }
export type AffiliateInput = Omit<Affiliate, "id">;
export type LinkInput = Omit<AffiliateLink, "id">;
export type OfferInput = Omit<AffiliateOffer, "id" | "version">;
export interface AffiliatePlan { id: string; name: string; cycles: { cycle: string; baseAmountCents: number }[] }
export function affiliateError(error: unknown): string {
  if (error instanceof HttpError) {
    const detail = (error.data as { message?: unknown } | undefined)?.message;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.every(value => typeof value === "string")) return detail.join(" ");
  }
  return "Não foi possível concluir a solicitação. Tente novamente.";
}
const request = <T>(path: string, method: string = "GET", body?: unknown) =>
  HttpClient.fetch<T>(path, { method, cache: "no-store", ...(body === undefined ? {} : { body: JSON.stringify(body) }) }, false);
export const listAffiliates = (page = 1, limit = 20) => request<Paged<Affiliate>>(`/affiliates?page=${page}&limit=${limit}`);
export const saveAffiliate = (data: AffiliateInput, id?: string) => {
  const { name, contact, externalReference } = data;
  return request<Affiliate>(id ? `/affiliates/${encodeURIComponent(id)}` : "/affiliates", id ? "PATCH" : "POST", id ? data : { name, contact, externalReference });
};
export const listAffiliateLinks = (page = 1, limit = 20) => request<Paged<AffiliateLink>>(`/affiliate-links?page=${page}&limit=${limit}`);
export const saveAffiliateLink = (data: LinkInput, id?: string) => {
  const { title, slug, affiliateId, source, status } = data;
  return request<AffiliateLink>(id ? `/affiliate-links/${encodeURIComponent(id)}` : "/affiliate-links", id ? "PATCH" : "POST", id ? { title, status } : { title, slug, affiliateId, source });
};
export const updateAffiliateLinkStatus = (id: string, status: LinkStatus) =>
  request<AffiliateLink>(`/affiliate-links/${encodeURIComponent(id)}`, "PATCH", { status });
export const listAffiliateOffers = (id: string) => request<AffiliateOffer[]>(`/affiliate-links/${encodeURIComponent(id)}/offers`);
export const publishAffiliateOffer = (id: string, data: OfferInput) => request<Omit<AffiliateOffer, "plans">>(`/affiliate-links/${encodeURIComponent(id)}/offers`, "POST", data);
export const listAffiliatePlans = () => request<AffiliatePlan[]>("/affiliate-catalog/plans");

export interface AffiliateDashboard {
  visits: number; uniqueVisitors: number; subscriptions: number; pendingSubscriptions: number;
  paidConversions: number; conversionRate: number; grossRevenueCents: number;
  refundedRevenueCents: number; netRevenueCents: number; currency: "BRL"; financialDefinition: string;
}
export interface AffiliateCustomer {
  subscriptionId: string; userId: string; name: string | null; email: string | null;
  planName: string; cycle: string; status: string; baseAmountCents: number;
  discountAmountCents: number; finalAmountCents: number; acceptedAt: string; firstPaymentConfirmedAt: string | null;
}
export const affiliateDashboard = (id?: string) => request<AffiliateDashboard>(id ? `/affiliate-links/${encodeURIComponent(id)}/dashboard` : "/affiliates/dashboard");
export const affiliateCustomers = (id: string, page = 1) => request<Paged<AffiliateCustomer>>(`/affiliate-links/${encodeURIComponent(id)}/customers?page=${page}&limit=20`);

export const affiliatePartnerDashboard = (id: string) => request<AffiliateDashboard>(`/affiliates/${encodeURIComponent(id)}/dashboard`);
