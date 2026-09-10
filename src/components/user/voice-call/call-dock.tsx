"use client";

import { GripVertical, Maximize2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { chatInitials } from "@/components/team/messages/chat-utils";
import type { VoiceCallContextValue } from "./voice-call-context";
import { callKindTitle, callPhaseLabel } from "./voice-call-helpers";
import { useDragPosition } from "./use-drag-position";
import ConnectedTime from "./connected-time";
import LocalCameraPreview from "./local-camera-preview";
import CallControls from "./call-controls";

/**
 * Floating, draggable panel used while *you* are the one sharing (or on a plain
 * audio call). It must never cover the app: the whole point of sharing is to
 * walk someone through the page underneath.
 */
export default function CallDock({
  call,
  onExpand,
  onRequestLeave,
}: {
  call: VoiceCallContextValue;
  onExpand?: () => void;
  onRequestLeave?: () => void;
}) {
  const { view } = call;
  const { nodeRef, style, dragging, handleProps } = useDragPosition();

  return (
    <div
      ref={nodeRef}
      style={style}
      className={`fixed z-[100] w-[19rem] max-w-[calc(100vw-1.5rem)] select-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl backdrop-blur ${
        dragging ? "cursor-grabbing" : ""
      }`}
      role="region"
      aria-label={callKindTitle(view)}
    >
      <div
        // touch-none keeps a finger drag from scrolling the page underneath.
        className={`flex touch-none items-center gap-2 px-3 pt-3 ${dragging ? "" : "cursor-grab"}`}
        {...handleProps}
      >
        <GripVertical className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={view.peerAvatar} alt={view.peerName} />
          <AvatarFallback className="text-xs">{chatInitials(view.peerName || "Call")}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold">{view.peerName || "Call"}</p>
          <p className="truncate text-xs text-[var(--text-muted)]">
            {view.phase === "connected" ? <ConnectedTime since={view.connectedAt} /> : callPhaseLabel(view)}
          </p>
        </div>
        {onExpand ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0 rounded-full"
            onClick={onExpand}
            aria-label="Full window"
            title="Full window"
          >
            <Maximize2 className="size-4" />
          </Button>
        ) : null}
      </div>

      {view.screenSharing ? (
        <p className="px-3 pt-2 text-xs font-medium text-[var(--green)]">
          You are sharing your screen{view.mode === "screen" ? " — no microphone is used" : ""}
        </p>
      ) : null}
      {view.microphoneUnavailable ? (
        <p className="px-3 pt-2 text-xs text-amber-500 [data-theme=light]:text-amber-700">
          Listening only — no microphone was detected.
        </p>
      ) : null}
      {view.cameraError ? (
        <p className="px-3 pt-2 text-xs text-amber-500 [data-theme=light]:text-amber-700">{view.cameraError}</p>
      ) : null}
      {view.localCamera ? (
        <div className="px-3 pt-2">
          <LocalCameraPreview stream={view.localCamera} className="aspect-video w-full" />
        </div>
      ) : null}
      {view.screenError ? (
        <p className="px-3 pt-2 text-xs text-red-400 [data-theme=light]:text-red-600">{view.screenError}</p>
      ) : null}

      <div className="flex items-center justify-center gap-3 px-3 py-3">
        <CallControls call={call} compact onRequestLeave={onRequestLeave} />
      </div>
    </div>
  );
}
