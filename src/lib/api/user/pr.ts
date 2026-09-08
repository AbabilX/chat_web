import { apiFetch, jsonHeaders } from "../core";
import type {
  CheckRun,
  PRComment,
  PRCommitSummary,
  PRFile,
  PRReview,
  PRSummary,
  PullRequest,
  PullRequestDetail,
} from "../types/pr";

export function getPulls(
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open",
) {
  return apiFetch<PullRequest[]>(
    `/api/repos/${owner}/${repo}/pulls?state=${state}`,
  );
}

export function getPullDetail(owner: string, repo: string, n: number) {
  return apiFetch<PullRequestDetail>(
    `/api/repos/${owner}/${repo}/pulls/${n}`,
  );
}

export function getPullFiles(owner: string, repo: string, n: number) {
  return apiFetch<PRFile[]>(`/api/repos/${owner}/${repo}/pulls/${n}/files`);
}

export function getPullCommits(owner: string, repo: string, n: number) {
  return apiFetch<PRCommitSummary[]>(
    `/api/repos/${owner}/${repo}/pulls/${n}/commits`,
  );
}

export function getPullReviews(owner: string, repo: string, n: number) {
  return apiFetch<PRReview[]>(
    `/api/repos/${owner}/${repo}/pulls/${n}/reviews`,
  );
}

export function getPullComments(owner: string, repo: string, n: number) {
  return apiFetch<PRComment[]>(
    `/api/repos/${owner}/${repo}/pulls/${n}/comments`,
  );
}

export function getPullChecks(owner: string, repo: string, n: number) {
  return apiFetch<CheckRun[]>(`/api/repos/${owner}/${repo}/pulls/${n}/checks`);
}

export function getPullAISummary(owner: string, repo: string, n: number) {
  return apiFetch<PRSummary>(
    `/api/repos/${owner}/${repo}/pulls/${n}/summary`,
  );
}

export function getPullSummaries(owner: string, repo: string) {
  return apiFetch<PRSummary[]>(
    `/api/repos/${owner}/${repo}/pulls/summaries`,
  );
}

export function submitPullReview(
  owner: string,
  repo: string,
  n: number,
  body: { event: "APPROVE" | "REQUEST_CHANGES" | "COMMENT"; body: string },
) {
  return apiFetch<null>(`/api/repos/${owner}/${repo}/pulls/${n}/reviews`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function mergePull(
  owner: string,
  repo: string,
  n: number,
  method: "merge" | "squash" | "rebase" = "merge",
) {
  return apiFetch<null>(`/api/repos/${owner}/${repo}/pulls/${n}/merge`, {
    method: "PUT",
    body: JSON.stringify({ method }),
    headers: jsonHeaders,
  });
}

export function setPullState(
  owner: string,
  repo: string,
  n: number,
  state: "open" | "closed",
) {
  return apiFetch<null>(`/api/repos/${owner}/${repo}/pulls/${n}/state`, {
    method: "PATCH",
    body: JSON.stringify({ state }),
    headers: jsonHeaders,
  });
}

export function postPullComment(
  owner: string,
  repo: string,
  n: number,
  body: string,
) {
  return apiFetch<null>(`/api/repos/${owner}/${repo}/pulls/${n}/comments`, {
    method: "POST",
    body: JSON.stringify({ body }),
    headers: jsonHeaders,
  });
}

export function postPullInlineComment(
  owner: string,
  repo: string,
  n: number,
  body: {
    sha: string;
    path: string;
    line: number;
    side?: "LEFT" | "RIGHT";
    body: string;
  },
) {
  return apiFetch<null>(
    `/api/repos/${owner}/${repo}/pulls/${n}/comments/inline`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: jsonHeaders,
    },
  );
}
