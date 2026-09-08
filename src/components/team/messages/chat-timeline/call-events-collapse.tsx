"use client";

import { useEffect, useId, useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronDown, Headphones, MonitorUp, Phone, Video } from "lucide-react";
import type { ChatMessage } from "@/lib/api/types/chat";
import {
  isMissedStyleVoiceCall,
  voiceCallHistoryLabel,
} from "./voice-call-event";

export function CallEventsCollapse({
  messages,
  currentUserId,
  highlightMessageId,
}: {
  messages: ChatMessage[];
  currentUserId: string;
  highlightMessageId?: string | null;
}) {
  const disclosureId = useId();
  const containsHighlight =
    !!highlightMessageId && messages.some((m) => m.id === highlightMessageId);
  const [expanded, setExpanded] = useState(containsHighlight);

  useEffect(() => {
    if (containsHighlight) setExpanded(true);
  }, [containsHighlight]);

  const count = messages.length;

  return (
    <div className="flex flex-col items-center py-1">
      <div className="relative">
        {!expanded
          ? messages.map((message) => (
              <div
                key={message.id}
                id={`chat-msg-${message.id}`}
                className="pointer-events-none absolute inset-0"
              />
            ))
          : null}
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={expanded ? disclosureId : undefined}
          onClick={() => setExpanded((open) => !open)}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--surface2)] px-3 py-1 text-[13px] font-medium text-[var(--text)]"
        >
          <Phone className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
          {count} call events
          <ChevronDown
            className={`size-3.5 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
            strokeWidth={2}
            aria-hidden
          />
        </button>
      </div>
      {expanded ? (
        <ul id={disclosureId} className="mt-1.5 flex flex-col items-start gap-1.5 py-1">
          {messages.map((message) => (
            <li
              key={message.id}
              id={`chat-msg-${message.id}`}
              className={
                highlightMessageId === message.id
                  ? "rounded-md ring-2 ring-[var(--indigo)]"
                  : undefined
              }
            >
              <CallEventLine message={message} currentUserId={currentUserId} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function CallEventLine({
  message,
  currentUserId,
}: {
  message: ChatMessage;
  currentUserId: string;
}) {
  const time = format(parseISO(message.created_at), "h:mm a");
  if (message.message_type === "group_call") {
    return (
      <p className="inline-flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
        <Headphones className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        <span>Group call ended · {time}</span>
      </p>
    );
  }
  const missed = isMissedStyleVoiceCall(message, currentUserId);
  const screen = message.meta?.mode === "screen";
  const video = message.meta?.mode === "video";
  return (
    <p
      className={`inline-flex items-center gap-2 text-[13px] ${
        missed ? "text-[var(--destructive)]" : "text-[var(--text-muted)]"
      }`}
    >
      {screen ? (
        <MonitorUp className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
      ) : video ? (
        <Video className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
      ) : (
        <Phone className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
      )}
      <span>
        {voiceCallHistoryLabel(message, currentUserId)} · {time}
      </span>
    </p>
  );
}
