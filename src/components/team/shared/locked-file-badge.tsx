"use client";

import Link from "next/link";
import { LockIcon } from "hugeicons-react";
import { TEAM_RETENTION_COPY } from "@/constant/team/retention";

/**
 * Marks an attachment whose download the server withheld: the workspace passed
 * its free-plan file window, so `file_url` comes back empty with `locked: true`.
 * The file is not deleted — upgrading restores it — so the row keeps its name,
 * size and type and only the link is replaced by this badge.
 */
export default function LockedFileBadge({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/user/workspace/billing/pay"
      title={TEAM_RETENTION_COPY.lockedUpload}
      className={`inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-200 hover:border-amber-500/70 [data-theme=light]:text-amber-800 ${className}`}>
      <LockIcon size={11} className="shrink-0" />
      {TEAM_RETENTION_COPY.lockedAttachment}
    </Link>
  );
}

/** True when the server withheld this attachment's url. */
export function isLockedFile(att: { locked?: boolean; file_url?: string }): boolean {
  return !!att.locked || !att.file_url;
}
