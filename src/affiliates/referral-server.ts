import { NextRequest, NextResponse } from "next/server";

export const REFERRAL_COOKIE = "odp_referral";
export const QUOTE_COOKIE = "odp_referral_quote";
export const referralCookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

export function referralJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return (!origin || origin === request.nextUrl.origin) && request.headers.get("sec-fetch-site") !== "cross-site";
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isReferralToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}

export function isQuoteToken(value: unknown): value is string {
  return typeof value === "string" && value.length <= 3500 && /^[A-Za-z0-9_-]+\.[a-f0-9]{64}$/.test(value);
}

export function futureExpiry(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value && date.getTime() > Date.now() ? date : null;
}

export function isPlanCycle(value: unknown): value is Record<string, unknown> & { planId: string; cycle: string } {
  return isRecord(value) && typeof value.planId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.planId)
    && typeof value.cycle === "string" && ["MONTHLY", "QUARTERLY", "SEMIANNUALLY", "YEARLY"].includes(value.cycle);
}

export function validQuote(value: unknown, planId: string, cycle: string): value is Record<string, unknown> & { quoteToken: string; quoteId: string; expiresAt: string } {
  if (!isRecord(value) || value.planId !== planId || value.cycle !== cycle || !isQuoteToken(value.quoteToken)
    || typeof value.quoteId !== "string" || !/^[0-9a-f-]{36}$/i.test(value.quoteId) || !futureExpiry(value.expiresAt)
    || !isRecord(value.campaign) || typeof value.campaign.title !== "string" || typeof value.campaign.slug !== "string") return false;
  const { baseAmountCents, discountAmountCents, finalAmountCents } = value;
  return typeof baseAmountCents === "number" && Number.isSafeInteger(baseAmountCents) && baseAmountCents > 0
    && typeof discountAmountCents === "number" && Number.isSafeInteger(discountAmountCents) && discountAmountCents >= 0
    && typeof finalAmountCents === "number" && Number.isSafeInteger(finalAmountCents) && finalAmountCents > 0
    && baseAmountCents - discountAmountCents === finalAmountCents;
}

export function quoteResponse(data: Record<string, unknown>) {
  const visible = { ...data };
  delete visible.quoteToken;
  delete visible.referralToken;
  delete visible.referralExpiresAt;
  return referralJson({ ...visible, active: true });
}

export function setQuoteCookie(response: NextResponse, data: { quoteToken: string; quoteId: string; expiresAt: string }, planId: string, cycle: string) {
  response.cookies.set(QUOTE_COOKIE, JSON.stringify({ quoteToken: data.quoteToken, quoteId: data.quoteId, expiresAt: data.expiresAt, planId, cycle }), { ...referralCookieOptions, expires: new Date(data.expiresAt) });
}

export function clearReferralCookie(response: NextResponse, name: string) {
  response.cookies.set(name, "", { ...referralCookieOptions, expires: new Date(0), maxAge: 0 });
}

export async function affiliateBackend(request: NextRequest, path: string, body: unknown) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return referralJson({ message: "API não configurada." }, 503);
  try {
    const response = await fetch(`${base}${path}`, {
      method: "POST", cache: "no-store", headers: {
        "Content-Type": "application/json",
        ...(request.cookies.get("access_token") ? { cookie: `access_token=${request.cookies.get("access_token")?.value}` } : {}),
      }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000),
    });
    return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch {
    return referralJson({ message: "Não foi possível consultar a oferta. Tente novamente." }, 503);
  }
}
