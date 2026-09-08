"use client";

import { LockIcon } from "hugeicons-react";
import { SEAT_PENDING_COPY } from "@/constant/team-billing";
import { useTeamContext } from "./team-provider";
import LeaveTeamSection from "./leave-team-section";

export default function SeatPendingScreen() {
  const { detail } = useTeamContext();
  const teamName = detail?.team?.name ?? "this team";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
        <LockIcon size={28} />
      </span>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-[var(--text)]">
          {SEAT_PENDING_COPY.title}
        </h1>
        <p className="text-sm text-muted-foreground">{SEAT_PENDING_COPY.body}</p>
        <p className="text-xs text-muted-foreground">{SEAT_PENDING_COPY.leaveHint}</p>
      </div>
      <LeaveTeamSection teamName={teamName} />
    </div>
  );
}
