import type { DigestRepoTarget } from "./digest";

export type TeamRole = "leader" | "manager" | "member";

export type Team = {
  id: string;
  owner_user_id: string;
  name: string;
  avatar_url?: string;
  overview_repo_full_name?: string;
  manager_role_label?: string;
  /** Seats covered by the last approved team payment. */
  paid_seats?: number;
  created_at: string;
};

export type TeamRolePermissions = {
  kanban_admin: boolean;
  wall_moderation: boolean;
  attendance_settings: boolean;
  digest_config: boolean;
  team_settings_edit: boolean;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  status: "active" | "frozen";
  joined_at: string;
  name?: string;
  username?: string;
  github_username?: string;
  avatar_url?: string;
  email?: string;
  tags?: string[];
  is_premium?: boolean;
};

export type TeamDailyFeedMember = {
  user_id: string;
  name?: string;
  username?: string;
  github_username?: string;
  avatar_url?: string;
  role: string;
  status: string;
  tags: string[];
  message_text: string;
  is_late: boolean;
  submitted_at?: string;
  has_update: boolean;
};

export type TeamDailyFeedResponse = {
  date: string;
  members: TeamDailyFeedMember[];
};

export const TEAM_MEMBER_TAG_PRESETS = [
  "Frontend",
  "Backend",
  "DevOps",
  "Design",
  "QA",
  "PM",
  "Data",
] as const;

export type TeamInvite = {
  id: string;
  team_id: string;
  team_name?: string;
  invited_email: string;
  invited_user_id: string;
  invited_by: string;
  inviter_name?: string;
  status: string;
  created_at: string;
};

export type TeamStorageByFeature = {
  wall: number;
  chat: number;
  tasks: number;
  notes: number;
  crm: number;
  attendance: number;
};

export type TeamStorageByType = {
  images: number;
  documents: number;
  videos: number;
  other: number;
};

export type TeamStorageBreakdown = {
  by_feature: TeamStorageByFeature;
  by_type: TeamStorageByType;
};

export type TeamDetail = {
  team: Team | null;
  members: TeamMember[];
  repos: DigestRepoTarget[];
  my_role: TeamRole | "";
  role_permissions?: TeamRolePermissions;
  total_attachment_size?: number;
  storage_breakdown?: TeamStorageBreakdown;
  storage_limit_bytes?: number;
  premium_storage_limit_bytes?: number;
  team_is_premium?: boolean;
  team_premium_until?: string | null;
  /** Acting member's resolved per-module grants (keyed by module, e.g. "crm"). */
  module_permissions?: Record<string, ModuleActions>;
  /** Acting member's per-member CRM allowlist status (leader/manager implicit). */
  crm_access?: boolean;
  /** True when this member's rank exceeds paid_seats on a premium team. */
  viewer_frozen?: boolean;
  /** How many members currently exceed paid_seats (leader billing banner). */
  pending_seat_count?: number;
  /** Free-plan uploaded-file deletion clock (disabled on premium). */
  file_retention?: TeamFileRetention;
  /** Free-plan monthly group-call allowance (unlimited on premium). */
  call_quota?: TeamCallQuota;
};

/**
 * Free-plan CHANNEL group-call allowance (mirrors backend models.TeamCallQuota).
 *
 * A minute is a ROOM minute — the wall-clock length of the call, whatever the
 * headcount. DM 1:1 voice calls are peer-to-peer and are never metered, on any
 * plan. Running out blocks NEW calls only: a call already live runs to its end
 * and other members can still join it. Premium workspaces get `unlimited: true`
 * and no numbers.
 */
export type TeamCallQuota = {
  unlimited: boolean;
  /** Monthly allowance in minutes (0 when unlimited). */
  limit_minutes: number;
  /** Minutes spent this period, rounded up, including any call in progress. */
  used_minutes: number;
  /** Minutes left, rounded down. 0 once exhausted. */
  remaining_minutes: number;
  /** True once starting a new group call is refused. */
  exhausted: boolean;
  /** Current period, and when the minutes come back. */
  period_start: string;
  period_end: string;
};

/** Retention stage of a workspace's uploaded files. */
export type TeamFileRetentionState = "unlocked" | "active" | "locked";

/**
 * Free-plan workspace FILE retention (mirrors backend models.TeamFileRetention).
 *
 * Two stages on one clock: uploads stay usable until `lock_at`, are withheld but
 * still stored between `lock_at` and `purge_at` (upgrading brings them straight
 * back), and are permanently deleted at `purge_at`. Written content — messages,
 * tasks, posts, attendance, CRM records — is never hidden or deleted. Premium
 * teams get `enabled: false`.
 */
export type TeamFileRetention = {
  enabled: boolean;
  state: TeamFileRetentionState;
  /** True while uploaded files are withheld (same as state === "locked"). */
  locked: boolean;
  lock_months: number;
  purge_months: number;
  lock_warn_days: number;
  lock_at?: string | null;
  purge_at?: string | null;
  days_to_lock: number;
  days_to_purge: number;
  in_warning_window: boolean;
  last_file_purge_at?: string | null;
};

/** Per-module permission set granted to a role (mirrors backend models.ModuleActions). */
export type ModuleActions = {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  configure: boolean;
};

export type PaymentStatus = "pending" | "approved" | "on_hold" | "rejected";

export type PaymentRequest = {
  id: string;
  team_id: string;
  user_id: string;
  method: string;
  sender_number: string;
  trx_id: string;
  amount_bdt: number;
  seats: number;
  months: number;
  status: PaymentStatus;
  review_message: string;
  reviewed_by?: string;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields (admin list only)
  team_name?: string;
  submitter_name?: string;
  submitter_email?: string;
  submitter_avatar?: string;
};

export type TeamPaymentStatusResponse = {
  request: PaymentRequest | null;
  seats: number;
  seat_price_bdt: number;
  method: string;
  receive_number: string;
  team_is_premium: boolean;
  team_premium_until: string | null;
};

export type AdminPaymentList = {
  entries: PaymentRequest[] | null;
  seat_price_bdt: number;
};

export type InviteLookupUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  github_username: string;
  avatar_url: string;
};

export type InviteLookupResponse = {
  found: boolean;
  user?: InviteLookupUser;
};

export type TeamGraphPeriodStat = {
  period_start: string;
  commit_count: number;
  pr_count: number;
  post_count: number;
  comment_count: number;
  task_count: number;
  daily_update_count: number;
};

export type TeamGraphMember = {
  user_id: string;
  name: string;
  github_username: string;
  avatar_url: string;
  status: string;
  series: TeamGraphPeriodStat[];
};

export type TeamGraphView = "daily" | "weekly" | "monthly";

export type TeamGraphMetric =
  | "commits"
  | "prs"
  | "posts"
  | "comments"
  | "tasks"
  | "daily_updates"
  | "total";

export type TeamGraphSyncStatus = {
  stage: string;
  message: string;
  context?: string;
  done: number;
  total: number;
};

export type TeamGraphResponse = {
  view?: TeamGraphView;
  periods?: string[];
  labels?: string[];
  weeks: string[];
  members: TeamGraphMember[];
  refreshed_at?: string;
  refreshing?: boolean;
  sync_status?: TeamGraphSyncStatus;
};

export type TeamMemberWeeklyStat = {
  id: string;
  team_id: string;
  user_id: string;
  period_start: string;
  commit_count: number;
  pr_count: number;
  days: {
    date: string;
    summary: string;
    commit_count: number;
    commits: { repo: string; message: string; sha: string; url: string; date: string }[];
  }[];
  summary: string;
  updated_at: string;
  name?: string;
  username?: string;
};

export type TeamDigestConfig = {
  id?: string;
  team_id: string;
  day_of_week: number;
  send_time: string;
  timezone: string;
  is_active: boolean;
  language: string;
  window_start_day: number;
  window_end_day: number;
  deliver_member_email: boolean;
  deliver_slack: boolean;
  slack_channel_id: string;
  slack_channel_name: string;
  external_emails: string[];
  last_generated_at?: string | null;
  last_delivered_at?: string | null;
};

export type TeamDigestLimits = {
  max_repos: number;
  max_branches_per_repo: number;
};

export type TeamDigestConfigResponse = {
  config: TeamDigestConfig | null;
  repos: import("./digest").DigestRepoTarget[];
  my_role: string;
  team: Team;
  leader_github_connected?: boolean;
  limits?: TeamDigestLimits;
};

export type TeamMemberDigest = {
  id?: string;
  team_id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  summary: string;
  days: {
    date: string;
    summary: string;
    commit_count: number;
    commits: { repo: string; message: string; sha: string; url: string; date: string }[];
  }[];
  commit_count: number;
  pr_count: number;
  repo_count: number;
  name?: string;
  username?: string;
  github_username?: string;
  avatar_url?: string;
  member_notes?: string;
};

export type TeamDigestResponse = {
  period_start: string;
  period_end: string;
  members: TeamMemberDigest[];
};

export type TeamDigestRun = {
  id: string;
  team_id: string;
  period_start: string;
  period_end: string;
  source: string;
  generated_at: string;
};

export type TeamDigestConfigInput = Omit<TeamDigestConfig, "id" | "team_id" | "last_generated_at" | "last_delivered_at">;
