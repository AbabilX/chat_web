// Free-plan workspace FILE retention copy.
//
// Two stages, one clock (backend: plan.FreeTeamFileLockMonths /
// FreeTeamFilePurgeMonths):
//
//   lock_at   uploaded files stop opening and new uploads are paused. NOTHING is
//             deleted — upgrading restores every file instantly.
//   purge_at  the files are PERMANENTLY deleted from storage.
//
// Written content is never touched on any plan: messages, tasks, wall posts,
// attendance records and CRM records stay readable throughout, and a locked
// attachment keeps its name, size and type behind the lock badge.

/**
 * Fallbacks for static copy only. Live values always come from the API
 * (`TeamDetail.file_retention`), so the backend stays the source of truth.
 */
export const FREE_FILE_LOCK_MONTHS = 4;
export const FREE_FILE_PURGE_MONTHS = 6;
export const FREE_FILE_GRACE_MONTHS = FREE_FILE_PURGE_MONTHS - FREE_FILE_LOCK_MONTHS;

export function formatRetentionDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function dayLabel(days: number): string {
  if (days <= 0) return "today";
  return days === 1 ? "1 day" : `${days} days`;
}

export const TEAM_RETENTION_COPY = {
  // Stage 1 — approaching the lock.
  lockBannerTitle: (days: number) =>
    days <= 0 ? "Uploaded files are locking" : `Uploaded files lock in ${dayLabel(days)}`,
  lockBannerBody: (dateLabel: string, lockMonths: number, graceMonths: number) =>
    `This workspace is on the Free plan, which keeps uploaded files open for ${lockMonths} months. On ${dateLabel} attachments, documents and images stop opening and new uploads pause — nothing is deleted, and you then have ${graceMonths} months to upgrade and get everything back. Messages, tasks, posts and records are never affected.`,

  // Stage 2 — locked, counting down to deletion.
  lockedBannerTitle: (days: number) =>
    days <= 0 ? "Locked files are being deleted" : `Locked files are deleted in ${dayLabel(days)}`,
  lockedBannerBody: (dateLabel: string) =>
    `Uploaded files in this workspace are locked and cannot be opened or downloaded. They are still stored: upgrade and every file comes back immediately. On ${dateLabel} they are permanently deleted and cannot be recovered.`,

  bannerCta: "Upgrade workspace",
  bannerDismiss: "Remind me later",

  // Always-on notice (overview storage card + billing card).
  noticeTitleActive: "Free plan file limit",
  noticeTitleLocked: "Uploaded files are locked",
  noticeBodyActive: (lockMonths: number, graceMonths: number, lockDate: string) =>
    `Free workspaces keep uploaded files open for ${lockMonths} months. On ${lockDate} this workspace's attachments, documents and images stop opening and uploads pause. They are held for a further ${graceMonths} months before being permanently deleted — upgrading at any point restores them. Messages, tasks and records are never deleted.`,
  noticeBodyLocked: (purgeDate: string) =>
    `Attachments, documents and images in this workspace no longer open, and new uploads are paused. Nothing has been deleted — upgrade and everything returns instantly. On ${purgeDate} the files are permanently deleted.`,
  noticeCta: "Unlock my files",

  premiumNote: "Workspace Premium keeps your uploaded files open — nothing locks or expires.",
  lastPurgeNote: (dateLabel: string) =>
    `Previously locked files were deleted on ${dateLabel} under the Free plan limit.`,

  // Inline states for upload buttons and attachment tiles.
  lockedAttachment: "Locked — upgrade to open",
  lockedUpload: "Uploads are paused while this workspace's files are locked.",

  planFeature: (lockMonths: number) => `No ${lockMonths}-month file lock — uploads stay open`,
  freePlanLimit: (lockMonths: number, graceMonths: number) =>
    `Uploaded files lock after ${lockMonths} months, deleted ${graceMonths} months later`,
} as const;

/** localStorage key for the per-team "remind me later" dismissal. */
export function retentionDismissKey(teamId: string): string {
  return `lbot_retention_dismissed_${teamId}`;
}

/** A dismissal silences the banner for one day, so the warning keeps coming back. */
export const RETENTION_DISMISS_MS = 24 * 60 * 60 * 1000;
