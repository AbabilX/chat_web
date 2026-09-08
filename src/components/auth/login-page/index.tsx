import LoginHeroSection from "./login-hero-section";
import LoginNavbar from "./login-navbar";
import LoginRedirect from "./login-redirect";
import LoginTheme from "./login-theme";

export default function LoginPage() {
  return (
    <LoginRedirect>
      <LoginTheme>
        <div
          data-theme="light"
          className="landing-page min-h-screen overflow-x-hidden text-[var(--text)]"
          style={{ background: "var(--bg)", colorScheme: "light" }}
        >
          <LoginNavbar />
          <main id="main-content">
            <LoginHeroSection />
          </main>
        </div>
      </LoginTheme>
    </LoginRedirect>
  );
}
