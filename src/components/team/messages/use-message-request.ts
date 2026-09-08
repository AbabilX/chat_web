"use client";

import { useMemo } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ChatConversation } from "@/lib/api";
import { friendlyError } from "@/lib/api/error-messages";
import { useChatStore } from "@/store/chat-store";

/**
 * The three answers to a Signal-style message request, bound to one
 * conversation. Returns undefined whenever there is nothing to answer, which
 * is what the timeline checks to decide between this bar and the composer.
 *
 * Every answer re-fetches the sidebar rather than patching state by hand: the
 * request state lives on the server row, and a stale local guess here shows
 * the bar over a thread the user already accepted.
 */
export function useMessageRequest(conversation: ChatConversation | null) {
  const fetchSidebar = useChatStore((s) => s.fetchSidebar);

  return useMemo(() => {
    if (!conversation || conversation.type !== "dm") return undefined;
    // A note to self has the viewer as its own peer, so a request bar here
    // would offer to block yourself. The server already blanks the state; this
    // is the second lock, because the bar replaces the composer when it shows.
    if (conversation.is_self) return undefined;
    if (conversation.request_state !== "incoming") return undefined;
    const id = conversation.id;
    const peerId = conversation.peer_user_id ?? "";

    const settle = async (
      work: () => Promise<unknown>,
      failure: string,
    ) => {
      try {
        await work();
      } catch (e) {
        toast.error(friendlyError(e, failure));
      }
      await fetchSidebar({ silent: true });
    };

    return {
      peerName: conversation.peer_user_name || "this person",
      onAccept: () =>
        settle(
          () => api.acceptChatMessageRequest(id),
          "Could not accept this request",
        ),
      onDelete: () =>
        settle(() => api.hideChatDM(id), "Could not delete this chat"),
      onBlock: () =>
        settle(async () => {
          if (!peerId) throw new Error("missing peer");
          await api.blockChatUser(peerId);
          await api.hideChatDM(id);
        }, "Could not block this person"),
    };
  }, [conversation, fetchSidebar]);
}
