"use client";

import { VolumeX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { chatInitials } from "@/components/team/messages/chat-utils";
import { retryRingtone } from "@/lib/calls/ringtone";
import { useRingtoneBlocked } from "@/lib/calls/use-call-ringtone";
import type { VoiceCallContextValue } from "./voice-call-context";
import { callKindTitle, callPhaseLabel } from "./voice-call-helpers";
import LocalCameraPreview from "./local-camera-preview";
import CallControls from "./call-controls";

/** Centered card for states that demand an answer: ringing, and failures. */
export default function CallModal({
  call,
  onRequestLeave,
}: {
  call: VoiceCallContextValue;
  onRequestLeave?: () => void;
}) {
  const { view } = call;
  const soundBlocked = useRingtoneBlocked() && view.phase === "incoming-ringing";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={callKindTitle(view)}
    >
      <div className="w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-8 text-center text-[var(--text)] shadow-2xl">
        <Avatar className="mx-auto h-24 w-24 ring-4 ring-[var(--indigo-glow)]">
          <AvatarImage src={view.peerAvatar} alt={view.peerName} />
          <AvatarFallback className="text-2xl">{chatInitials(view.peerName || "Call")}</AvatarFallback>
        </Avatar>
        <h2 className="mt-5 truncate text-xl font-semibold">
          {view.peerName || callKindTitle(view)}
        </h2>
        <p className="mt-2 min-h-5 text-sm text-[var(--text-muted)]">{callPhaseLabel(view)}</p>
        {view.microphoneUnavailable ? (
          <p className="mt-3 text-xs text-amber-500 [data-theme=light]:text-amber-700">
            Listening only — no microphone was detected.
          </p>
        ) : null}
        {view.cameraError ? (
          <p className="mt-3 text-xs text-amber-500 [data-theme=light]:text-amber-700">{view.cameraError}</p>
        ) : null}
        {view.screenError ? (
          <p className="mt-3 text-xs text-red-400 [data-theme=light]:text-red-600">{view.screenError}</p>
        ) : null}
        {view.localCamera ? (
          <LocalCameraPreview stream={view.localCamera} className="mx-auto mt-4 aspect-video w-48" />
        ) : null}
        {soundBlocked ? (
          <button
            type="button"
            onClick={retryRingtone}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-500 hover:bg-amber-500/25 [data-theme=light]:text-amber-700"
          >
            <VolumeX className="h-3.5 w-3.5" /> Sound is off — tap to enable
          </button>
        ) : null}

        <div className="mt-8 flex items-center justify-center gap-5">
          <CallControls call={call} onRequestLeave={onRequestLeave} />
        </div>
      </div>
    </div>
  );
}
