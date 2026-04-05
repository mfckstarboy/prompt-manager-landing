import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CANONICAL_HOST = "www.prompttray.app";
const NON_CANONICAL_HOST = "prompttray.app";

export function middleware(request: NextRequest) {
  const { nextUrl } = request;

  if (nextUrl.hostname === NON_CANONICAL_HOST) {
    const redirectUrl = new URL(nextUrl.toString());
    redirectUrl.hostname = CANONICAL_HOST;
    redirectUrl.protocol = "https:";

    return NextResponse.redirect(redirectUrl, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
