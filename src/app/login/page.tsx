import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, redirectTo } = await searchParams;

  return (
    <main className="page-shell auth-page">
      <section className="section">
        <div className="section-inner auth-layout">
          <div>
            <p className="eyebrow">Page Studio</p>
            <h1>Sign in</h1>
            <p>
              Demo users: viewer@test.com, editor@test.com,
              publisher@test.com. Password: password.
            </p>
          </div>
          <LoginForm error={error} redirectTo={redirectTo || "/preview/home"} />
        </div>
      </section>
    </main>
  );
}
