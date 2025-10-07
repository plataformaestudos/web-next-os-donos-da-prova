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

export interface TermsResponse {
  termsOfUse: TermsOfUse;
  privacyPolicy: PrivacyPolicy;
  success: boolean;
  error?: string;
}
