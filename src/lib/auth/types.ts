export type UserRole = "viewer" | "editor" | "publisher";

export type SessionUser = {
  email: string;
  role: UserRole;
};

export type SessionPayload = SessionUser & {
  expiresAt: number;
};
