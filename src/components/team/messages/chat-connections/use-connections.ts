"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/api/error-messages";
import type { ChatConnection, ChatUserSummary } from "@/lib/api";

/**
 * What the connections dialog needs: who you are already talking to, and a
 * people search that reports why a query was rejected.
 *
 * There is no request inbox here any more — a message request is answered in
 * the thread it arrived in, so it can be read before it is answered.
 */
export function useConnections(open: boolean) {
  const [connections, setConnections] = useState<ChatConnection[]>([]);

  const refresh = useCallback(async () => {
    try {
      const list = await api.listChatConnections();
      setConnections(list.connections ?? []);
    } catch (e) {
      toast.error(friendlyError(e, "Failed to load connections"));
    }
  }, []);

  // Load on open. Every state update lands in the promise callback, so opening
  // the dialog never causes a cascading render.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    api
      .listChatConnections()
      .then((list) => {
        if (cancelled) return;
        setConnections(list.connections ?? []);
      })
      .catch((e) => toast.error(friendlyError(e, "Failed to load connections")));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const disconnect = useCallback(
    async (userId: string) => {
      try {
        await api.removeChatConnection(userId);
        await refresh();
      } catch (e) {
        toast.error(friendlyError(e, "Failed to remove connection"));
      }
    },
    [refresh],
  );

  const block = useCallback(
    async (userId: string) => {
      try {
        await api.blockChatUser(userId);
        await refresh();
        toast.success("Blocked");
      } catch (e) {
        toast.error(friendlyError(e, "Failed to block"));
      }
    },
    [refresh],
  );

  return { connections, refresh, disconnect, block };
}

/** People search. Queries shorter than 3 characters are never sent. */
export function useUserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ChatUserSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    const q = query.trim();
    if (q.length < 3) {
      toast.error("Type at least 3 characters, or a full email / phone number");
      return;
    }
    setSearching(true);
    try {
      const data = await api.searchChatUsers(q);
      setResults(data.users ?? []);
      setSearched(true);
    } catch (e) {
      // Clear stale hits too: leaving the previous query's results under a new
      // error reads as "these are your matches".
      setResults([]);
      setSearched(true);
      toast.error(friendlyError(e, "Search failed"));
    } finally {
      setSearching(false);
    }
  }, [query]);

  return { query, setQuery, results, searching, searched, search };
}
