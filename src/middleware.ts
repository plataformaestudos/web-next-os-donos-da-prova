import { type NextRequest, NextResponse } from "next/server";


export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value; 
  const publicPaths = ["/login", "/cadastro", "/signup", "/forgot-password", "/reset-password", "/auth/confirm", "/auth/logout", "/accept-invitation"];
  const isPublic = publicPaths.some((path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`));
  if (!token && !isPublic) {
    console.log("No access token found, redirecting to login");
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
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
