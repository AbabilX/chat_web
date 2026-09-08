"use client";

import { create } from "zustand";
import { subscribeAppWs } from "@/lib/notifications/ws-bus";

type PresenceState = {
  /** userId → last seen ms (online while within ONLINE_TTL_MS) */
  lastSeenByUserId: Record<string, number>;
  setOnline: (userId: string, atMs?: number) => void;
  setOffline: (userId: string) => void;
  setSnapshot: (userIds: string[]) => void;
  isOnline: (userId: string) => boolean;
};

export const ONLINE_TTL_MS = 90_000;

let wsBound = false;

export const usePresenceStore = create<PresenceState>((set, get) => ({
  lastSeenByUserId: {},

  setOnline: (userId, atMs = Date.now()) => {
    if (!userId) return;
    set((s) => ({
      lastSeenByUserId: { ...s.lastSeenByUserId, [userId]: atMs },
    }));
  },

  setOffline: (userId) => {
    if (!userId) return;
    set((s) => {
      if (!(userId in s.lastSeenByUserId)) return s;
      const next = { ...s.lastSeenByUserId };
      delete next[userId];
      return { lastSeenByUserId: next };
    });
  },

  setSnapshot: (userIds) => {
    const now = Date.now();
    const next: Record<string, number> = {};
    for (const id of userIds) {
      if (id) next[id] = now;
    }
    set({ lastSeenByUserId: next });
  },

  isOnline: (userId) => {
    const at = get().lastSeenByUserId[userId];
    if (!at) return false;
    return Date.now() - at < ONLINE_TTL_MS;
  },
}));

/** Mount once near the app shell — keeps presence in sync via the shared stream. */
export function bindPresenceWs(): () => void {
  if (wsBound) return () => {};
  wsBound = true;
  const unsub = subscribeAppWs({
    onEvent: (ev) => {
      if (ev.type === "attendance.presence") {
        const p = (
          ev as {
            presence?: { user_id?: string; online?: boolean; at?: string };
          }
        ).presence;
        if (!p?.user_id) return;
        if (p.online) {
          const at = p.at ? Date.parse(p.at) : Date.now();
          usePresenceStore
            .getState()
            .setOnline(p.user_id, Number.isNaN(at) ? Date.now() : at);
        } else {
          usePresenceStore.getState().setOffline(p.user_id);
        }
        return;
      }
      if (ev.type === "attendance.presence.snapshot") {
        const ids =
          (ev as { online_user_ids?: string[] }).online_user_ids ?? [];
        usePresenceStore.getState().setSnapshot(ids);
      }
    },
  });
  return () => {
    wsBound = false;
    unsub();
  };
}
