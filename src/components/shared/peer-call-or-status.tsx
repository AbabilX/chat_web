"use client";

import { useInCallPresenceStore } from "@/store/in-call-presence-store";
import { useUserStatusStore } from "@/store/user-status-store";
import InCallLabel from "./in-call-label";
import UserStatusBadge from "./user-status-badge";

/** Prefer in-call over custom status for a peer (Slack-style priority). */
export default function PeerCallOrStatus({
  userId,
  compact = false,
}: {
  userId?: string | null;
  compact?: boolean;
}) {
  const inCall = useInCallPresenceStore((s) =>
    userId ? s.inCallUserIds.has(userId) : false,
  );
  const status = useUserStatusStore((s) => s.statusFor(userId));

  if (!userId) return null;
  if (inCall) return <InCallLabel compact={compact} />;
  if (status) return <UserStatusBadge status={status} compact={compact} />;
  return null;
}
