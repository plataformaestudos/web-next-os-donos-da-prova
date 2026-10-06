import { NextRequest, NextResponse } from "next/server";
import { affiliateBackend, REFERRAL_COOKIE, QUOTE_COOKIE, referralCookieOptions } from "@/affiliates/referral-server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = new URL(request.cookies.get("access_token") ? "/assinatura?campaign=1" : "/cadastro", request.url);
  const unavailable = () => {
    const redirect = NextResponse.redirect(new URL("/cadastro?campaign=unavailable", request.url));
    redirect.cookies.delete(REFERRAL_COOKIE);
    redirect.cookies.delete(QUOTE_COOKIE);
    redirect.headers.set("Cache-Control", "no-store");
    return redirect;
  };
  try {
    const response = await affiliateBackend(request, `/affiliate-links/public/${encodeURIComponent(slug)}/visit`, { referralToken: request.cookies.get(REFERRAL_COOKIE)?.value });
    if (!response.ok) return unavailable();
    const result: { referralToken: string; expiresAt: string } = await response.json();
    const redirect = NextResponse.redirect(destination);
    redirect.cookies.set(REFERRAL_COOKIE, result.referralToken, { ...referralCookieOptions, expires: new Date(result.expiresAt) });
    redirect.cookies.delete(QUOTE_COOKIE);
    redirect.headers.set("Cache-Control", "no-store");
    return redirect;
  } catch {
    return unavailable();
  }
}
