export interface TermsOfUse {
  id: string;
  version: string;
  title: string;
  content: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
  is_active: boolean;
}

export interface PrivacyPolicy {
  id: string;
  version: string;
  title: string;
  content: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
  is_active: boolean;
}

export interface LegalNotice {
  version: string;
  title: string;
  content: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface CancellationPolicy {
  version: string;
  title: string;
  content: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface AcceptanceTerms {
  version: string;
  title: string;
  content: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface AutoRenewalTerms {
  version: string;
  title: string;
  content: string;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface TermsResponse {
  termsOfUse: TermsOfUse;
  privacyPolicy: PrivacyPolicy;
  legalNotice: LegalNotice;
  cancellationPolicy: CancellationPolicy;
  acceptanceTerms: AcceptanceTerms;
  autoRenewalTerms: AutoRenewalTerms;
  success: boolean;
  error?: string;
}
