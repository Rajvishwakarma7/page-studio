import type { SessionUser } from "./types";

type DemoUser = SessionUser & {
  password: string;
};

export const demoUsers = [
  {
    email: "viewer@test.com",
    password: "password",
    role: "viewer",
  },
  {
    email: "editor@test.com",
    password: "password",
    role: "editor",
  },
  {
    email: "publisher@test.com",
    password: "password",
    role: "publisher",
  },
] satisfies DemoUser[];

export function authenticateDemoUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = demoUsers.find(
    (demoUser) =>
      demoUser.email === normalizedEmail && demoUser.password === password,
  );

  if (!user) {
    return null;
  }

  return {
    email: user.email,
    role: user.role,
  };
}
