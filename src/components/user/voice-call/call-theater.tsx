"use client";

import type { VoiceCallContextValue } from "./voice-call-context";
import ConnectedTime from "./connected-time";
import RemoteScreen from "./remote-screen";
import LocalCameraPreview from "./local-camera-preview";
import CallControls from "./call-controls";

/**
 * Viewer side: the peer's video fills the window. A shared screen is
 * letterboxed (a thumbnail is useless for reading someone else's code); a
 * camera is cropped to fill, which is what a face wants. Our own camera rides
 * in the corner. Minimise drops back to the floating dock.
 */
export default function CallTheater({
  call,
  stream,
  kind,
  onMinimize,
  onRequestLeave,
}: {
  call: VoiceCallContextValue;
  stream: MediaStream;
  kind: "screen" | "camera";
  onMinimize: () => void;
  onRequestLeave?: () => void;
}) {
  const { view } = call;
  const title = kind === "screen"
    ? (view.peerName ? `${view.peerName} is sharing their screen` : "Shared screen")
    : (view.peerName || "Video call");

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg)] p-3 text-[var(--text)] sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <section className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface2)] shadow-2xl">
        <RemoteScreen
          stream={stream}
          className={`h-full w-full bg-black ${kind === "screen" ? "object-contain" : "object-cover"}`}
        />
        {view.localCamera ? (
          <LocalCameraPreview
            stream={view.localCamera}
            className="absolute right-3 top-3 aspect-[3/4] w-28 sm:w-36"
          />
        ) : null}
      </section>

      <footer className="mt-3 flex flex-col gap-2 sm:relative sm:min-h-11 sm:flex-row sm:items-center">
        <div className="min-w-0 sm:absolute sm:left-0 sm:max-w-[min(100%,18rem)] sm:pr-2 lg:max-w-[36%]">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="text-xs text-[var(--text-muted)]">
            <ConnectedTime since={view.connectedAt} />
          </p>
          {view.cameraError ? (
            <p className="text-xs text-amber-500 [data-theme=light]:text-amber-700">{view.cameraError}</p>
          ) : null}
        </div>
        <div className="mx-auto">
          <CallControls
            call={call}
            onMinimize={onMinimize}
            onRequestLeave={onRequestLeave}
          />
        </div>
      </footer>
    </div>
  );
}
