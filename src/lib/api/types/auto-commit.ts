export type AutoCommitJob = {
  id: string;
  user_id: string;
  repo_full_name: string;
  days_total: number;
  days_done: number;
  commits_per_day: number;
  next_commit_date: string;
  is_active: boolean;
  last_commit_at: string | null;
  created_at: string;
};

export type AutoCommitMeta = {
  jobs: AutoCommitJob[];
  is_premium: boolean;
  premium_until: string | null;
  monthly_used: number;
  monthly_limit: number;
  max_days: number;
  day_options: number[];
  commits_per_day_options: number[];
};
