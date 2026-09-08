"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  EMPTY_FEED,
  selectActiveFeed,
  useChatStore,
} from "@/store/chat-store";

export function useChatFeed(conversationId: string | null, threadRootId?: string | null) {
  const feed = useChatStore(
    useShallow((s) =>
      conversationId ? selectActiveFeed(s, conversationId, threadRootId) : EMPTY_FEED,
    ),
  );
  const loadFeed = useChatStore((s) => s.loadFeed);
  const loadMoreFeed = useChatStore((s) => s.loadMoreFeed);
  useEffect(() => {
    if (!conversationId) return;
    void loadFeed(conversationId, threadRootId);
  }, [conversationId, threadRootId, loadFeed]);

  // Scrolling belongs to the timeline — see `chat-timeline/use-timeline-scroll.ts`.
  return {
    ...feed,
    loadMore: () => {
      if (conversationId) void loadMoreFeed(conversationId, threadRootId);
    },
  };
}

/** @deprecated use useChatFeed */
export function useChatMessages(conversationId: string | null, threadRootId?: string | null) {
  const feed = useChatFeed(conversationId, threadRootId);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const appendFeedMessage = useChatStore((s) => s.appendFeedMessage);
  const updateFeedMessage = useChatStore((s) => s.updateFeedMessage);
  const removeFeedMessage = useChatStore((s) => s.removeFeedMessage);
  const updateFeedReactions = useChatStore((s) => s.updateFeedReactions);
  const incrementThreadCount = useChatStore((s) => s.incrementThreadCount);
  const loadFeed = useChatStore((s) => s.loadFeed);

  return {
    messages: feed.messages,
    loading: feed.loading,
    loadingMore: feed.loadingMore,
    hasMore: feed.hasMore,
    nextCursor: feed.nextCursor,
    loadMore: feed.loadMore,
    appendMessage: (msg: Parameters<typeof appendFeedMessage>[1]) => {
      if (conversationId) appendFeedMessage(conversationId, msg, threadRootId);
    },
    updateMessage: (msg: Parameters<typeof updateFeedMessage>[1]) => {
      if (conversationId) updateFeedMessage(conversationId, msg, threadRootId);
    },
    removeMessage: (messageId: string) => {
      if (conversationId) removeFeedMessage(conversationId, messageId, threadRootId);
    },
    updateReactions: (
      messageId: string,
      reactions: Parameters<typeof updateFeedReactions>[2],
    ) => {
      if (conversationId) {
        updateFeedReactions(conversationId, messageId, reactions, threadRootId);
      }
    },
    incrementThreadCount: (rootId: string, replyAt?: string) => {
      if (conversationId) incrementThreadCount(conversationId, rootId, replyAt);
    },
    send: (
      body: string,
      attachments: Parameters<typeof sendMessage>[1],
      mentionedUserIds: string[],
      parentId?: string | null,
    ) => sendMessage(body, attachments, mentionedUserIds, parentId),
    refresh: () => {
      if (conversationId) void loadFeed(conversationId, threadRootId, { force: true });
    },
  };
}
