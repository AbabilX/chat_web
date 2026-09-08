import type { ReactNode } from "react";

export default function ProfileContact({
  icon,
  value,
  label,
  href,
}: {
  icon: ReactNode;
  value: string;
  label: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm text-[var(--text)]">{value}</span>
        <span className="block text-xs text-muted-foreground">{label}</span>
      </span>
    </>
  );

  const className =
    "flex w-full items-start gap-3 rounded-lg px-1 py-2 text-left";

  if (href) {
    return (
      <a href={href} className={`${className} hover:bg-white/[0.04]`}>
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}
