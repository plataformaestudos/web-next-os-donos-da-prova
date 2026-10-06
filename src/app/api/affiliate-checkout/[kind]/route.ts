import { NextRequest } from "next/server";
import { affiliateBackend, REFERRAL_COOKIE, QUOTE_COOKIE, clearReferralCookie, futureExpiry, isRecord, isReferralToken, isQuoteToken, referralJson, sameOrigin } from "@/affiliates/referral-server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  // Reject cross-site form submissions; credentials and prices are forwarded only to our API.
  if (!sameOrigin(request)) return referralJson({ message: "Origem inválida." }, 403);
  const { kind } = await params;
  if (kind !== "new-user" && kind !== "existing-user") return referralJson({}, 404);
  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body)) return referralJson({ message: "Dados de contratação inválidos." }, 400);
  delete body.referralToken;
  delete body.quoteToken;
  const freeSignup = kind === "new-user" && body.billingType === "FREE";
  const referralToken = request.cookies.get(REFERRAL_COOKIE)?.value;
  if (referralToken) {
    delete body.idempotencyKey;
    if (freeSignup && isReferralToken(referralToken)) {
      // The API checks the actual plan is Free before bypassing affiliate pricing.
      body.referralToken = referralToken;
    } else {
      let quote: unknown;
      try {
        quote = JSON.parse(request.cookies.get(QUOTE_COOKIE)?.value || "null");
      } catch { /* Malformed cookies must be revalidated before checkout. */ }
      if (!isReferralToken(referralToken) || !isRecord(quote) || quote.planId !== body.planId || quote.cycle !== body.cycle
        || !isQuoteToken(quote.quoteToken) || typeof quote.quoteId !== "string" || !/^[0-9a-f-]{36}$/i.test(quote.quoteId)
        // Legacy cookies omit expiresAt; the signed token expiry remains enforced by the API.
        || (quote.expiresAt !== undefined && !futureExpiry(quote.expiresAt))) {
        return referralJson({ message: "Confira a oferta para este plano e ciclo antes de contratar, ou remova o código para continuar pelo valor regular." }, 409);
      }
      body.referralToken = referralToken;
      body.quoteToken = quote.quoteToken;
      body.idempotencyKey = quote.quoteId;
    }
  }
  const response = await affiliateBackend(request, kind === "new-user" ? "/subscription/new-user" : "/subscription", body);
  if (response.ok && !freeSignup) clearReferralCookie(response, QUOTE_COOKIE);
  return response;
}
