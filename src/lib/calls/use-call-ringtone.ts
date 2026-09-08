"use client";

import { useEffect, useSyncExternalStore } from "react";
import { primeRingtone } from "./ringtone-prime";
import { showRingNotice, type RingNotice } from "./ring-notice";
import {
  isRingtoneBlocked,
  startRingtone,
  subscribeRingtoneBlocked,
} from "./ringtone";

/**
 * Whether the browser refused to play the ringtone, so ringing UI can offer a
 * one-click way to turn sound on instead of failing silently.
 */
export function useRingtoneBlocked() {
  return useSyncExternalStore(
    subscribeRingtoneBlocked,
    isRingtoneBlocked,
    () => false,
  );
}

/** Rings while `active`, and always releases its hold on unmount. */
export function useCallRingtone(active: boolean, notice?: RingNotice) {
  // Mounted app-wide by the call providers, so the unlock listener is armed
  // long before any call arrives.
  useEffect(primeRingtone, []);

  const blocked = useRingtoneBlocked();

  useEffect(() => {
    if (!active) return;
    // The hold releases itself on unmount, and expires on its own if that
    // cleanup never runs.
    return startRingtone();
  }, [active]);

  useEffect(() => {
    // Only when the audio ring was actually refused — otherwise the ringtone
    // and the dialog are already doing the job.
    if (!active || !blocked || !notice) return;
    return showRingNotice(notice);
    // Re-firing on every field change would spam; the title identifies the call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, blocked, notice?.title]);
}
