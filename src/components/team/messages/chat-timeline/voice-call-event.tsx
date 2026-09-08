"use client";

import { MonitorUp, Video } from "lucide-react";
import type { ChatMessage } from "@/lib/api/types/chat";

function formatDuration(totalSeconds?: number | null): string | null {
  if (totalSeconds == null || totalSeconds <= 0) return null;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function callNoun(mode?: string) {
  if (mode === "screen") return "screen share";
  if (mode === "video") return "video call";
  return "voice call";
}

export function voiceCallKindLabel(
  message: ChatMessage,
  currentUserId: string,
): string {
  const meta = message.meta;
  const status = meta?.status ?? "";
  const callerId = meta?.caller_id ?? message.user_id;
  const isCaller = Boolean(currentUserId) && currentUserId === callerId;
  const noun = callNoun(meta?.mode);
  const Noun = noun[0].toUpperCase() + noun.slice(1);
  switch (status) {
    case "missed":
      return isCaller ? "No answer" : `Missed ${noun}`;
    case "declined":
      return isCaller ? `${Noun} declined` : `Declined ${noun}`;
    case "cancelled":
      return isCaller ? `Cancelled ${noun}` : `Missed ${noun}`;
    case "failed":
      return `${Noun} failed`;
    case "ended":
      return Noun;
    default:
      return message.body || Noun;
  }
}

export function voiceCallLabel(
  message: ChatMessage,
  currentUserId: string,
): string {
  const kind = voiceCallKindLabel(message, currentUserId);
  if ((message.meta?.status ?? "") !== "ended") return kind;
  const formatted = formatDuration(message.meta?.duration_seconds);
  return formatted ? `${kind} · ${formatted}` : kind;
}

/** Expanded call-history line: Incoming/Outgoing, without duration. */
export function voiceCallHistoryLabel(
  message: ChatMessage,
  currentUserId: string,
): string {
  if ((message.meta?.status ?? "") !== "ended") {
    return voiceCallKindLabel(message, currentUserId);
  }
  const callerId = message.meta?.caller_id ?? message.user_id;
  const isCaller = Boolean(currentUserId) && currentUserId === callerId;
  const noun = callNoun(message.meta?.mode);
  return isCaller ? `Outgoing ${noun}` : `Incoming ${noun}`;
}

export function isMissedStyleVoiceCall(
  message: ChatMessage,
  currentUserId: string,
): boolean {
  const meta = message.meta;
  const status = meta?.status ?? "";
  const callerId = meta?.caller_id ?? message.user_id;
  const isCaller = Boolean(currentUserId) && currentUserId === callerId;
  if (status === "missed" || status === "cancelled") return !isCaller;
  if (status === "declined" || status === "failed") return true;
  return false;
}

function PhoneGlyph({ missed }: { missed: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.4 21 3 13.6 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z"
        fill="currentColor"
        opacity={missed ? 0.95 : 0.85}
      />
      {missed ? (
        <path
          d="M4 4l16 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

export function VoiceCallEventRow({
  message,
  currentUserId,
}: {
  message: ChatMessage;
  currentUserId: string;
}) {
  const missed = isMissedStyleVoiceCall(message, currentUserId);
  const label = voiceCallLabel(message, currentUserId);
  const screen = message.meta?.mode === "screen";
  const video = message.meta?.mode === "video";
  return (
    <div className="flex justify-center py-2">
      <div
        className={`inline-flex max-w-[90%] items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
          missed
            ? "bg-[color-mix(in_srgb,var(--destructive)_12%,transparent)] text-[var(--destructive)]"
            : "bg-muted text-muted-foreground"
        }`}>
        {screen ? <MonitorUp className="size-3.5 shrink-0" /> : video ? <Video className="size-3.5 shrink-0" /> : <PhoneGlyph missed={missed} />}
        <span>{label}</span>
      </div>
    </div>
  );
}
