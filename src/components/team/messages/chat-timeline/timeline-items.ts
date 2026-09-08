import type { ChatMessage } from "@/lib/api";
import {
  chatMessageActivityAt,
  chatMessageDateKey,
  chatMessageDateLabel,
} from "../chat-utils";

export type TimelineItem =
  | { kind: "divider"; key: string; label: string }
  | { kind: "message"; key: string; message: ChatMessage }
  | { kind: "call-events"; key: string; messages: ChatMessage[] };

export function isCallTimelineEvent(message: ChatMessage): boolean {
  return message.message_type === "voice_call" || message.message_type === "group_call";
}

export function buildTimelineItems(messages: ChatMessage[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  let previousDate = "";
  for (const message of messages) {
    const activityAt = chatMessageActivityAt(message);
    const date = chatMessageDateKey(activityAt);
    if (date !== previousDate) {
      items.push({
        kind: "divider",
        key: `date-${date}`,
        label: chatMessageDateLabel(activityAt),
      });
      previousDate = date;
    }
    items.push({ kind: "message", key: message.id, message });
  }
  return collapseConsecutiveCallEvents(items);
}

/** Same-day consecutive call rows collapse into one disclosure. A date
 *  divider already splits days, so this only joins adjacent call messages. */
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
