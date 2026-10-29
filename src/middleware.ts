import { type NextRequest, NextResponse } from "next/server";
import { isBuiltinEbookPublicPath, isCustomEbookPath } from "@/ebooks/public-path";


export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value; 
  const publicPaths = [
    "/login",
    "/r",
    "/api/affiliate-referral/quote",
    "/api/affiliate-referral/code",
    "/api/affiliate-referral/preview",
    "/api/affiliate-referral/apply-code",
    "/api/affiliate-checkout/new-user",
    "/cadastro",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/auth/confirm",
    "/auth/logout",
    "/accept-invitation",
    "/termos-e-politicas",
    "/terms-and-policies",
    "/termos-de-uso",
    "/terms-of-use",
    "/politica-privacidade",
    "/privacy-policy",
    "/configuracoes-cookies",
    "/config-cookies",
  ];
  const pathname = request.nextUrl.pathname;
  let isPublic = publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`)) || isBuiltinEbookPublicPath(pathname);
  if (!isPublic && isCustomEbookPath(pathname) && process.env.NEXT_PUBLIC_API_BASE_URL) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/public/ebook-pages?path=${encodeURIComponent(pathname)}`, { cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(4000) });
      if (response.ok) {
        const page: unknown = await response.json();
        isPublic = typeof page === "object" && page !== null && "path" in page && page.path === pathname;
      }
    } catch { /* Fail closed: unpublished pages never open application routes. */ }
  }
  if (!token && !isPublic) {
    console.log("No access token found, redirecting to login");
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  if (isBuiltinEbookPublicPath(pathname)) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
