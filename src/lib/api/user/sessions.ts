import { apiFetch, jsonHeaders } from "../core";
import type { UserSession } from "../types/session";

/** Devices currently signed in to this account, most recently active first. */
export async function getSessions(): Promise<UserSession[]> {
  const res = await apiFetch<{ sessions: UserSession[] }>("/api/me/sessions");
  return res.sessions ?? [];
}

/** Signs one other device out. The current session is refused by the backend. */
export function revokeSession(id: string) {
  return apiFetch<{ revoked: number }>(`/api/me/sessions/${id}`, {
    method: "DELETE",
  });
}

/** Signs every device out except this one. Returns how many were ended. */
export function revokeOtherSessions() {
  return apiFetch<{ revoked: number }>("/api/me/sessions/revoke-others", {
    method: "POST",
  });
}

/**
 * Names one device. An empty name clears the override, and the backend answers
 * with the label it fell back to, so the caller never re-derives it.
 */
export function renameSession(id: string, deviceName: string) {
  return apiFetch<{ label: string }>(`/api/me/sessions/${id}`, {
    method: "PATCH",
    headers: jsonHeaders,
    body: JSON.stringify({ device_name: deviceName }),
  });
}
