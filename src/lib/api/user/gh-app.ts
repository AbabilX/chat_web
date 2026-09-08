import { apiFetch } from "../core";
import type { GhAppEvent, GhAppInstallation } from "../types/gh-app";

export function getGhAppInstallations() {
  return apiFetch<GhAppInstallation[]>("/api/gh-app/installations");
}

export function getGhAppEvents(repo?: string, limit = 50) {
  const params = new URLSearchParams();
  if (repo) params.set("repo", repo);
  params.set("limit", String(limit));
  return apiFetch<GhAppEvent[]>(`/api/gh-app/events?${params.toString()}`);
}
