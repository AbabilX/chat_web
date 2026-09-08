import { apiFetch } from "../core";
import type { GitHubUser } from "../types/repos";

export function getUser() {
  return apiFetch<GitHubUser>("/api/github/user");
}

export function disconnectGitHub() {
  return apiFetch<{ github_connected: boolean }>("/api/github/disconnect", {
    method: "POST",
  });
}
