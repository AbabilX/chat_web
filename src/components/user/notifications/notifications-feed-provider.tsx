"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api, type AppNotification } from "@/lib/api";
import type { NotificationWsEvent } from "@/lib/api/types/notification";
import { EventIdDeduper } from "@/lib/notifications/event-id-deduper";
import { subscribeAppWs } from "@/lib/notifications/ws-bus";

type DesktopListener = (n: AppNotification) => void;

type NotificationsFeed = {
  items: AppNotification[];
  unread: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  /** Subscribe to real-time creates (for desktop toasts). */
  subscribeDesktop: (listener: DesktopListener) => () => void;
};

const NotificationsFeedContext = createContext<NotificationsFeed | null>(null);

export function NotificationsFeedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);
  const desktopListenersRef = useRef(new Set<DesktopListener>());
  const createdEventIdsRef = useRef(new EventIdDeduper());

  const emitDesktop = useCallback((n: AppNotification) => {
    desktopListenersRef.current.forEach((fn) => fn(n));
  }, []);

  const subscribeDesktop = useCallback((listener: DesktopListener) => {
    desktopListenersRef.current.add(listener);
    return () => {
      desktopListenersRef.current.delete(listener);
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await api.getNotifications();
      if (cancelledRef.current) return;
      res.notifications.forEach((item) =>
        createdEventIdsRef.current.remember(item.id),
      );
      setItems(res.notifications);
      setUnread(res.unread_count);
    } catch {
      if (cancelledRef.current) return;
      // A transient refresh failure must not erase live WS state. Initial
      // state is already empty; later refreshes preserve the last good feed.
    } finally {
      if (!cancelledRef.current) setLoading(false);
    }
  }, []);

  const applyWsEvent = useCallback(
    (ev: NotificationWsEvent) => {
      if (ev.type === "notification.created") {
        const n = ev.notification;
        if (!createdEventIdsRef.current.remember(n.id)) {
          setUnread(ev.unread_count);
          return;
        }
        setItems((prev) => {
          if (prev.some((x) => x.id === n.id)) return prev;
          return [n, ...prev].slice(0, 50);
        });
        setUnread(ev.unread_count);
        emitDesktop(n);
        return;
      }
      if (ev.type === "notification.read") {
        setItems((prev) =>
          prev.map((x) => (x.id === ev.id ? { ...x, read: true } : x)),
        );
        setUnread(ev.unread_count);
        return;
      }
      if (ev.type === "notifications.all_read") {
        setItems((prev) => prev.map((x) => ({ ...x, read: true })));
        setUnread(0);
      }
    },
    [emitDesktop],
  );

  const markRead = useCallback(
    async (id: string) => {
      setItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, read: true } : x)),
      );
      setUnread((u) => Math.max(0, u - 1));
      try {
        await api.markNotificationRead(id);
      } catch {
        await refresh();
      }
    },
    [refresh],
  );

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
    try {
      await api.markAllNotificationsRead();
    } catch {
      await refresh();
    }
  }, [refresh]);

  useEffect(() => {
    cancelledRef.current = false;
    queueMicrotask(() => {
      void refresh();
    });

    const disconnectWs = subscribeAppWs({
      onEvent: (ev) => {
        if (
          ev.type === "notification.created" ||
          ev.type === "notification.read" ||
          ev.type === "notifications.all_read"
        ) {
          applyWsEvent(ev as NotificationWsEvent);
        }
      },
      onReconnect: () => {
        if (document.visibilityState === "visible") {
          void refresh();
        }
      },
    });

    const onTabVisible = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };
    document.addEventListener("visibilitychange", onTabVisible);
    window.addEventListener("focus", onTabVisible);

    return () => {
      cancelledRef.current = true;
      disconnectWs();
      document.removeEventListener("visibilitychange", onTabVisible);
      window.removeEventListener("focus", onTabVisible);
    };
  }, [refresh, applyWsEvent]);

  return (
    <NotificationsFeedContext.Provider
      value={{ items, unread, loading, refresh, markRead, markAllRead, subscribeDesktop }}>
      {children}
    </NotificationsFeedContext.Provider>
  );
}

export function useNotificationsFeed(): NotificationsFeed {
  const ctx = useContext(NotificationsFeedContext);
  if (!ctx) {
    throw new Error(
      "useNotificationsFeed must be used within a NotificationsFeedProvider",
    );
  }
  return ctx;
}
