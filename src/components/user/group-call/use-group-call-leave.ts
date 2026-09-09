"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { api, API_BASE, type GroupCall } from "@/lib/api";

/** Idempotent server leave plus the page-close keepalive fallback. */
export function useGroupCallLeave(callRef: RefObject<GroupCall | null>) {
  const leftCallIdsRef = useRef(new Set<string>());

  const leaveOnce = useCallback(async (callId: string, keepalive = false) => {
    if (leftCallIdsRef.current.has(callId)) return;
    leftCallIdsRef.current.add(callId);
    if (keepalive) {
      void fetch(`${API_BASE}/api/teams/chat/group-calls/${callId}/leave`, {
        method: "POST",
        keepalive: true,
        credentials: "include",
      });
      return;
    }
    await api.leaveGroupCall(callId).catch(() => {});
  }, []);

  useEffect(() => {
    const onPageHide = (event: PageTransitionEvent) => {
      if (event.persisted || !callRef.current) return;
      void leaveOnce(callRef.current.id, true);
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [callRef, leaveOnce]);

  const allowRejoin = useCallback((callId: string) => {
    leftCallIdsRef.current.delete(callId);
  }, []);

  return { allowRejoin, leaveOnce };
}
