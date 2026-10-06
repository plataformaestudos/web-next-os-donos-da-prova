import { NextRequest, NextResponse } from "next/server";
import { affiliateBackend, REFERRAL_COOKIE, QUOTE_COOKIE, referralCookieOptions } from "@/affiliates/referral-server";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ message: "Origem inválida." }, { status: 403 });
  const referralToken = request.cookies.get(REFERRAL_COOKIE)?.value;
  if (!referralToken) return NextResponse.json({ active: false }, { headers: { "Cache-Control": "no-store" } });
  const { planId, cycle } = await request.json();
  const response = await affiliateBackend(request, "/affiliate-links/public/quote", { referralToken, planId, cycle });
  if (!response.ok) {
    response.cookies.delete(QUOTE_COOKIE);
    return response;
  }
  const data = await response.json();
  const result = NextResponse.json({ ...data, active: true }, { headers: { "Cache-Control": "no-store" } });
  result.cookies.set(QUOTE_COOKIE, JSON.stringify({ quoteToken: data.quoteToken, quoteId: data.quoteId, planId, cycle }), { ...referralCookieOptions, expires: new Date(data.expiresAt) });
  return result;
}

export async function DELETE(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ message: "Origem inválida." }, { status: 403 });
  const response = NextResponse.json({ active: false }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.delete(REFERRAL_COOKIE);
  response.cookies.delete(QUOTE_COOKIE);
  return response;
}
