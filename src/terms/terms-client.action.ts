"use client";

import HttpClient from "@/util/http-client/fetch-client.util";
import { TermsOfUse, PrivacyPolicy, TermsResponse, LegalNotice, CancellationPolicy, AcceptanceTerms, AutoRenewalTerms } from "@/types/terms.types";
import { DefaultResponse } from "@/signup/signup.action";

export interface TermsData {
  termsOfUse: TermsOfUse | null;
  privacyPolicy: PrivacyPolicy | null;
  legalNotice: LegalNotice | null;
  cancellationPolicy: CancellationPolicy | null;
  acceptanceTerms: AcceptanceTerms | null;
  autoRenewalTerms: AutoRenewalTerms | null;
  error?: string;
}

export async function getTermsFromAPI(): Promise<TermsData> {
  try {
    const {data} = await HttpClient.fetch<DefaultResponse<TermsResponse>>('/terms', {}, false);

    return {
      termsOfUse: data.termsOfUse,
      privacyPolicy: data.privacyPolicy,
      legalNotice: data.legalNotice,
      cancellationPolicy: data.cancellationPolicy,
      acceptanceTerms: data.acceptanceTerms,
      autoRenewalTerms: data.autoRenewalTerms,
      error: data.error
    };

  } catch (error: unknown) {
    console.error('Erro ao buscar termos:', error);
    return {
      termsOfUse: null,
      privacyPolicy: null,
      legalNotice: null,
      cancellationPolicy: null,
      acceptanceTerms: null,
      autoRenewalTerms: null,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}
