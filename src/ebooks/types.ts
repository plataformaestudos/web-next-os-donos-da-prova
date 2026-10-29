export interface EbookProduct {
  id: string;
  title: string;
  description: string;
  priceCents: number;
}

export interface EbookPageContent {
  headline: string;
  description: string;
  bannerDesktopUrl: string;
  bannerMobileUrl: string;
  ctaText: string;
  benefitsTitle?: string;
  contentsTitle?: string;
  faqTitle?: string;
  seoTitle?: string;
  seoDescription?: string;
  socialImageUrl?: string;
  benefits: Array<{ title: string; description: string }>;
  contents: Array<{ title: string; description: string }>;
  faq: Array<{ question: string; answer: string }>;
}

export interface EbookPageSections {
  benefits: boolean;
  contents: boolean;
  faq: boolean;
}

export interface PublicEbookPage {
  id: string;
  path: string;
  ebook: EbookProduct;
  content: EbookPageContent;
  sections: EbookPageSections;
}

export type EbookPaymentMethod = "PIX" | "CREDIT_CARD";
export interface EbookBuyer {
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  postalCode?: string;
  addressNumber?: string;
}
export interface EbookCreditCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}
export interface CreateEbookOrder {
  pageId: string;
  expectedEbookId: string;
  expectedPriceCents: number;
  idempotencyKey: string;
  buyer: EbookBuyer;
  method: EbookPaymentMethod;
  creditCard?: EbookCreditCard;
}

export type EbookOrderStatus = "CREATED" | "PENDING" | "RECONCILING" | "PAID" | "REJECTED" | "EXPIRED" | "CANCELLED" | "REFUNDED" | "CHARGEBACK";
export interface EbookOrder {
  orderId: string;
  status: EbookOrderStatus;
  method: EbookPaymentMethod;
  title: string;
  priceCents: number;
  currency: "BRL";
  pix?: { encodedImage: string; payload: string; expirationDate: string } | null;
}
export interface EbookOrderCreated extends EbookOrder { accessToken: string }
export type EbookEmailStatus = "PENDING" | "SENDING" | "SENT" | "FAILED" | "UNCONFIGURED" | "NOT_REQUIRED";
