import { apiFetch, jsonHeaders } from "../core";
import type { Commit, Repo, RepoOverview } from "../types/repos";

export function getRepos() {
  return apiFetch<Repo[]>("/api/repos");
}

export function getRepoOverviews(repos: string[]) {
  return apiFetch<RepoOverview[]>("/api/repos/overviews", {
    method: "POST",
    body: JSON.stringify({ repos }),
    headers: jsonHeaders,
  });
}

export function getCommits(owner: string, repo: string, page = 1) {
  return apiFetch<Commit[]>(`/api/repos/${owner}/${repo}/commits?page=${page}`);
}

export function getRepoBranches(owner: string, repo: string) {
  return apiFetch<string[]>(`/api/repos/${owner}/${repo}/branches`);
}
