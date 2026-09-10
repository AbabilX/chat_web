"use client";

import { usePathname } from "next/navigation";
import type { AppUser } from "@/lib/api";
import { useUIStore } from "@/store/ui-store";
import RailNav from "./rail-nav";

/** Desktop-style left icon rail. Chat-only — this app has no Board/Wall. */
export default function AppModeRail({ user }: { user: AppUser | null }) {
  const pathname = usePathname();
  const railCollapsed = useUIStore((s) => s.railCollapsed);

  if (!pathname.startsWith("/user")) return null;
  if (railCollapsed) return null;

  return (
    <aside
      className="fixed left-0 top-0 z-[60] hidden h-full w-12 flex-col border-r lg:flex"
      style={{ background: "var(--sig-bg)", borderColor: "var(--sig-border)" }}
      aria-label="Navigation"
    >
      <RailNav user={user} />
    </aside>
  );
}
