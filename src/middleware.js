import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ANON_COOKIE = "oz_anon";

export async function middleware(request) {
  const protectedPaths = ["/dashboard", "/profile", "/write"];
  const path = request.nextUrl.pathname;
  const isProtectedPath = protectedPaths.some((protectedPath) =>
    path.startsWith(protectedPath)
  );

  const response = NextResponse.next();

  if (isProtectedPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
  }
  if (path.startsWith("/listings")) {
    if (request.cookies.get(ANON_COOKIE)) return response;

    const anonId = crypto.randomUUID();

    response.cookies.set({
      name: ANON_COOKIE,
      value: anonId,
      httpOnly: true,
      secure: false, // HTTPS 전용 아님 -> 배포하면 수정하자
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 년
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/write/:path*",
    "/listings/:path*",
  ],
};
