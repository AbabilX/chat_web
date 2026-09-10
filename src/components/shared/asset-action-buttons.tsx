"use client";

import { useState } from "react";
import { Download01Icon, LinkSquare02Icon } from "hugeicons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { openExternal, saveAssetToDownloads } from "@/lib/files/asset-actions";

/**
 * Save and Open in browser, side by side.
 *
 * Every download affordance in the app carries both: a file people can save is
 * one they may want to just look at, and the browser is where a PDF, a page or
 * a video they would rather scrub in Chrome belongs.
 *
 * Save writes the copy this machine already holds, through the native save
 * panel — the plain `<a download>` these buttons replaced does nothing at all
 * inside WKWebView, and a silent write into ~/Downloads is refused by macOS
 * until the user has pointed at a location themselves.
 */
export default function AssetActionButtons({
  url,
  fileName,
  variant = "overlay",
  className,
}: {
  url: string;
  fileName?: string;
  /** `overlay` sits on top of a picture; `inline` sits in a row of text. */
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const outcome = await saveAssetToDownloads(url, fileName);
      if (outcome.saved) toast.success("Saved");
    } catch (error) {
      // The real reason, not a shrug: a refused folder and a missing command
      // are different problems and used to read identically.
      console.warn("[asset] could not save", error);
      toast.error(`Could not save: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const button =
    variant === "overlay"
      ? "flex h-7 w-7 items-center justify-center rounded-md bg-black/70 text-white transition-colors hover:bg-black/85 disabled:opacity-50"
      : // The app's own tokens, not the chat namespace: these rows live on the
        // wall, the board and both themes have to read.
        "flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--surface3)] hover:text-[var(--text)] disabled:opacity-50";

  const stop = (event: React.MouseEvent) => {
    // These live inside tiles and rows that open something of their own.
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        aria-label={fileName ? `Save ${fileName}` : "Save to Downloads"}
        title="Save to Downloads"
        disabled={saving}
        onClick={(event) => {
          stop(event);
          void save();
        }}
        className={button}
      >
        <Download01Icon size={14} className="shrink-0" />
      </button>
      <button
        type="button"
        aria-label="Open in browser"
        title="Open in browser"
        onClick={(event) => {
          stop(event);
          void openExternal(url);
        }}
        className={button}
      >
        <LinkSquare02Icon size={14} className="shrink-0" />
      </button>
    </div>
  );
}
