import { NextRequest, NextResponse } from "next/server";

export const REFERRAL_COOKIE = "odp_referral";
export const QUOTE_COOKIE = "odp_referral_quote";
export const referralCookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

export async function affiliateBackend(request: NextRequest, path: string, body: unknown) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return NextResponse.json({ message: "API não configurada." }, { status: 503 });
  const response = await fetch(`${base}${path}`, {
    method: "POST", cache: "no-store", headers: {
      "Content-Type": "application/json",
      ...(request.cookies.get("access_token") ? { cookie: `access_token=${request.cookies.get("access_token")?.value}` } : {}),
    }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000),
  });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
