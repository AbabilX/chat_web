"use client";

import { useState } from "react";
import type { VoiceCallContextValue } from "./voice-call-context";
import CallDock from "./call-dock";
import CallTheater from "./call-theater";

/**
 * Full-window viewer with a minimise escape hatch. Mounted keyed by stream id,
 * so a later share always opens full screen instead of inheriting the last
 * session's minimised state. Serves both a shared screen and a camera.
 */
export default function ScreenStage({
  call,
  stream,
  kind,
  onRequestLeave,
}: {
  call: VoiceCallContextValue;
  stream: MediaStream;
  kind: "screen" | "camera";
  onRequestLeave?: () => void;
}) {
  const [minimized, setMinimized] = useState(false);
  return minimized ? (
    <CallDock call={call} onExpand={() => setMinimized(false)} onRequestLeave={onRequestLeave} />
  ) : (
    <CallTheater
      call={call}
      stream={stream}
      kind={kind}
      onMinimize={() => setMinimized(true)}
      onRequestLeave={onRequestLeave}
    />
  );
}
