"use client";

import { create } from "zustand";
import { subscribeAppWs } from "@/lib/notifications/ws-bus";

export type UserStatus = {
  emoji: string;
  text: string;
  expiresAt?: string | null;
};

type UserStatusState = {
  /** userId → active custom status */
  byUserId: Record<string, UserStatus>;
  setStatus: (userId: string, status: UserStatus | null) => void;
  setSnapshot: (
    entries: Array<{
      user_id: string;
      emoji?: string;
      text?: string;
      expires_at?: string;
    }>,
  ) => void;
  statusFor: (userId: string | null | undefined) => UserStatus | null;
};

let wsBound = false;

function isActive(status: UserStatus | null | undefined): status is UserStatus {
  if (!status?.text?.trim()) return false;
  if (!status.expiresAt) return true;
  const at = Date.parse(status.expiresAt);
  if (Number.isNaN(at)) return true;
  return at > Date.now();
}

export const useUserStatusStore = create<UserStatusState>((set, get) => ({
  byUserId: {},

  setStatus: (userId, status) => {
    if (!userId) return;
    set((s) => {
      const next = { ...s.byUserId };
      if (!status || !isActive(status)) {
        delete next[userId];
      } else {
        next[userId] = status;
      }
      return { byUserId: next };
    });
  },

  setSnapshot: (entries) => {
    const next: Record<string, UserStatus> = {};
    for (const e of entries) {
      if (!e.user_id || !e.text?.trim()) continue;
      const status: UserStatus = {
        emoji: e.emoji ?? "",
        text: e.text.trim(),
        expiresAt: e.expires_at ?? null,
      };
      if (isActive(status)) next[e.user_id] = status;
    }
    set({ byUserId: next });
  },

  statusFor: (userId) => {
    if (!userId) return null;
    const status = get().byUserId[userId];
    return isActive(status) ? status : null;
  },
}));

/** Mount once near the app shell — keeps custom statuses in sync via WS. */
export function bindUserStatusWs(): () => void {
  if (wsBound) return () => {};
  wsBound = true;
  const unsub = subscribeAppWs({
    onEvent: (ev) => {
      if (ev.type === "user.status") {
        const p = (
          ev as {
            user_status?: {
              user_id?: string;
              emoji?: string;
              text?: string;
              expires_at?: string;
            };
          }
        ).user_status;
        if (!p?.user_id) return;
        const text = (p.text ?? "").trim();
        if (!text) {
          useUserStatusStore.getState().setStatus(p.user_id, null);
          return;
        }
        useUserStatusStore.getState().setStatus(p.user_id, {
          emoji: p.emoji ?? "",
          text,
          expiresAt: p.expires_at ?? null,
        });
        return;
      }
      if (ev.type === "user.status.snapshot") {
        const entries =
          (
            ev as {
              user_statuses?: Array<{
                user_id: string;
                emoji?: string;
                text?: string;
                expires_at?: string;
              }>;
            }
          ).user_statuses ?? [];
        useUserStatusStore.getState().setSnapshot(entries);
      }
    },
  });
  return () => {
    wsBound = false;
    unsub();
  };
}
