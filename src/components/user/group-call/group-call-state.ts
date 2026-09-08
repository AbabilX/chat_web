import { ApiError, type TeamCallQuota } from "@/lib/api";
import {
  FREE_CALL_MINUTES_PER_MONTH,
  TEAM_CALL_QUOTA_COPY,
  formatCallResetDate,
} from "@/constant/team/call-quota";
import type { GroupRoomView } from "./group-call-context";

export const idleGroupRoomView: GroupRoomView = {
  phase: "idle",
  call: null,
  participants: [],
  screen: null,
  muted: false,
  microphoneUnavailable: false,
  sharingScreen: false,
  audioBlocked: false,
};

/** Reads the quota block the backend attaches to a 402, if it sent one. */
export function callQuotaFromError(error: unknown): TeamCallQuota | undefined {
  if (!(error instanceof ApiError)) return undefined;
  const quota = error.data.call_quota;
  return quota && typeof quota === "object"
    ? (quota as TeamCallQuota)
    : undefined;
}

/** Copy for a workspace that has spent its monthly group-call minutes. */
export function callQuotaExhaustedMessage(quota?: TeamCallQuota) {
  return TEAM_CALL_QUOTA_COPY.startBlocked(
    quota?.limit_minutes || FREE_CALL_MINUTES_PER_MONTH,
    formatCallResetDate(quota?.period_end),
  );
}

export function groupCallErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "Could not join the group call.";
  if (error.message === "group_call_quota_exhausted") {
    return callQuotaExhaustedMessage(callQuotaFromError(error));
  }
  if (error.message === "group_call_user_busy") {
    return "You are already in another call.";
  }
  if (error.message === "group_call_full") return "This group call is full.";
  return error.name === "NotAllowedError"
    ? "Microphone permission was not granted."
    : "Could not join the group call.";
}
