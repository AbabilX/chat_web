"use client";

import { useEffect } from "react";
import { sendOnAppWs, subscribeAppWs } from "@/lib/notifications/ws-bus";

// The server trusts a focus claim for 2 minutes; re-assert well inside that so a
// long read session keeps suppressing notifications for the open conversation.
const REFRESH_INTERVAL_MS = 45_000;

/**
 * Tells the server which conversation this user is actively reading, so it can
 * skip the inbox notification and the phone push for messages that are already
 * landing in their open feed. Without this, replying to a DM leaves a bell badge
 * for the very message being answered.
 *
 * A hidden tab is not "reading", so the claim is dropped while backgrounded and
 * re-asserted on return. Claims are also re-sent on reconnect: `sendOnAppWs`
 * silently drops frames while the socket is still opening.
 */
export function useChatFocus(conversationId: string | null) {
  useEffect(() => {
    if (!conversationId) return;

    const report = (id: string) =>
      sendOnAppWs({ type: "chat.focus", conversation_id: id });

    const sync = () =>
      report(document.visibilityState === "visible" ? conversationId : "");

    const unsubWs = subscribeAppWs({
      onEvent: () => {},
      onReconnect: sync,
    });

    sync();
    const timer = setInterval(sync, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", sync);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", sync);
      unsubWs();
      // Leaving the conversation (or the screen) releases the claim immediately
      // rather than waiting out the server-side TTL.
      report("");
    };
  }, [conversationId]);
}
