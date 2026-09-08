import { apiFetch } from "../core";
import type { OverviewActivityResponse, OverviewStats } from "../types/overview";

export function getOverviewStats() {
  return apiFetch<OverviewStats>("/api/overview/stats");
}

export function getOverviewActivity(limit = 5) {
  return apiFetch<OverviewActivityResponse>(`/api/overview/activity?limit=${limit}`);
}
