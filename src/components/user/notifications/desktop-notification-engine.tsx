"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useNotificationsFeed } from "./notifications-feed-provider";
import {
  getLastSeenNotifId,
  getPermission,
  isDesktopNotifEnabled,
  setLastSeenNotifId,
  toInternalPath,
} from "@/lib/notifications/desktop";
import {
  isAppInBackground,
  showDesktopForNotification,
} from "@/lib/notifications/show-desktop";

export default function DesktopNotificationEngine({
  serverEnabled = true,
}: {
  /** Account-level pref from GET /api/me/profile (synced via settings). */
  serverEnabled?: boolean;
}) {
  const { items, subscribeDesktop, refresh, markRead } = useNotificationsFeed();
  const router = useRouter();
  const initializedRef = useRef(false);
  const catchUpAfterReturnRef = useRef(false);

  const openFromNotification = useCallback(
    (n: { id: string; link?: string | null; read?: boolean }) => {
      if (!n.read) {
        void markRead(n.id);
      }
      if (n.link) {
        router.push(toInternalPath(n.link));
      }
    },
    [markRead, router],
  );

  // When user returns to this tab, sync and allow catch-up desktop toasts.
  useEffect(() => {
    const onReturn = () => {
      if (document.visibilityState !== "visible") return;
      catchUpAfterReturnRef.current = true;
      void refresh();
    };
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("focus", onReturn);
    return () => {
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("focus", onReturn);
    };
  }, [refresh]);

  // Real-time via WebSocket: OS toast when another tab/window is active.
  useEffect(() => {
    return subscribeDesktop((n) => {
      toast(
        <div
          onClick={() => openFromNotification(n)}
          className="cursor-pointer w-full text-sm"
        >
          <p className="font-medium text-foreground">{n.title}</p>
          {n.body ? <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p> : null}
        </div>,
        {
          position: "top-center",
          duration: 7000,
        }
      );

      if (isAppInBackground()) {
        if (!serverEnabled || !isDesktopNotifEnabled()) return;
        if (getPermission() !== "granted") return;
        showDesktopForNotification(n, {
          serverEnabled,
          navigate: (path) => {
            void markRead(n.id);
            router.push(path);
          },
          onlyWhenUnfocused: true,
        });
      }
    });
  }, [subscribeDesktop, router, serverEnabled, markRead, openFromNotification]);

  // Fallback: catch items added via initial load / reconnect refresh (no duplicate if already seen).
  useEffect(() => {
    if (items.length === 0) return;

    const parsed = items
      .map((n) => ({ n, ts: Date.parse(n.created_at) }))
      .filter((x) => !Number.isNaN(x.ts));
    if (parsed.length === 0) return;

    const maxTs = Math.max(...parsed.map((x) => x.ts));
    const maxIso = parsed.find((x) => x.ts === maxTs)!.n.created_at;
    const lastSeen = getLastSeenNotifId();
    const lastSeenMs = lastSeen ? Date.parse(lastSeen) : NaN;

    if (!initializedRef.current && lastSeen === null) {
      initializedRef.current = true;
      setLastSeenNotifId(maxIso);
      return;
    }
    initializedRef.current = true;

    if (!serverEnabled || !isDesktopNotifEnabled()) {
      setLastSeenNotifId(maxIso);
      return;
    }
    if (getPermission() !== "granted") {
      setLastSeenNotifId(maxIso);
      return;
    }

    const fresh = parsed
      .filter((x) => (Number.isNaN(lastSeenMs) ? false : x.ts > lastSeenMs))
      .sort((a, b) => a.ts - b.ts)
      .map((x) => x.n);

    const catchUp = catchUpAfterReturnRef.current;
    const inBackground = isAppInBackground();
    if (!catchUp && !inBackground) {
      setLastSeenNotifId(maxIso);
      return;
    }

    let shownAny = false;
    for (const n of fresh.slice(-3)) {
      const shown = showDesktopForNotification(n, {
        serverEnabled,
        navigate: (path) => {
          void markRead(n.id);
          router.push(path);
        },
        onlyWhenUnfocused: !catchUp,
      });
      shownAny = shownAny || shown;
    }
    if (catchUp) catchUpAfterReturnRef.current = false;
    if (shownAny || fresh.length > 0) {
      setLastSeenNotifId(maxIso);
    }
  }, [items, router, serverEnabled, markRead]);

  return null;
}
