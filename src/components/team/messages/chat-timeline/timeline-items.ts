import type { ChatMessage } from "@/lib/api";
import {
  chatMessageActivityAt,
  chatMessageDateKey,
  chatMessageDateLabel,
} from "../chat-utils";
import { sameGroup } from "./chat-bubble/bubble-shape";

export type TimelineItem =
  | { kind: "divider"; key: string; label: string }
  | {
      kind: "message";
      key: string;
      message: ChatMessage;
      groupedAbove: boolean;
      groupedBelow: boolean;
    }
  | {
      kind: "call-events";
      key: string;
      messages: ChatMessage[];
    };

export function isCallTimelineEvent(message: ChatMessage): boolean {
  return message.message_type === "voice_call" || message.message_type === "group_call";
}

export function buildTimelineItems(messages: ChatMessage[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  let lastDateKey = "";

  messages.forEach((message, index) => {
    const activityAt = chatMessageActivityAt(message);
    const dateKey = chatMessageDateKey(activityAt);
    const startsDay = dateKey !== lastDateKey;
    if (startsDay) {
      items.push({
        kind: "divider",
        key: `date-${dateKey}`,
        label: chatMessageDateLabel(activityAt),
      });
      lastDateKey = dateKey;
    }

    const previous = index > 0 ? messages[index - 1] : null;
    const next = index + 1 < messages.length ? messages[index + 1] : null;
    const nextStartsDay =
      !!next && chatMessageDateKey(chatMessageActivityAt(next)) !== dateKey;

    items.push({
      kind: "message",
      key: message.id,
      message,
      groupedAbove: !startsDay && sameGroup(previous, message),
      groupedBelow: !nextStartsDay && sameGroup(message, next),
    });
  });

  return collapseConsecutiveCallEvents(items);
}

function collapseConsecutiveCallEvents(items: TimelineItem[]): TimelineItem[] {
  const collapsed: TimelineItem[] = [];
  let index = 0;
  while (index < items.length) {
    const item = items[index];
    if (item.kind !== "message" || !isCallTimelineEvent(item.message)) {
      collapsed.push(item);
      index += 1;
      continue;
    }
    const run: ChatMessage[] = [item.message];
    let lookAhead = index + 1;
    while (lookAhead < items.length) {
      const next = items[lookAhead];
      if (next.kind !== "message" || !isCallTimelineEvent(next.message)) break;
      run.push(next.message);
      lookAhead += 1;
    }
    if (run.length >= 2) {
      collapsed.push({
        kind: "call-events",
        key: `call-events-${run[0].id}`,
        messages: run,
      });
    } else {
      collapsed.push(item);
    }
    index = lookAhead;
  }
  return collapsed;
}
