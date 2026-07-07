import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";

export async function AppHeader() {
  const user = await getCurrentUser();
  const canOpenStudio = user?.role === "editor" || user?.role === "publisher";

  return (
    <header className="app-header">
      <Link className="app-brand" href="/">
        Page Studio
      </Link>
      <nav aria-label="Primary navigation" className="app-nav">
        <Link href="/preview/home">Preview</Link>
        {canOpenStudio ? <Link href="/studio/home">Studio</Link> : null}
        {user ? (
          <>
            <span className="user-pill" title={user.email}>
              {user.email} · {user.role}
            </span>
            <Link href="/logout">Logout</Link>
          </>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
