import type { AppNotification } from "@/lib/api/types/notification";
import {
  claimDesktopNotification,
  getPermission,
  isDesktopNotifEnabled,
  setLastSeenNotifId,
  showDesktopNotification,
  toInternalPath,
} from "@/lib/notifications/desktop";

/** True when the user is not actively viewing this tab (another tab or window). */
export function isAppInBackground(): boolean {
  if (typeof document === "undefined") return false;
  return document.hidden || !document.hasFocus();
}

/** Shows OS desktop toast for a new in-app notification when enabled. */
export function showDesktopForNotification(
  n: Pick<AppNotification, "id" | "title" | "body" | "link" | "created_at">,
  options: {
    serverEnabled: boolean;
    navigate: (path: string) => void;
    /** When true, only toast if tab/window is not focused (default). */
    onlyWhenUnfocused?: boolean;
  },
): boolean {
  if (!options.serverEnabled || !isDesktopNotifEnabled()) return false;
  if (getPermission() !== "granted") return false;
  const onlyWhenUnfocused = options.onlyWhenUnfocused !== false;
  if (onlyWhenUnfocused && !isAppInBackground()) return false;
  if (!claimDesktopNotification(n.id)) return false;

  const shown = showDesktopNotification(
    { id: n.id, title: n.title, body: n.body, link: n.link },
    { sound: true, navigate: (link) => options.navigate(toInternalPath(link)) },
  );
  if (shown) {
    setLastSeenNotifId(n.created_at);
  }
  return shown;
}
