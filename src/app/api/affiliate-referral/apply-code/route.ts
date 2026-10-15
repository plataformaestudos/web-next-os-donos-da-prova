import { NextRequest } from "next/server";
import { affiliateBackend, clearReferralCookie, futureExpiry, isRecord, isReferralToken, QUOTE_COOKIE, REFERRAL_COOKIE, referralCookieOptions, referralJson, sameOrigin } from "@/affiliates/referral-server";
import { parseReferralPreview } from "@/affiliates/referral-preview";

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return referralJson({ message: "Origem inválida." }, 403);
  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body) || typeof body.code !== "string" || body.code.trim().length > 100
    || !/^[a-z0-9]+(-[a-z0-9]+)*$/i.test(body.code.trim())) return referralJson({ message: "Informe um código de campanha válido." }, 400);
  const previousToken = request.cookies.get(REFERRAL_COOKIE)?.value;
  const response = await affiliateBackend(request, "/affiliate-links/public/apply-code", {
    code: body.code, ...(isReferralToken(previousToken) ? { referralToken: previousToken } : {}),
  });
  if (!response.ok) return response;
  const data: unknown = await response.json().catch(() => null);
  if (isRecord(data) && isReferralToken(data.referralToken)) {
    const referralExpiresAt = futureExpiry(data.referralExpiresAt);
    try {
      const preview = parseReferralPreview({ ...data, active: true });
      if (preview && preview.prices.some(price => price.available) && referralExpiresAt && Date.parse(preview.expiresAt) <= referralExpiresAt.getTime()) {
        const result = referralJson({ ...preview, active: true });
        result.cookies.set(REFERRAL_COOKIE, data.referralToken, { ...referralCookieOptions, expires: referralExpiresAt });
        clearReferralCookie(result, QUOTE_COOKIE);
        return result;
      }
    } catch { /* Validate all prices and expiries before replacing attribution. */ }
  }
  return referralJson({ message: "Não foi possível validar o código. Tente novamente." }, 502);
}
