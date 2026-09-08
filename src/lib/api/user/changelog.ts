import { apiFetch, jsonHeaders } from "../core";
import type { Changelog, PaginatedChangelogs } from "../types/changelog";

export function getPublicChangelogs(page: number, limit = 10) {
  return apiFetch<PaginatedChangelogs>(`/api/changelog?page=${page}&limit=${limit}`);
}

export function createAdminChangelog(cl: Omit<Changelog, "id" | "created_at">) {
  return apiFetch<Changelog>("/api/admin/changelog", {
    method: "POST",
    body: JSON.stringify(cl),
    headers: jsonHeaders,
  });
}
