"use client";

import { cn } from "@/lib/utils";
import { ONLINE_TTL_MS, usePresenceStore } from "@/store/presence-store";

type Props = {
  userId?: string | null;
  className?: string;
  /** Dot size classes; default fits h-8/h-9 avatars. */
  dotClassName?: string;
  children: React.ReactNode;
};

/** Wraps an Avatar and shows a green online badge when the user is present. */
export default function PresenceAvatar({
  userId,
  className,
  dotClassName,
  children,
}: Props) {
  const online = usePresenceStore((s) => {
    if (!userId) return false;
    const at = s.lastSeenByUserId[userId];
    if (!at) return false;
    return Date.now() - at < ONLINE_TTL_MS;
  });

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {children}
      {online ? (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-(--surface)",
            dotClassName,
          )}
          aria-label="Online"
        />
      ) : null}
    </span>
  );
}
