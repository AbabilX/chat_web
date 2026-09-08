import { apiFetch, jsonHeaders } from "../core";
import type {
  AdminBillingInterest,
  AdminUser,
  AdminUserGraph,
  AdminUserMemory,
} from "../types/admin";
import type { TeamGraphView } from "../types/team";

export function adminGetUsers() {
  return apiFetch<AdminUser[]>("/api/admin/users");
}

export function adminGetBillingInterest() {
  return apiFetch<AdminBillingInterest>("/api/admin/billing/interest");
}

export function adminGetUserGraph(id: string, view: TeamGraphView = "daily") {
  const params = new URLSearchParams({ view });
  return apiFetch<AdminUserGraph>(`/api/admin/users/${id}/graph?${params}`);
}

export function adminGetUserMemory(id: string) {
  return apiFetch<AdminUserMemory>(`/api/admin/users/${id}/memory`);
}

export function adminSetPlan(
  id: string,
  body: {
    plan?: "free" | "premium";
    is_premium?: boolean;
    premium_until?: string | null;
  },
) {
  return apiFetch<AdminUser>(`/api/admin/users/${id}/plan`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
