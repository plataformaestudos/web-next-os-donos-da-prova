import { NextRequest, NextResponse } from "next/server";
import { affiliateBackend, REFERRAL_COOKIE, QUOTE_COOKIE } from "@/affiliates/referral-server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  // Reject cross-site form submissions; credentials and prices are forwarded only to our API.
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return NextResponse.json({ message: "Origem inválida." }, { status: 403 });
  const { kind } = await params;
  if (kind !== "new-user" && kind !== "existing-user") return NextResponse.json({}, { status: 404 });
  const body = await request.json();
  delete body.referralToken;
  delete body.quoteToken;
  const referralToken = request.cookies.get(REFERRAL_COOKIE)?.value;
  if (referralToken) {
    body.referralToken = referralToken;
    try {
      const quote = JSON.parse(request.cookies.get(QUOTE_COOKIE)?.value || "null");
      if (quote?.planId === body.planId && quote?.cycle === body.cycle) { body.quoteToken = quote.quoteToken; body.idempotencyKey = quote.quoteId; }
    } catch { /* An invalid or expired quote is revalidated by the API. */ }
  }
  const response = await affiliateBackend(request, kind === "new-user" ? "/subscription/new-user" : "/subscription", body);
  if (response.ok) response.cookies.delete(QUOTE_COOKIE);
  return response;
}
