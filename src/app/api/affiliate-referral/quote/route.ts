import { NextRequest } from "next/server";
import { affiliateBackend, REFERRAL_COOKIE, QUOTE_COOKIE, clearReferralCookie, isPlanCycle, isRecord, isReferralToken, quoteResponse, referralCookieOptions, referralJson, sameOrigin, setQuoteCookie, validQuote } from "@/affiliates/referral-server";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return referralJson({ message: "Origem inválida." }, 403);
  const body: unknown = await request.json().catch(() => null);
  if (!isPlanCycle(body)) return referralJson({ message: "Plano ou ciclo inválido." }, 400);
  const referralToken = request.cookies.get(REFERRAL_COOKIE)?.value;
  if (!referralToken) return referralJson({ active: false });
  if (!isReferralToken(referralToken)) return referralJson({ message: "Indicação inválida. Remova a oferta ou informe o código novamente." }, 400);
  const { planId, cycle } = body;
  const response = await affiliateBackend(request, "/affiliate-links/public/quote", { referralToken, planId, cycle });
  if (!response.ok) {
    const detail: unknown = await response.clone().json().catch(() => null);
    if (response.status === 400 && isRecord(detail) && detail.code === "AFFILIATE_SELECTION_EXCLUDED") {
      const expiresAt = new Date(Date.now() + 15 * 60_000);
      const regular = referralJson({ active: false, excluded: true });
      // Server-established regular selection, while preserving the campaign for other cycles.
      regular.cookies.set(QUOTE_COOKIE, JSON.stringify({ regular: true, planId, cycle, expiresAt: expiresAt.toISOString() }), { ...referralCookieOptions, expires: expiresAt });
      return regular;
    }
    clearReferralCookie(response, QUOTE_COOKIE);
    return response;
  }
  const data: unknown = await response.json().catch(() => null);
  if (!validQuote(data, planId, cycle)) {
    const invalid = referralJson({ message: "Não foi possível validar a oferta. Tente novamente." }, 502);
    clearReferralCookie(invalid, QUOTE_COOKIE);
    return invalid;
  }
  const result = quoteResponse(data);
  setQuoteCookie(result, data, planId, cycle);
  return result;
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return referralJson({ message: "Origem inválida." }, 403);
  const response = referralJson({ active: false });
  clearReferralCookie(response, REFERRAL_COOKIE);
  clearReferralCookie(response, QUOTE_COOKIE);
  return response;
}
