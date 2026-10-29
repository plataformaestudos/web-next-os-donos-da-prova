import type { EbookOrderStatus, EbookPageContent, EbookPageSections, EbookPaymentMethod, EbookProduct, PublicEbookPage } from "../types";
import { ebookFaqItems, ebookFaqTitle } from "../faq";

export interface AdminEbook extends EbookProduct {
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  currentFileId: string | null;
}
export interface EbookFile { id: string; version: number; originalName: string; sizeBytes: number }
export interface AdminEbookPage {
  id: string;
  ebookId: string;
  path: string;
  content: EbookPageContent;
  sections: EbookPageSections;
  published: { path: string; at: string } | null;
}
export interface PageDraft { ebookId: string; path: string; content: EbookPageContent; sections: EbookPageSections }
export interface PagePreview { page: PublicEbookPage; issues: string[] }
export interface Paginated<T> { data: T[]; total: number }
export interface AdminOrder {
  id: string;
  title: string;
  buyerName: string;
  buyerEmail: string;
  priceCents: number;
  status: EbookOrderStatus;
  method: EbookPaymentMethod;
  createdAt: string;
  paidAt: string | null;
  revokedAt: string | null;
}
export interface AdminOrderDetail extends AdminOrder { attempt: { stage: string } | null }
export interface EmailDelivery {
  configured: boolean;
  jobs: Array<{ status: string; attempts: number; created_at: string; sent_at: string | null }>;
}
export const emptyContent = (): EbookPageContent => ({
  headline: "", description: "", bannerDesktopUrl: "", bannerMobileUrl: "", ctaText: "Comprar ebook",
  benefitsTitle: "Por que escolher este ebook?", contentsTitle: "O que você vai encontrar", faqTitle: ebookFaqTitle,
  seoTitle: "", seoDescription: "", socialImageUrl: "", benefits: [], contents: [], faq: [...ebookFaqItems],
});
