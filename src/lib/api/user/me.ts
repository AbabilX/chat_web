import { apiFetch } from "../core";
import type { AppUser, MeConnections, MePlan, MeProfile, MeSession } from "../types/me";
import {
  mergeMeUser,
  sessionConnectionsUser,
  sessionPlanUser,
  profileFromSession,
} from "../types/me";

export { mergeMeUser, sessionPlanUser, sessionConnectionsUser, profileFromSession };

const jsonHeaders = { "Content-Type": "application/json" };

/**
 * Shared in-flight `/api/me`. The shell, ChatStoreSync and the screen itself
 * all mount in the same commit and each wanted the session — that was three
 * identical requests per page load. Only concurrent callers share; once the
 * request settles the next call fetches again, so nothing is ever stale.
 */
let sessionInFlight: Promise<MeSession> | null = null;

export function getMeSession() {
  sessionInFlight ??= apiFetch<MeSession>("/api/me").finally(() => {
    sessionInFlight = null;
  });
  return sessionInFlight;
}

if (typeof window !== "undefined") {
  window.addEventListener("ababilx:logout", () => {
    sessionInFlight = null;
  });
}

export function getMeProfile() {
  return apiFetch<MeProfile>("/api/me/profile");
}

export function getMePlan() {
  return apiFetch<MePlan>("/api/me/plan");
}

export function getMeConnections() {
  return apiFetch<MeConnections>("/api/me/connections");
}

/** Parallel fetch — use on profile/settings; prefer split calls elsewhere. */
export async function getMeFull(): Promise<AppUser> {
  const [session, profile, plan, connections] = await Promise.all([
    getMeSession(),
    getMeProfile(),
    getMePlan(),
    getMeConnections(),
  ]);
  return mergeMeUser(session, profile, plan, connections);
}

/** @deprecated Prefer getMeSession / getMeConnections / getMeFull */
export function getMe() {
  return getMeFull();
}

export function updatePrivacy(enabled: boolean) {
  return apiFetch<AppUser>("/api/me/privacy", {
    method: "PUT",
    body: JSON.stringify({ enabled }),
    headers: jsonHeaders,
  });
}

export function updateLanguage(language: "en" | "bn") {
  return apiFetch<AppUser>("/api/me/language", {
    method: "PUT",
    body: JSON.stringify({ language }),
    headers: jsonHeaders,
  });
}

/**
 * Sets the name every other account sees — chat rows, message bubbles, group
 * member lists, workspace rosters all read the same `users.name`.
 *
 * The server normalizes before storing (collapses whitespace runs, strips
 * invisible characters), so use the returned user rather than echoing back
 * what was typed.
 */
export function updateDisplayName(name: string) {
  return apiFetch<AppUser>("/api/me/name", {
    method: "PUT",
    body: JSON.stringify({ name }),
    headers: jsonHeaders,
  });
}

export function updateEmailNotifications(enabled: boolean) {
  return apiFetch<AppUser>("/api/me/email-notifications", {
    method: "PUT",
    body: JSON.stringify({ enabled }),
    headers: jsonHeaders,
  });
}

export function updateDesktopNotifications(enabled: boolean) {
  return apiFetch<AppUser>("/api/me/desktop-notifications", {
    method: "PUT",
    body: JSON.stringify({ enabled }),
    headers: jsonHeaders,
  });
}

export const updateGitHubPrivacyMode = updatePrivacy;
export const updateAppLanguage = updateLanguage;
export const updateEmailNotificationsEnabled = updateEmailNotifications;
export const updateDesktopNotificationsEnabled = updateDesktopNotifications;

export function regenerateDesktopCode() {
  return apiFetch<{ desktop_code: string }>("/api/me/desktop-code/regenerate", {
    method: "POST",
  });
}

export function acceptPolicy() {
  return apiFetch<{ accept_policy: boolean; policy_version: string }>(
    "/api/me/accept-policy",
    { method: "POST" },
  );
}

export function deleteAccount() {
  return apiFetch<null>("/api/me/delete-account", { method: "DELETE" });
}

export type UserStatusResponse = {
  emoji: string;
  text: string;
  expires_at: string;
};

/** Slack-style custom status — auto-clears after duration_hours (1|4|8|24). */
export function setUserStatus(body: {
  emoji: string;
  text: string;
  duration_hours: number;
}) {
  return apiFetch<UserStatusResponse>("/api/me/status", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function clearUserStatus() {
  return apiFetch<null>("/api/me/status", { method: "DELETE" });
}
