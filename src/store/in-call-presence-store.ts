"use client";

import { create } from "zustand";
import { subscribeAppWs } from "@/lib/notifications/ws-bus";

type InCallPresenceState = {
  /** userIds currently in a ringing/accepted voice call */
  inCallUserIds: Set<string>;
  setInCall: (userId: string, inCall: boolean) => void;
  setSnapshot: (userIds: string[]) => void;
  isInCall: (userId: string) => boolean;
};

let wsBound = false;

export const useInCallPresenceStore = create<InCallPresenceState>((set, get) => ({
  inCallUserIds: new Set(),

  setInCall: (userId, inCall) => {
    if (!userId) return;
    set((s) => {
      const next = new Set(s.inCallUserIds);
      if (inCall) next.add(userId);
      else next.delete(userId);
      return { inCallUserIds: next };
    });
  },

  setSnapshot: (userIds) => {
    set({
      inCallUserIds: new Set(userIds.filter(Boolean)),
    });
  },

  isInCall: (userId) => {
    if (!userId) return false;
    return get().inCallUserIds.has(userId);
  },
}));

/** Mount once near the app shell — keeps in-call flags in sync via WS. */
export function bindInCallPresenceWs(): () => void {
  if (wsBound) return () => {};
  wsBound = true;
  const unsub = subscribeAppWs({
    onEvent: (ev) => {
      if (ev.type === "call.presence") {
        const p = (
          ev as {
            call_presence?: {
              user_id?: string;
              in_call?: boolean;
            };
          }
        ).call_presence;
        if (!p?.user_id) return;
        useInCallPresenceStore
          .getState()
          .setInCall(p.user_id, p.in_call === true);
        return;
      }
      if (ev.type === "call.presence.snapshot") {
        const ids =
          (ev as { in_call_user_ids?: string[] }).in_call_user_ids ?? [];
        useInCallPresenceStore.getState().setSnapshot(ids);
      }
    },
  });
  return () => {
    wsBound = false;
    unsub();
  };
}
