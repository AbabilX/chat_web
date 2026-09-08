// Free-plan workspace GROUP CALL minutes copy.
//
// A free workspace gets a monthly pool of channel group-call minutes (backend:
// plan.FreeTeamCallMinutesPerMonth); premium has no limit. A minute is a ROOM
// minute — the wall-clock length of the call, whatever the headcount.
//
// DM 1:1 calls are peer-to-peer and are never metered, on any plan. Running out
// blocks NEW calls only: a call already running finishes normally and other
// members can still join it.

/**
 * Fallback for static copy only. Live values always come from the API
 * (`TeamDetail.call_quota`), so the backend stays the source of truth.
 */
export const FREE_CALL_MINUTES_PER_MONTH = 300;

/** Show the warning strip once a workspace is this close to the cap. */
export const CALL_QUOTA_WARN_RATIO = 0.8;

export function formatCallResetDate(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function minuteLabel(minutes: number): string {
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}

export const TEAM_CALL_QUOTA_COPY = {
  noticeTitle: "Free plan group call minutes",
  noticeTitleExhausted: "Group call minutes used up",

  usage: (used: number, limit: number) => `${used} of ${limit} minutes used`,
  resets: (dateLabel: string) =>
    dateLabel ? `Resets ${dateLabel}` : "Resets at the start of next month",

  noticeBody: (limit: number, remaining: number, dateLabel: string) =>
    `Free workspaces get ${limit} minutes of channel group calls a month, counted by call length — not per person. ${minuteLabel(
      remaining,
    )} left${dateLabel ? `, back on ${dateLabel}` : ""}. One-to-one calls are unlimited and never counted.`,
  noticeBodyExhausted: (limit: number, dateLabel: string) =>
    `This workspace has used all ${limit} of its free group call minutes this month${
      dateLabel ? `, and they come back on ${dateLabel}` : ""
    }. New group calls are paused until then — a call already running is never cut off, and one-to-one calls still work as normal.`,
  noticeCta: "Get unlimited calls",

  premiumNote: "Workspace Premium includes unlimited group calls — no monthly minute limit.",

  /** Button tooltip + toast when starting a call is refused. */
  startBlocked: (limit: number, dateLabel: string) =>
    `This workspace used its ${limit} free group call minutes this month${
      dateLabel ? ` — they reset on ${dateLabel}` : ""
    }. Upgrade for unlimited calls.`,

  planFeature: "Unlimited group calls — no monthly minute limit",
  freePlanLimit: (limit: number) => `${limit} group call minutes a month`,
} as const;
