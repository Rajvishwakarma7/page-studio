import { NextResponse, type NextRequest } from "next/server";
import {
  canAccessRole,
  sessionCookieName,
  verifySessionToken,
} from "@/lib/auth/sessionCore";
import type { UserRole } from "@/lib/auth/types";

const protectedRoutes: Array<{
  prefix: string;
  roles: UserRole[];
}> = [
  {
    prefix: "/api/publish",
    roles: ["publisher"],
  },
];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const route = protectedRoutes.find((protectedRoute) =>
    pathname.startsWith(protectedRoute.prefix),
  );

  if (!route) {
    return NextResponse.next();
  }

  const session = await verifySessionToken(
    request.cookies.get(sessionCookieName)?.value,
  );

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (!canAccessRole(session.role, route.roles)) {
    return NextResponse.redirect(new URL("/preview/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/publish/:path*"],
};
