import type { SessionPayload, SessionUser, UserRole } from "./types";

export const sessionCookieName = "page_studio_session";

const encoder = new TextEncoder();
const sessionDurationMs = 1000 * 60 * 60 * 8;

function base64UrlEncode(value: string) {
  return btoa(value)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(value: string) {
  const paddedValue = value.padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    "=",
  );

  return atob(paddedValue.replaceAll("-", "+").replaceAll("_", "/"));
}

async function getSigningKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signValue(value: string, secret: string) {
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  const signatureBytes = String.fromCharCode(...new Uint8Array(signature));

  return base64UrlEncode(signatureBytes);
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || "dev-session-secret-change-me";
}

export async function createSessionToken(user: SessionUser) {
  const payload: SessionPayload = {
    email: user.email,
    role: user.role,
    expiresAt: Date.now() + sessionDurationMs,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await signValue(encodedPayload, getSessionSecret());

  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await signValue(encodedPayload, getSessionSecret());

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;

    if (payload.expiresAt < Date.now()) {
      return null;
    }

    if (!isKnownRole(payload.role) || !payload.email) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function canAccessRole(
  role: UserRole | undefined,
  allowedRoles: UserRole[],
) {
  return Boolean(role && allowedRoles.includes(role));
}

function isKnownRole(role: unknown): role is UserRole {
  return role === "viewer" || role === "editor" || role === "publisher";
}
