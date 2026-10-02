import { NextRequest, NextResponse } from 'next/server';

// The API removes its own cookie. Remove any legacy host-only cookie on the
// frontend as well, including cookies created by the old server-side login.
export function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ message: 'Origem não autorizada.' }, { status: 403 });
  }
  const response = NextResponse.json({ loggedOut: true });
  response.headers.set('Cache-Control', 'no-store');
  response.cookies.set('access_token', '', {
    httpOnly: true, path: '/', expires: new Date(0), maxAge: 0,
  });
  return response;
}
