"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { useTeamContext } from "@/components/team/shared/team-provider";
import { useChatStore } from "@/store/chat-store";
import {
  replayChatOutbox,
  requestPersistentChatStorage,
} from "@/lib/messages/outbox";
import { ensureMessagingDevice } from "@/lib/messages/device";

async function replayCurrentUserOutbox() {
  const userId = useChatStore.getState().currentUserId;
  if (!userId) return;
  const delivered = await replayChatOutbox(userId).catch(() => []);
  if (delivered.length === 0) return;
  const state = useChatStore.getState();
  await state.fetchSidebar({ silent: true });
  if (state.activeConversationId) {
    await state.loadFeed(state.activeConversationId, state.threadRootId, {
      force: true,
    });
  }
}

/** Mount once in app shell — keeps DM list + WS alive across pages. */
export default function ChatStoreSync() {
  const { loading, hasTeam } = useTeamContext();
  const independentChat = useChatStore((s) => s.independentChat);
  const initRealtime = useChatStore((s) => s.initRealtime);
  const fetchSidebar = useChatStore((s) => s.fetchSidebar);
  const setCurrentUserId = useChatStore((s) => s.setCurrentUserId);
  const resetTeamChatState = useChatStore((s) => s.resetTeamChatState);
  const chatReady = hasTeam || independentChat;

  useEffect(() => {
    void requestPersistentChatStorage();
    void replayCurrentUserOutbox();
    window.addEventListener("online", replayCurrentUserOutbox);
    return () => window.removeEventListener("online", replayCurrentUserOutbox);
  }, []);

  useEffect(() => {
    void api.getMeSession().then((me) => {
      setCurrentUserId(me.id);
      void ensureMessagingDevice(me.id).catch(() => {});
      void replayCurrentUserOutbox();
    });
  }, [setCurrentUserId]);

  useEffect(() => {
    if (loading) return;
    if (!chatReady) {
      resetTeamChatState();
      return;
    }
    void fetchSidebar();
    return initRealtime();
  }, [loading, chatReady, initRealtime, fetchSidebar, resetTeamChatState]);

  useEffect(() => {
    const onVisible = () => {
      if (chatReady && document.visibilityState === "visible") {
        void fetchSidebar({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [chatReady, fetchSidebar]);

  return null;
}
