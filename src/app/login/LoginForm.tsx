import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginFormProps = {
  error?: string;
  redirectTo: string;
};

export function LoginForm({ error, redirectTo }: LoginFormProps) {
  return (
    <form action="/api/login" className="auth-form" method="post" noValidate>
      <input name="redirectTo" type="hidden" value={redirectTo} />
      <div className="field-group">
        <label htmlFor="email">Email</label>
        <Input
          autoComplete="email"
          defaultValue="editor@test.com"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>
      <div className="field-group">
        <label htmlFor="password">Password</label>
        <Input
          autoComplete="current-password"
          defaultValue="password"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>
      {error ? (
        <p className="form-error" id="login-error" role="alert">
          Use one of the demo users and the password from the brief.
        </p>
      ) : null}
      <Button type="submit">Sign in</Button>
    </form>
  );
}
