"use client";

import CallLeaveDialog from "@/components/user/call-guard/call-leave-dialog";
import { useCallLeaveGuard } from "@/components/user/call-guard/use-call-leave-guard";
import type { VoiceCallContextValue } from "./voice-call-context";
import CallDock from "./call-dock";
import CallModal from "./call-modal";
import ScreenStage from "./screen-stage";

/**
 * Layout picker:
 * - watching a shared screen  → full-window theater (a thumbnail is unreadable)
 * - watching the peer's camera → the same theater; a shared screen still wins
 * - sharing / connected call  → draggable dock, so the app stays usable and the
 *   sharer can actually walk the other person through this site
 * - ringing or failed         → centered modal, which needs an answer
 */
export default function VoiceCallOverlay({ call }: { call: VoiceCallContextValue }) {
  const { view } = call;
  const inCall = view.phase !== "idle" && view.phase !== "failed";
  const leaveGuard = useCallLeaveGuard(inCall, call.hangUp);

  if (view.phase === "idle") return null;

  const live = view.phase === "connected";
  const stage = view.remoteScreen ?? view.remoteCamera;
  const layout = live && stage ? (
    <ScreenStage
      key={stage.id}
      call={call}
      stream={stage}
      kind={view.remoteScreen ? "screen" : "camera"}
      onRequestLeave={leaveGuard.requestLeave}
    />
  ) : live
    || (view.mode === "screen" && view.phase !== "incoming-ringing" && view.phase !== "failed") ? (
      <CallDock call={call} onRequestLeave={leaveGuard.requestLeave} />
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
