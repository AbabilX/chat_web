"use client";

import { useEffect, useState } from "react";
import { saveUrlToDownloads } from "@/lib/files/save-file";

/** Signal shows the outcome of a save as a toast for two and a half seconds. */
const TOAST_MS = 2500;

/**
 * Writing the copy already on this machine out to Downloads. Nothing is
 * fetched: the `blob:` handed in is the cached asset the bubble drew.
 */
export function useSaveAttachment(localUrl: string, fileName?: string) {
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const save = async () => {
    if (!localUrl || !fileName) return;
    setSaving(true);
    try {
      const outcome = await saveUrlToDownloads(localUrl, fileName);
      // Cancelling the save panel is an answer, not a failure.
      if (outcome.saved) {
        setToast(outcome.path ? `Saved as ${outcome.path.replace(/^.*\//, "")}` : "Saved");
      }
    } catch (error) {
      console.warn("[lightbox] could not save attachment", error);
      setToast(`Could not save: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, toast };
}
