"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import CallLeaveDialog from "@/components/user/call-guard/call-leave-dialog";
import { useCallLeaveGuard } from "@/components/user/call-guard/use-call-leave-guard";
import type { GroupCallContextValue } from "./group-call-context";
import GroupCallControls from "./group-call-controls";
import GroupCallDock from "./group-call-dock";
import GroupCallInvite from "./group-call-invite";
import GroupCallParticipantGrid from "./group-call-participant-grid";
import GroupCallScreenStage from "./group-call-screen-stage";

export default function GroupCallOverlay({ call }: { call: GroupCallContextValue }) {
  const { view, invite } = call;
  // A ringing invite outlives the idle phase — answering it is what ends idle.
  const ringing = invite ? (
    <GroupCallInvite
      call={invite}
      onJoin={call.acceptInvite}
      onDecline={call.declineInvite}
    />
  ) : null;
  if (view.phase === "idle" || view.phase === "failed") return ringing;
  return (
    <>
      {ringing}
      <GroupCallSession call={call} />
    </>
  );
}

function GroupCallSession({ call }: { call: GroupCallContextValue }) {
  const { view } = call;
  const [minimized, setMinimized] = useState(false);
  const inCall = view.phase === "joining" || view.phase === "connected";
  const leaveGuard = useCallLeaveGuard(inCall, call.leave);

  return (
    <>
      {minimized ? (
        <GroupCallDock
          call={call}
          onExpand={() => setMinimized(false)}
          onRequestLeave={leaveGuard.requestLeave}
        />
      ) : (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg)] p-3 text-[var(--text)] sm:p-5">
          {view.audioBlocked ? (
            <button
              type="button"
              className="mx-auto mb-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white"
              onClick={() => void call.enableAudio()}
            >
              Enable call audio
            </button>
          ) : null}

          {view.phase === "joining" ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
              <LoaderCircle className="h-8 w-8 animate-spin" />
              <p>Joining group call…</p>
            </div>
          ) : (
            <main className="flex min-h-0 w-full flex-1 flex-col gap-3 lg:flex-row">
              {view.screen ? (
                <>
                  <GroupCallScreenStage screen={view.screen} />
                  <div className="h-32 shrink-0 lg:h-auto lg:w-60">
                    <GroupCallParticipantGrid participants={view.participants} compact />
                  </div>
                </>
              ) : (
                <GroupCallParticipantGrid participants={view.participants} />
              )}
            </main>
          )}

          <footer className="shrink-0 pt-3">
            <GroupCallControls
              call={call}
              onMinimize={() => setMinimized(true)}
              onRequestLeave={leaveGuard.requestLeave}
            />
          </footer>
        </div>
      )}
      <CallLeaveDialog
        open={leaveGuard.open}
        reloadAfter={leaveGuard.reloadAfter}
        onStay={leaveGuard.stay}
        onLeave={() => void leaveGuard.confirmLeave()}
      />
    </>
  );
}
