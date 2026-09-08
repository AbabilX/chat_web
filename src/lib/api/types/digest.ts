export type DigestRepoTarget = {
  repo_full_name: string;
  branches: string[]; // empty = default branch
};

export type WeeklyDigestConfig = {
  id: string;
  user_id: string;
  day_of_week: number;
  send_time: string;
  timezone: string;
  is_active: boolean;
  language: "en" | "bn";
  repos: string[]; // backward-compat: flat list of repo full names
  repo_targets: DigestRepoTarget[]; // preferred: per-repo branch targets
  deliver_slack: boolean;
  slack_channel_id: string;
  slack_channel_name: string;
  deliver_discord: boolean;
  window_start_day: number;
  window_end_day: number;
  last_repo_change_at: string | null;
  last_day_change_at: string | null;
  last_generated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DigestLimits = {
  max_repos: number;
  max_branches_per_repo: number;
  repo_cooldown_seconds: number;
  day_cooldown_seconds: number;
  delivery_enabled: boolean;
  schedule_timezone_enabled?: boolean;
};

export type DigestConfigResponse = {
  config: WeeklyDigestConfig | null;
  plan: "free" | "premium";
  limits: DigestLimits;
};

export type DigestCommit = {
  repo: string;
  message: string;
  sha: string;
  url: string;
  date: string;
};

export type DigestDay = {
  date: string;
  summary: string;
  commit_count: number;
  commits: DigestCommit[];
};

export type WeeklyDigest = {
  id: string;
  user_id: string;
  config_id: string;
  period_start: string;
  period_end: string;
  summary: string;
  days: DigestDay[];
  repo_count: number;
  commit_count: number;
  source: "scheduled" | "manual";
  generated_at: string;
};

export type DigestConfigInput = {
  day_of_week: number;
  send_time: string;
  timezone: string;
  is_active: boolean;
  language: "en" | "bn";
  repos: string[]; // backward compat
  repo_targets: DigestRepoTarget[]; // preferred
  deliver_slack: boolean;
  slack_channel_id: string;
  slack_channel_name: string;
  deliver_discord: boolean;
  window_start_day: number;
  window_end_day: number;
};
