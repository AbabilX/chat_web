const ENABLED_KEY = "lbot_desktop_notif_enabled";
const LAST_SEEN_KEY = "lbot_desktop_notif_last_seen";
const BANNER_DISMISSED_KEY = "lbot_desktop_notif_banner_dismissed";
const CLAIMED_IDS_KEY = "lbot_desktop_notif_claimed_ids";

const NOTIF_ICON = "/icons/icon-192.png";

export type DesktopPermission = NotificationPermission | "unsupported";

export type DesktopNotifyPayload = {
  id: string;
  title: string;
  body?: string;
  link?: string;
};

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getPermission(): DesktopPermission {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<DesktopPermission> {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function isDesktopNotifEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const v = window.localStorage.getItem(ENABLED_KEY);
  return v === null ? true : v === "true";
}

export function setDesktopNotifEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ENABLED_KEY, enabled ? "true" : "false");
}

export function getLastSeenNotifId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_SEEN_KEY);
}

export function setLastSeenNotifId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_SEEN_KEY, id);
}

/**
 * Claims a notification across every tab for this browser profile.
 * Notification WS events reach all open tabs; without this shared memory each
 * hidden tab can raise the same OS toast and play its own sound.
 */
export function claimDesktopNotification(id: string): boolean {
  if (typeof window === "undefined" || !id) return false;
  let ids: string[] = [];
  try {
    const decoded = JSON.parse(
      window.localStorage.getItem(CLAIMED_IDS_KEY) ?? "[]",
    );
    if (Array.isArray(decoded)) {
      ids = decoded.filter((value): value is string => typeof value === "string");
    }
  } catch {
    ids = [];
  }
  if (ids.includes(id)) return false;
  ids.push(id);
  window.localStorage.setItem(CLAIMED_IDS_KEY, JSON.stringify(ids.slice(-64)));
  return true;
}

export function isBannerDismissed(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(BANNER_DISMISSED_KEY) === "true";
}

export function dismissBanner(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BANNER_DISMISSED_KEY, "true");
}

/** Short two-tone chime via the Web Audio API (no binary asset required). */
export function playBeep(): void {
  if (typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1175, now + 0.12);
    osc.connect(gain);
    osc.start(now);
    osc.stop(now + 0.36);
    osc.onended = () => ctx.close().catch(() => {});
  } catch {
    // Audio can fail without a user gesture; ignore.
  }
}

/**
 * Shows a browser desktop notification. Returns true when shown.
 * `navigate` is invoked with the link on click (after focusing the window).
 */
export function showDesktopNotification(
  payload: DesktopNotifyPayload,
  options?: { sound?: boolean; navigate?: (link: string) => void },
): boolean {
  if (!notificationsSupported() || Notification.permission !== "granted") {
    return false;
  }
  try {
    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: NOTIF_ICON,
      badge: NOTIF_ICON,
      tag: payload.id,
    });
    notification.onclick = () => {
      window.focus();
      if (payload.link && options?.navigate) {
        options.navigate(payload.link);
      }
      notification.close();
    };
    if (options?.sound) playBeep();
    return true;
  } catch {
    return false;
  }
}

/** Builds an internal route from an absolute or relative notification link. */
export function toInternalPath(link: string): string {
  if (!link) return "";
  try {
    const url = new URL(link, window.location.origin);
    return url.pathname + url.search + url.hash;
  } catch {
    return link.startsWith("/") ? link : `/${link}`;
  }
}
