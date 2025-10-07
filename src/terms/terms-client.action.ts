"use client";

import HttpClient from "@/util/http-client/fetch-client.util";
import { TermsOfUse, PrivacyPolicy, TermsResponse } from "@/types/terms.types";
import { DefaultResponse } from "@/signup/signup.action";

export interface TermsData {
  termsOfUse: TermsOfUse | null;
  privacyPolicy: PrivacyPolicy | null;
  error?: string;
}

export async function getTermsFromAPI(): Promise<TermsData> {
  try {
    const {data} = await HttpClient.fetch<DefaultResponse<TermsResponse>>('/terms');

    return {
      termsOfUse: data.termsOfUse,
      privacyPolicy: data.privacyPolicy,
      error: data.error
    };

  } catch (error: unknown) {
    console.error('Erro ao buscar termos:', error);
    return {
      termsOfUse: null,
      privacyPolicy: null,
      error: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}
