import { apiFetch, jsonHeaders } from "../core";
import type {
  DigestRepoTarget,
} from "../types/digest";
import type {
  AdminPaymentList,
  InviteLookupResponse,
  PaymentRequest,
  TeamDetail,
  TeamDigestConfigInput,
  TeamDigestConfigResponse,
  TeamDigestResponse,
  TeamDigestRun,
  TeamGraphResponse,
  TeamGraphView,
  TeamInvite,
  TeamMemberDigest,
  TeamDailyFeedResponse,
  TeamPaymentStatusResponse,
} from "../types/team";

export function getMyTeam() {
  return apiFetch<TeamDetail | null>("/api/teams/me");
}

export function createTeam(name: string) {
  return apiFetch<TeamDetail>("/api/teams", {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: jsonHeaders,
  });
}

/** Leader taps "Notify me" on the coming-soon per-seat billing section. */
export function recordBillingInterest() {
  return apiFetch<{ seat_price_usd: number; seats: number }>(
    "/api/teams/billing/interest",
    { method: "POST" },
  );
}

/** Latest payment request for the team + bKash pricing meta (for the billing card / pay page). */
export function getTeamPaymentStatus() {
  return apiFetch<TeamPaymentStatusResponse>("/api/teams/payments");
}

export type PaymentSubmitInput = {
  sender_number: string;
  trx_id: string;
  months: number;
};

/** Submit a new bKash payment for the team. */
export function submitPayment(body: PaymentSubmitInput) {
  return apiFetch<{ request: PaymentRequest }>("/api/teams/payments", {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

/** Edit an on-hold request and resend it for review. */
export function resubmitPayment(id: string, body: PaymentSubmitInput) {
  return apiFetch<{ request: PaymentRequest }>(`/api/teams/payments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

/** Admin: list payment requests, optionally filtered by status. */
export function adminListPayments(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<AdminPaymentList>(`/api/admin/payments${qs}`);
}

/** Admin: approve (grant premium), hold (with message), or reject a request. */
export function adminReviewPayment(
  id: string,
  body: { action: "approve" | "hold" | "reject"; message?: string; months?: number },
) {
  return apiFetch<{ request: PaymentRequest }>(`/api/admin/payments/${id}/review`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function updateTeam(
  teamId: string,
  body: { name?: string; avatar_url?: string },
) {
  return apiFetch<TeamDetail>(`/api/teams/${teamId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function deleteTeam(teamId: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/${teamId}`, {
    method: "DELETE",
  });
}

export function setTeamRepos(teamId: string, repo_targets: DigestRepoTarget[]) {
  return apiFetch<TeamDetail>(`/api/teams/${teamId}/repos`, {
    method: "PUT",
    body: JSON.stringify({ repo_targets }),
    headers: jsonHeaders,
  });
}

export function lookupInviteEmail(email: string) {
  return apiFetch<InviteLookupResponse>(
    `/api/teams/invites/lookup?email=${encodeURIComponent(email)}`,
  );
}

export function inviteTeamMember(email: string) {
  return apiFetch<TeamInvite>("/api/teams/invites", {
    method: "POST",
    body: JSON.stringify({ email }),
    headers: jsonHeaders,
  });
}

export function getTeamInvites() {
  return apiFetch<TeamInvite[]>("/api/teams/invites");
}

export function acceptTeamInvite(inviteId: string) {
  return apiFetch<TeamDetail>(`/api/teams/invites/${inviteId}/accept`, {
    method: "POST",
    headers: jsonHeaders,
  });
}

export function declineTeamInvite(inviteId: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/invites/${inviteId}/decline`, {
    method: "POST",
    headers: jsonHeaders,
  });
}

export function getTeamGraph(view: TeamGraphView = "daily") {
  const params = new URLSearchParams({ view });
  return apiFetch<TeamGraphResponse>(`/api/teams/graph?${params}`);
}

export function getTeamDailyUpdates(date?: string) {
  const q = date ? `?date=${encodeURIComponent(date)}` : "";
  return apiFetch<TeamDailyFeedResponse>(`/api/teams/daily-updates${q}`);
}

export function patchTeamMemberTags(userId: string, tags: string[]) {
  return apiFetch<{ tags: string[] }>(`/api/teams/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ tags }),
    headers: jsonHeaders,
  });
}

export function removeTeamMember(userId: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/members/${userId}`, {
    method: "DELETE",
  });
}

export function setTeamMemberRole(userId: string, role: "manager" | "member") {
  return apiFetch<{ role: string }>(`/api/teams/members/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
    headers: jsonHeaders,
  });
}

export type TeamRoleSettingsInput = {
  manager_role_label: string;
  kanban_admin: boolean;
  wall_moderation: boolean;
  attendance_settings: boolean;
  digest_config: boolean;
  team_settings_edit: boolean;
};

export function setTeamRoleSettings(body: TeamRoleSettingsInput) {
  return apiFetch<TeamDetail>("/api/teams/role-settings", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function leaveTeam() {
  return apiFetch<{ ok: boolean }>("/api/teams/leave", {
    method: "POST",
    headers: jsonHeaders,
  });
}

export function transferTeamLeadership(newLeaderUserId: string) {
  return apiFetch<import("../types/team").TeamDetail>("/api/teams/transfer-leadership", {
    method: "POST",
    body: JSON.stringify({ new_leader_user_id: newLeaderUserId }),
    headers: jsonHeaders,
  });
}

export function getTeamDigest(periodStart?: string) {
  const q = periodStart ? `?period_start=${encodeURIComponent(periodStart)}` : "";
  return apiFetch<TeamDigestResponse>(`/api/teams/digest${q}`);
}

export function getTeamDigestConfig() {
  return apiFetch<TeamDigestConfigResponse>("/api/teams/digest/config");
}

export function upsertTeamDigestConfig(body: TeamDigestConfigInput) {
  return apiFetch<import("../types/team").TeamDigestConfig>("/api/teams/digest/config", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function generateTeamDigestNow() {
  return apiFetch<{ run: TeamDigestRun; members: TeamMemberDigest[] }>(
    "/api/teams/digest/generate",
    { method: "POST", headers: jsonHeaders },
  );
}

export function getTeamDigestHistory() {
  return apiFetch<TeamDigestRun[]>("/api/teams/digest/history");
}
