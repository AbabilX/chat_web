import { SparklesIcon } from "hugeicons-react";
import LoginActions from "./login-actions";
import { LOGIN_COPY } from "./login-copy";

export default function LoginHero() {
  return (
    <div className="relative z-10 w-full text-left">
      <span
        className="mb-[clamp(1rem,2.5vw,1.5rem)] inline-flex items-center gap-1.5 rounded-full border border-[#6D4AFF]/20 bg-[#6D4AFF]/[0.07] px-[clamp(0.75rem,1.5vw,0.875rem)] py-[clamp(0.25rem,0.8vw,0.375rem)] text-[clamp(11px,1.05vw,13px)] font-medium tracking-tight"
        style={{ color: "#6D4AFF" }}
      >
        <SparklesIcon size={14} aria-hidden="true" className="shrink-0" />
        {LOGIN_COPY.badge}
      </span>

      <h1
        id="hero-heading"
        className="mb-[clamp(1.25rem,3vw,2rem)] text-[clamp(1.65rem,4.2vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[#0F172A]"
      >
        {LOGIN_COPY.headline}
        <br />
        <span className="text-[#6D4AFF]">{LOGIN_COPY.headlineAccent}</span>
      </h1>

      <LoginActions />
    </div>
  );
}
