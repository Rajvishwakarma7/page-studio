"use server";

import { redirect } from "next/navigation";
import { authenticateDemoUser } from "@/lib/auth/users";
import { setSessionCookie } from "@/lib/auth/session";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirectTo") || "/preview/home");
  const user = authenticateDemoUser(email, password);

  if (!user) {
    return {
      error: "Use one of the demo users and the password from the brief.",
    };
  }

  await setSessionCookie(user);
  redirect(redirectTo.startsWith("/") ? redirectTo : "/preview/home");
}
