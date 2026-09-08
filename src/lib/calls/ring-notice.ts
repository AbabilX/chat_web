"use client";

import { getPermission, isDesktopNotifEnabled } from "@/lib/notifications/desktop";

const ICON = "/icons/icon-192.png";

export type RingNotice = { title: string; body?: string };

/**
 * OS-level fallback for the one case audio cannot cover: the page loaded, the
 * user has not clicked anything yet, and a call arrives — the autoplay policy
 * refuses `play()` and nothing in the page can override it.
 *
 * The notification permission is a real, persistent per-origin grant, so this
 * still makes a sound and a banner. Returns a closer for when the ring ends.
 */
export function showRingNotice(notice: RingNotice): () => void {
  const noop = () => {};
  if (typeof window === "undefined") return noop;
  if (getPermission() !== "granted" || !isDesktopNotifEnabled()) return noop;
  try {
    const notification = new Notification(notice.title, {
      body: notice.body,
      icon: ICON,
      badge: ICON,
      tag: "ababilx-incoming-call",
      // Calls are worth interrupting for; a normal toast is not.
      requireInteraction: true,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return () => notification.close();
  } catch {
    return noop;
  }
}
