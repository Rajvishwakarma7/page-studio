import { NextResponse } from "next/server";
import { createSessionToken, sessionCookieName } from "@/lib/auth/sessionCore";
import { authenticateDemoUser } from "@/lib/auth/users";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const redirectTo = getSafeRedirect(String(formData.get("redirectTo") || ""));
  const user = authenticateDemoUser(email, password);

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", redirectTo);
    loginUrl.searchParams.set("error", "invalid");

    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url), 303);
  response.cookies.set(sessionCookieName, await createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return response;
}

function getSafeRedirect(redirectTo: string) {
  return redirectTo.startsWith("/") ? redirectTo : "/preview/home";
}

function shouldUseSecureCookies() {
  if (process.env.VERCEL === "1") {
    return true;
  }

  return process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false;
}
