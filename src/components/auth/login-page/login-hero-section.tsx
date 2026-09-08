import LoginHero from "./login-hero";
import LoginQrPanel from "./login-qr-panel";

export default function LoginHeroSection() {
  return (
    <section
      id="hero"
      className="landing-hero relative h-svh min-h-[640px] w-full overflow-hidden bg-[#FAFAFF] md:aspect-[1672/941] md:h-auto md:min-h-0"
      aria-labelledby="hero-heading"
    >
      <div className="landing-hero-art pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex h-full w-11/12 max-w-7xl flex-col items-start justify-center gap-10 px-6 pt-14 pb-16 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:w-[45%] lg:shrink-0">
          <LoginHero />
        </div>
        <div className="relative z-10 w-full lg:w-auto">
          <LoginQrPanel />
        </div>
      </div>
    </section>
  );
}
