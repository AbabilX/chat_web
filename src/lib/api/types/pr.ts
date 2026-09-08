export type PullRequest = {
  number: number;
  title: string;
  state: "open" | "closed";
  draft: boolean;
  html_url: string;
  user_login: string;
  user_avatar: string;
  head: string;
  base: string;
  comments: number;
  created_at: string;
  updated_at: string;
};

export type PullRequestDetail = PullRequest & {
  body: string;
  head_sha: string;
  mergeable: boolean | null;
  mergeable_state: string;
  additions: number;
  deletions: number;
  changed_files: number;
  commits_count: number;
  merged: boolean;
};

export type PRFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch: string;
  blob_url: string;
};

export type PRReview = {
  id: number;
  user_login: string;
  user_avatar: string;
  state: string;
  body: string;
  submitted_at: string;
  html_url: string;
};

export type PRComment = {
  id: number;
  user_login: string;
  user_avatar: string;
  body: string;
  created_at: string;
  path: string;
  line: number;
  kind: "issue" | "review";
  html_url: string;
};

export type CheckRun = {
  name: string;
  status: string;
  conclusion: string;
  html_url: string;
};

export type PRCommitSummary = {
  sha: string;
  message: string;
  author: string;
  avatar_url: string;
  date: string;
  html_url: string;
};

export type PRSummary = {
  number?: number;
  head_sha: string;
  overview: string;
  bullets: string[];
  commit_count: number;
  generated_at: string;
  cached: boolean;
  error?: string;
};
