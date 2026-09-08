"use client";

import { useCallback, useEffect, type Dispatch, type RefObject, type SetStateAction } from "react";
import { api, type GroupCall, type GroupCallWsEvent } from "@/lib/api";
import { subscribeAppWs } from "@/lib/notifications/ws-bus";
import { useCallQuotaRefresh } from "./use-call-quota-refresh";

type UseGroupCallEventsOptions = {
  callRef: RefObject<GroupCall | null>;
  setActiveCalls: Dispatch<SetStateAction<Record<string, GroupCall>>>;
  onCallUpdated: (call: GroupCall) => void;
  onCallEnded: () => void;
  onInviteEvent: (event: GroupCallWsEvent) => void;
};

/**
 * Server-side group-call state, pushed. This is the only thing that knows a
 * call exists in a conversation this tab is not in, which is what puts the
 * "Join · N" pill on a channel header.
 */
export function useGroupCallEvents({
  callRef,
  setActiveCalls,
  onCallUpdated,
  onCallEnded,
  onInviteEvent,
}: UseGroupCallEventsOptions) {
  const refreshCallQuota = useCallQuotaRefresh();

  useEffect(() => subscribeAppWs({ onEvent: (raw) => {
    if (!raw.type.startsWith("group_call.")) return;
    const event = raw as GroupCallWsEvent;
    const call = event.group_call;
    if (!call) return;
    onInviteEvent(event);
    // A finished call has spent the workspace's minutes — refresh the counter
    // for everyone, not just whoever was in the room.
    if (event.type === "group_call.ended") refreshCallQuota();
    setActiveCalls((current) => {
      const next = { ...current };
      if (event.type === "group_call.ended") delete next[call.conversation_id];
      else next[call.conversation_id] = call;
      return next;
    });
    if (callRef.current?.id !== call.id) return;
    if (event.type === "group_call.ended") onCallEnded();
    else onCallUpdated(call);
  } }), [callRef, onCallEnded, onCallUpdated, onInviteEvent, refreshCallQuota, setActiveCalls]);

  /** Pulls one conversation's call state, for a header that just mounted. */
  return useCallback(async (conversationId: string) => {
    try {
      const { call } = await api.getActiveGroupCall(conversationId);
      setActiveCalls((current) => {
        const next = { ...current };
        if (call) next[conversationId] = call;
        else delete next[conversationId];
        return next;
      });
    } catch {
      // Best-effort discovery; join still performs an authoritative check.
    }
  }, [setActiveCalls]);
}
