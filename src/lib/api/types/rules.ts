export type Rule = {
  id: string;
  user_id: string;
  name: string;
  channel_id: string;
  channel_name: string;
  example_message: string;
  days_of_week: number[];
  send_time: string;
  timezone: string;
  is_active: boolean;
  last_sent_at: string | null;
  run_mode: "loop" | "once";
  repo_full_name: string;
  branch: string;
  repo_targets: { repo_full_name: string; branch: string }[];
  target_date: string;
  date_mode: "today" | "specific";
  github_enabled?: boolean;
  post_when_empty: boolean;
  thread_enabled: boolean;
  thread_style: "count" | "ai" | "date" | "";
  thread_example_message: string;
  thread_count_format: "number" | "date" | "date_custom";
  thread_count_custom: string;
  thread_ts: string;
  thread_count: number;
  note: string;
  share_note_with_team?: boolean;
  email_on_send?: boolean;
  send_as_user?: boolean;
  created_at: string;
  updated_at: string;
};

export type RuleMessageCommit = {
  Repo: string;
  SHA: string;
  Message: string;
  AuthorName: string;
  Date: string;
  URL: string;
};

export type RuleMessage = {
  id: string;
  rule_id: string;
  user_id: string;
  content: string;
  slack_ts: string;
  channel_id: string;
  commits: RuleMessageCommit[] | null;
  note_used: string;
  sent_at: string;
};

export type RuleMessagesPage = {
  messages: RuleMessage[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};
