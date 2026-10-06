import { NextRequest } from "next/server";
import { affiliateBackend, futureExpiry, isPlanCycle, isRecord, isReferralToken, quoteResponse, REFERRAL_COOKIE, referralCookieOptions, referralJson, sameOrigin, setQuoteCookie, validQuote } from "@/affiliates/referral-server";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return referralJson({ message: "Origem inválida." }, 403);
  const body: unknown = await request.json().catch(() => null);
  if (!isPlanCycle(body) || !isRecord(body) || typeof body.code !== "string"
    || body.code.trim().length > 100 || !/^[a-z0-9]+(-[a-z0-9]+)*$/i.test(body.code.trim())) {
    return referralJson({ message: "Informe um código, plano e ciclo válidos." }, 400);
  }
  const referralToken = request.cookies.get(REFERRAL_COOKIE)?.value;
  const { code, planId, cycle } = body;
  const response = await affiliateBackend(request, "/affiliate-links/public/code", {
    code, planId, cycle, ...(isReferralToken(referralToken) ? { referralToken } : {}),
  });
  if (!response.ok) return response;
  const data: unknown = await response.json().catch(() => null);
  if (!validQuote(data, planId, cycle) || !isReferralToken(data.referralToken)) {
    return referralJson({ message: "Não foi possível validar o código. Tente novamente." }, 502);
  }
  const referralExpiresAt = futureExpiry(data.referralExpiresAt);
  if (!referralExpiresAt || new Date(data.expiresAt).getTime() > referralExpiresAt.getTime()) {
    return referralJson({ message: "Não foi possível validar o código. Tente novamente." }, 502);
  }
  // Validate the entire backend result before replacing either cookie.
  const result = quoteResponse(data);
  result.cookies.set(REFERRAL_COOKIE, data.referralToken, { ...referralCookieOptions, expires: referralExpiresAt });
  setQuoteCookie(result, data, planId, cycle);
  return result;
}
