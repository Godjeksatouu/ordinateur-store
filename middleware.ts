import { type NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/', '/cart'],
};

export async function middleware(request: NextRequest) {
  // Simple middleware without flags system
  return NextResponse.next();

  // response headers
  const headers = new Headers();
  headers.append('set-cookie', `stable-id=${stableId.value}`);
  headers.append('set-cookie', `cart-id=${cartId.value}`);
  return NextResponse.rewrite(nextUrl, { request, headers });
}
