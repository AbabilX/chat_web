import { format, formatDistanceToNow, isToday, parseISO, differenceInCalendarDays } from "date-fns";

export function chatInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function chatRelativeTime(iso: string) {
  const when = parseISO(iso);
  const diffMs = Date.now() - when.getTime();
  if (diffMs < 60_000) return "Just now";
  if (isToday(when)) return formatDistanceToNow(when, { addSuffix: true });
  return format(when, "MMM d · h:mm a");
}

export function chatShortTime(iso: string) {
  const when = parseISO(iso);
  if (isToday(when)) return format(when, "h:mm a");
  return format(when, "MMM d");
}

/** Slack-style date pill in message timeline */
export function chatMessageDateLabel(iso: string): string {
  const when = parseISO(iso);
  const now = new Date();
  const diffDays = differenceInCalendarDays(now, when);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (when.getFullYear() === now.getFullYear()) {
    return format(when, "EEEE, d MMMM");
  }
  return format(when, "EEEE, d MMMM yyyy");
}

export function chatMessageDateKey(iso: string): string {
  return format(parseISO(iso), "yyyy-MM-dd");
}

/** Sort / date-divider key: latest reply activity when present. */
export function chatMessageActivityAt(message: {
  created_at: string;
  last_activity_at?: string;
}): string {
  return message.last_activity_at || message.created_at;
}

/** Slack-style list timestamp: Friday, 14 June, Yesterday, etc. */
export function chatListTime(iso?: string | null) {
  if (!iso) return "";
  const when = parseISO(iso);
  const now = new Date();
  const diffDays = differenceInCalendarDays(now, when);
  if (diffDays === 0) return format(when, "h:mm a");
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return format(when, "EEEE");
  if (when.getFullYear() === now.getFullYear()) return format(when, "d MMMM");
  return format(when, "d MMMM yyyy");
}

export function truncatePreviewText(text: string, max = 90) {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max)}…`;
}

export function chatConvLabel(conv: {
  type: string;
  name?: string;
  slug?: string;
  peer_user_name?: string;
}) {
  if (conv.type !== "dm") {
    return conv.name || conv.slug || "Group";
  }
  return conv.peer_user_name || conv.name || "Direct message";
}

export function chatConvPrefix(conv: { type: string; slug?: string }) {
  if (conv.type === "channel") return `#${conv.slug || "channel"}`;
  return "";
}
