import { cookies } from "next/headers";
import {
  createSessionToken,
  sessionCookieName,
  verifySessionToken,
} from "./sessionCore";
import type { SessionUser } from "./types";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;

  return verifySessionToken(token);
}

export async function setSessionCookie(user: SessionUser) {
  const cookieStore = await cookies();
  const token = await createSessionToken(user);

  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(sessionCookieName);
}

function shouldUseSecureCookies() {
  if (process.env.VERCEL === "1") {
    return true;
  }

  return process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false;
}
