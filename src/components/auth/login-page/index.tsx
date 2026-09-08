import LoginActions from "./login-actions";
import LoginHero from "./login-hero";
import LoginRedirect from "./login-redirect";

export default function LoginPage() {
  return (
    <LoginRedirect>
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
        <LoginHero />
        <LoginActions />
      </main>
    </LoginRedirect>
  );
}
