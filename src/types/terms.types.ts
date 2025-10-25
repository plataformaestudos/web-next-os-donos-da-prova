export interface TermsOfUse {
  id: string;
  version: string;
  title: string;
  content: string;
  effective_date: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface PrivacyPolicy {
  id: string;
  version: string;
  title: string;
  content: string;
  effective_date: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface LegalNotice {
  version: string;
  title: string;
  content: string;
}

export interface CancellationPolicy {
  version: string;
  title: string;
  content: string;
}

export interface AcceptanceTerms {
  version: string;
  title: string;
  content: string;
}

export interface AutoRenewalTerms {
  version: string;
  title: string;
  content: string;
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
