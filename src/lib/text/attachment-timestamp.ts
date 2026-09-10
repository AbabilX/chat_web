import {
  differenceInMilliseconds,
  format,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const WEEK = 7 * 24 * HOUR;
const SIX_MONTHS = 182 * 24 * HOUR;

export function formatAttachmentTimestamp(value: string | number | Date): string {
  const when = typeof value === "string" ? parseISO(value) : new Date(value);
  if (Number.isNaN(when.valueOf())) return "";

  const now = new Date();
  const diff = differenceInMilliseconds(now, when);

  if (diff >= 0 && diff < MINUTE) return "Now";
  if (diff < HOUR || isToday(when)) return format(when, "h:mm a");
  if (diff < WEEK && isSameMonth(when, now)) return format(when, "EEE h:mm a");
  if (Math.abs(diff) < SIX_MONTHS) return format(when, "MMM d, h:mm a");
  return format(when, "MMM d, yyyy, h:mm a");
}
