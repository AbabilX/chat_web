"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { toast } from "sonner";
import { api, type GroupCall } from "@/lib/api";
import type { GroupMediaSession } from "./group-media/group-media-session";

type UseGroupScreenShareOptions = {
  sessionRef: RefObject<GroupMediaSession | null>;
  callRef: RefObject<GroupCall | null>;
  onCallUpdated: (call: GroupCall) => void;
  currentUserId?: string;
  screenOwnerId?: string;
  screenOwnerName?: string;
  localSharing: boolean;
};

/**
 * Screen sharing is exclusive, and the lock lives on the server
 * (`group_call_rooms.screen_sharer_id`) rather than in the media server — so
 * this is identical for both providers: claim, then publish; unpublish, then
 * release.
 */
export function useGroupScreenShare({
  sessionRef,
  callRef,
  onCallUpdated,
  currentUserId,
  screenOwnerId,
  screenOwnerName,
  localSharing,
}: UseGroupScreenShareOptions) {
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const claimedCallIdRef = useRef<string | null>(null);

  const releaseOwnership = useCallback(async (callId: string) => {
    if (claimedCallIdRef.current !== callId) return;
    claimedCallIdRef.current = null;
    const { call } = await api.setGroupCallScreenShare(callId, "release");
    if (call) onCallUpdated(call);
  }, [onCallUpdated]);

  /** The share ended without going through the button: release the lock too. */
  const handleScreenEnded = useCallback(() => {
    const call = callRef.current;
    if (call) void releaseOwnership(call.id).catch(() => {});
  }, [callRef, releaseOwnership]);

  const toggle = useCallback(async (sharingScreen: boolean) => {
    const session = sessionRef.current;
    const call = callRef.current;
    if (!session || !call || pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    try {
      if (sharingScreen) {
        await session.setScreenShareEnabled(false);
        await releaseOwnership(call.id);
      } else {
        const response = await api.setGroupCallScreenShare(call.id, "claim");
        claimedCallIdRef.current = call.id;
        if (response.call) onCallUpdated(response.call);
        try {
          await session.setScreenShareEnabled(true);
        } catch (error) {
          await releaseOwnership(call.id).catch(() => {});
          throw error;
        }
      }
    } catch (error) {
      const cancelled = error instanceof Error && error.name === "NotAllowedError";
      const busy = error instanceof Error && error.message === "group_screen_share_busy";
      toast.error(cancelled
        ? "Screen sharing was cancelled."
        : busy
          ? "Someone else is already sharing a screen."
          : "Could not change screen sharing.");
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }, [callRef, onCallUpdated, releaseOwnership, sessionRef]);

  const reset = useCallback(() => {
    claimedCallIdRef.current = null;
    pendingRef.current = false;
    setPending(false);
  }, []);

  // Somebody else claimed the lock while we were sharing: stop, do not fight.
  useEffect(() => {
    const session = sessionRef.current;
    if (!session || !localSharing || !screenOwnerId || !currentUserId) return;
    if (screenOwnerId === currentUserId) return;
    claimedCallIdRef.current = null;
    void session.setScreenShareEnabled(false).then(() => {
      toast.info(`${screenOwnerName || "Another participant"} took over screen sharing.`);
    }).catch(() => {});
  }, [currentUserId, localSharing, screenOwnerId, screenOwnerName, sessionRef]);

  // The lock can change without a websocket event reaching this tab.
  useEffect(() => {
    if (!localSharing) return;
    const reconcileOwner = () => {
      const current = callRef.current;
      if (!current) return;
      void api.getActiveGroupCall(current.conversation_id).then(({ call }) => {
        if (call?.id === current.id) onCallUpdated(call);
      }).catch(() => {});
    };
    const timer = window.setInterval(reconcileOwner, 5_000);
    return () => window.clearInterval(timer);
  }, [callRef, localSharing, onCallUpdated]);

  return { pending, toggle, handleScreenEnded, reset };
}
