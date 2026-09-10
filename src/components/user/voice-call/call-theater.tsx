"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { chatInitials } from "@/components/team/messages/chat-utils";
import type { VoiceCallContextValue } from "./voice-call-context";
import ConnectedTime from "./connected-time";
import RemoteScreen from "./remote-screen";
import BalancedVideo from "./balanced-video";
import LocalCameraPreview from "./local-camera-preview";
import CallControls from "./call-controls";

/**
 * Viewer side: the peer's video fills the window. A shared screen is
 * letterboxed (a thumbnail is useless for reading someone else's code); a
 * camera is cropped to fill, but only as far as `videoDisplaySize` allows —
 * filling outright turns a phone's portrait camera into a headless torso in
 * this landscape window. Our own camera rides in the corner. Minimise drops
 * back to the floating dock. With nothing to watch — the peer's share ended,
 * or we took it over — the person stays on the page instead, the way the
 * desktop call window does, so full window is never a dead end.
 */
export default function CallTheater({
  call,
  stream,
  kind,
  onMinimize,
  onRequestLeave,
}: {
  call: VoiceCallContextValue;
  stream: MediaStream | null;
  kind: "screen" | "camera";
  onMinimize: () => void;
  onRequestLeave?: () => void;
}) {
  const { view } = call;
  const title = !stream
    ? (view.peerName || "Call")
    : kind === "screen"
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
        {!stream ? (
          <div className="flex h-full w-full items-center justify-center">
            <Avatar className="h-28 w-28">
              <AvatarImage src={view.peerAvatar} alt="" />
              <AvatarFallback className="text-3xl">{chatInitials(view.peerName || "Call")}</AvatarFallback>
            </Avatar>
          </div>
        ) : kind === "screen" ? (
          <RemoteScreen stream={stream} className="h-full w-full bg-black object-contain" />
        ) : (
          <BalancedVideo stream={stream} className="h-full w-full" />
        )}
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
          {view.screenSharing ? (
            <p className="text-xs font-medium text-[var(--green)]">You are sharing your screen</p>
          ) : null}
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
