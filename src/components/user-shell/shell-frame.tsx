"use client";

import type { AppUser } from "@/lib/api";
import MobileTopBar from "./mobile-top-bar";

export default function ShellFrame({
  user,
  children,
}: {
  user: AppUser | null;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-screen overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <MobileTopBar user={user} />
      <div className="relative min-w-0 flex-1 overflow-x-hidden pt-14 lg:ml-0 lg:pt-0">
        <div className="h-full min-h-0 w-full max-w-none p-0">{children}</div>
      </div>
    </div>
  );
}
