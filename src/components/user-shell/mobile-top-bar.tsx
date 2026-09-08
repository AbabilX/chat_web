"use client";

import Image from "next/image";
import type { AppUser } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function MobileTopBar({ user }: { user: AppUser | null }) {
  return (
    <div
      className="lg:hidden fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between gap-2 border-b px-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="AbabilX Chat"
          width={24}
          height={24}
          className="object-contain shrink-0"
        />
        <span className="text-sm font-semibold text-[var(--text)]">Chat</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={user.avatar_url} alt={user.name || user.email} />
            <AvatarFallback className="text-[10px]">
              {(user.name || user.email || "?")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </div>
  );
}
