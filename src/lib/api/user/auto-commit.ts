import { apiFetch, jsonHeaders } from "../core";
import type { AutoCommitJob, AutoCommitMeta } from "../types/auto-commit";

export function getAutoCommits() {
  return apiFetch<AutoCommitMeta>("/api/auto-commits");
}

export function createAutoCommit(body: {
  days_total: number;
  commits_per_day?: number;
  repo_full_name?: string;
}) {
  return apiFetch<AutoCommitJob>("/api/auto-commits", {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function patchAutoCommit(id: string, body: { commits_per_day: number }) {
  return apiFetch<null>(`/api/auto-commits/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function deleteAutoCommit(id: string) {
  return apiFetch<null>(`/api/auto-commits/${id}`, { method: "DELETE" });
}
