import LoginHero from "./login-hero";

export default function LoginHeroSection() {
  return (
    <section
      id="hero"
      className="landing-hero relative h-svh min-h-[640px] w-full overflow-hidden bg-[#FAFAFF] md:aspect-[1672/941] md:h-auto md:min-h-0"
      aria-labelledby="hero-heading"
    >
      <div className="landing-hero-art pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex h-full w-11/12 max-w-7xl items-start px-6 pt-24 pb-16">
        <LoginHero />
      </div>
    </section>
  );
}
