"use client";

import { GripVertical, Maximize2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDragPosition } from "@/components/user/voice-call/use-drag-position";
import type { GroupCallContextValue } from "./group-call-context";
import GroupCallControls from "./group-call-controls";

export default function GroupCallDock({
  call,
  onExpand,
  onRequestLeave,
}: {
  call: GroupCallContextValue;
  onExpand: () => void;
  onRequestLeave?: () => void;
}) {
  const { view } = call;
  const { nodeRef, style, dragging, handleProps } = useDragPosition();
  const title = view.call?.conversation_name || "Group call";

  return (
    <div
      ref={nodeRef}
      style={style}
      className={`fixed z-[100] w-[19rem] max-w-[calc(100vw-1.5rem)] select-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-2xl backdrop-blur ${
        dragging ? "cursor-grabbing" : ""
      }`}
      role="region"
      aria-label="Group call"
    >
      <div
        className={`flex touch-none items-center gap-2 px-3 pt-3 ${dragging ? "" : "cursor-grab"}`}
        {...handleProps}
      >
        <GripVertical className="size-4 shrink-0 text-[var(--text-muted)]" aria-hidden />
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="flex items-center gap-1 truncate text-xs text-[var(--text-muted)]">
            <Users className="h-3 w-3 shrink-0" />
            {view.phase === "joining"
              ? "Joining…"
              : `${view.participants.length} in call`}
          </p>
        </div>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0 rounded-full"
          onClick={onExpand}
          aria-label="Expand group call"
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>

      {view.sharingScreen ? (
        <p className="px-3 pt-2 text-xs font-medium text-[var(--green)]">You are sharing your screen</p>
      ) : view.screen ? (
        <p className="px-3 pt-2 text-xs text-[var(--text-muted)]">
          {view.screen.participantName} is sharing
        </p>
      ) : null}

      {view.audioBlocked ? (
        <button
          type="button"
          className="mx-3 mt-2 w-[calc(100%-1.5rem)] rounded-full bg-amber-500 px-3 py-1.5 text-xs font-medium text-white"
          onClick={() => void call.enableAudio()}
        >
          Enable call audio
        </button>
      ) : null}

      {view.phase === "connected" ? (
        <div className="px-3 py-3">
          <GroupCallControls call={call} compact onRequestLeave={onRequestLeave} />
        </div>
      ) : (
        <div className="h-3" />
      )}
    </div>
  );
}
