"use client";

import { Loading03Icon } from "hugeicons-react";
import { Cancel01Icon, File01Icon } from "hugeicons-react";
import type { PendingCommentAttachment } from "./index";
import { cn } from "@/lib/utils";
import { isSvgAttachment } from "@/components/team/shared/attachment-media";

interface AttachmentsProps {
  items: PendingCommentAttachment[];
  busy?: boolean;
  onRemove: (index: number) => void;
}

function isVideoType(contentType: string) {
  return contentType.startsWith("video/");
}

function isPdfType(contentType: string, fileName: string) {
  return (
    contentType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")
  );
}

export function ComposerAttachments({ items, busy, onRemove }: AttachmentsProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-2.5 pb-2">
      {items.map((a, i) => {
        const svg = isSvgAttachment(a.content_type, a.file_name);
        return (
          <div
            key={a.file_url}
            className={cn(
              "group relative overflow-hidden rounded-lg border text-xs",
              a.error && "border-red-500/40",
              isVideoType(a.content_type) || a.previewUrl
                ? "w-28"
                : "max-w-[220px]",
            )}
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            {a.uploading ? (
              <div className="flex items-center gap-2 px-2 py-2 text-muted-foreground">
                <Loading03Icon className="h-4 w-4 shrink-0 animate-spin" />
                <span className="truncate">Uploading…</span>
              </div>
            ) : a.previewUrl && isVideoType(a.content_type) ? (
              <video
                src={a.previewUrl}
                className="h-20 w-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : a.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={a.previewUrl}
                alt=""
                className={cn(
                  "h-20 w-full",
                  svg ? "object-contain bg-black/[0.03]" : "object-cover",
                )}
              />
            ) : (
              <div className="flex items-center gap-2 px-2 py-2">
                <File01Icon size={16} className="shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate text-muted-foreground">
                  {a.file_name}
                </span>
              </div>
            )}

            {!a.uploading ? (
              <div
                className="flex items-center justify-between gap-1 border-t px-2 py-1 text-[10px] text-muted-foreground"
                style={{ borderColor: "var(--border)" }}
              >
                <span className="truncate">
                  {isPdfType(a.content_type, a.file_name) ? "PDF · " : ""}
                  {a.file_name}
                </span>
                <button
                  type="button"
                  className="shrink-0 rounded-sm p-0.5 hover:bg-white/10 hover:text-[var(--text)]"
                  aria-label="Remove attachment"
                  disabled={busy}
                  onClick={() => void onRemove(i)}
                >
                  <Cancel01Icon size={12} />
                </button>
              </div>
            ) : null}

            {a.error ? (
              <p className="px-2 pb-1 text-[10px] text-red-400">{a.error}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
