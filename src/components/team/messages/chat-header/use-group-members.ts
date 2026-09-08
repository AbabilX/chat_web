"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ChatMember } from "@/lib/api/types/chat";

/** Loads a group's roster; `reload` refetches after add/leave changes. */
export function useGroupMembers(channelId: string | null, enabled: boolean) {
  const [members, setMembers] = useState<ChatMember[]>([]);

  const reload = useCallback(async () => {
    if (!channelId) return;
    try {
      setMembers(await api.listChatChannelMembers(channelId));
    } catch {
      // roster is best-effort; keep whatever we had
    }
  }, [channelId]);

  useEffect(() => {
    if (!enabled || !channelId) return;
    let cancelled = false;
    api
      .listChatChannelMembers(channelId)
      .then((roster) => {
        if (!cancelled) setMembers(roster);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [enabled, channelId]);

  return { members, reload };
}
