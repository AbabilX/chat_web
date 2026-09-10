"use client";

import type { AppUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import AppModeRail from "@/components/sidebar/app-mode-rail";
import { useUIStore } from "@/store/ui-store";

export default function ShellFrame({
  user,
  children,
}: {
  user: AppUser | null;
  children: React.ReactNode;
}) {
  const railCollapsed = useUIStore((s) => s.railCollapsed);

  return (
    <div
      className="relative flex min-h-screen overflow-hidden"
      style={{ background: "var(--sig-bg)" }}
    >
      <AppModeRail user={user} />
      <div
        className={cn(
          "relative min-h-0 min-w-0 flex-1 overflow-x-hidden",
          railCollapsed ? "lg:ml-0" : "lg:ml-12",
        )}
      >
        <div className="h-full min-h-0 w-full max-w-none p-0">{children}</div>
      </div>
    </div>
  );
}
