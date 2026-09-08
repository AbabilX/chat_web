"use client";

import { useCallback, useRef } from "react";
import { useTeamContextOptional } from "@/components/team/shared/team-provider";

/**
 * Re-reads the workspace after a group call ends, so the Free plan's minute
 * counter (and the "Start call" gate that reads it) reflects the call that just
 * finished instead of waiting for the next page load.
 *
 * The backend counts calls that have ended but not yet been swept, so this is
 * accurate the moment the call is over. Best-effort by design: a failed refresh
 * only leaves a slightly stale number, and the server-side gate is authoritative
 * either way.
 */
export function useCallQuotaRefresh() {
  const reload = useTeamContextOptional()?.reload;
  const inFlight = useRef(false);

  return useCallback(() => {
    if (!reload || inFlight.current) return;
    inFlight.current = true;
    void Promise.resolve(reload())
      .catch(() => {})
      .finally(() => {
        inFlight.current = false;
      });
  }, [reload]);
}
