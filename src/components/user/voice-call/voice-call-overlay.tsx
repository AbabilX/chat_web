"use client";

import { useState } from "react";
import CallLeaveDialog from "@/components/user/call-guard/call-leave-dialog";
import { useCallLeaveGuard } from "@/components/user/call-guard/use-call-leave-guard";
import type { VoiceCallContextValue } from "./voice-call-context";
import CallDock from "./call-dock";
import CallModal from "./call-modal";
import CallTheater from "./call-theater";

/**
 * Layout picker:
 * - a connected call is full window or the floating dock, and the user moves
 *   between them: Minimise one way, the dock's expand button the other
 * - something new to watch (a shared screen, the peer's camera) opens full
 *   window, even after a minimise; a shared screen still wins over a camera
 * - a plain audio call opens as the dock, so the app stays usable and a sharer
 *   can walk the other person through this site
 * - ringing or failed → centered modal, which needs an answer
 *
 * The choice lives here and not in the theater. It used to be the theater's
 * own state, keyed by the stream, so it went away with the stream: taking over
 * the other person's share ends theirs, and that left a dock with no way back.
 */
export default function VoiceCallOverlay({ call }: { call: VoiceCallContextValue }) {
  const { view } = call;
  const inCall = view.phase !== "idle" && view.phase !== "failed";
  const leaveGuard = useCallLeaveGuard(inCall, call.hangUp);
  const stage = view.remoteScreen ?? view.remoteCamera ?? null;
  const [full, setFull] = useState(false);
  const [seenStage, setSeenStage] = useState<string | null>(null);
  // Adjusted during render, not in an effect, so a new stream never paints
  // one frame in the dock first. A stream leaving keeps the user's choice.
  if ((stage?.id ?? null) !== seenStage) {
    setSeenStage(stage?.id ?? null);
    if (stage) setFull(true);
  }

  if (view.phase === "idle") return null;

  const live = view.phase === "connected";
  const layout = live && full ? (
    <CallTheater
      call={call}
      stream={stage}
      kind={view.remoteScreen ? "screen" : "camera"}
      onMinimize={() => setFull(false)}
      onRequestLeave={leaveGuard.requestLeave}
    />
  ) : live
    || (view.mode === "screen" && view.phase !== "incoming-ringing" && view.phase !== "failed") ? (
      <CallDock
        call={call}
        onExpand={live ? () => setFull(true) : undefined}
        onRequestLeave={leaveGuard.requestLeave}
      />
    ) : (
      <CallModal call={call} onRequestLeave={leaveGuard.requestLeave} />
    );

  return (
    <>
      {layout}
      <CallLeaveDialog
        open={leaveGuard.open}
        reloadAfter={leaveGuard.reloadAfter}
        onStay={leaveGuard.stay}
        onLeave={() => void leaveGuard.confirmLeave()}
      />
    </>
  );
}
