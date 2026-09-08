export type AttendanceStatus =
  | "pending"
  | "present"
  | "absent"
  | "off_day_worked"
  | "off_day_skipped";

/**
 * How a workspace measures attendance.
 * - `schedule`: office time accrues from the configured window, open app or not.
 * - `online`: time accrues only while the member is connected, still capped by the
 *   window, and stops at `daily_target_minutes`.
 */
export type AttendanceTrackingMode = "schedule" | "online";

export interface AttendanceSettings {
  team_id: string;
  enabled: boolean;
  tracking_mode: AttendanceTrackingMode;
  daily_target_minutes: number;
  online_grace_minutes: number;
  start_time: string;
  end_time: string;
  timezone: string;
  working_days: number;
  max_extend_minutes: number;
  leader_self_tracked: boolean;
  updated_at: string;
}

export interface AttendanceOffDay {
  id: string;
  team_id: string;
  off_date: string;
  note: string;
  created_by?: string;
  created_at: string;
}

export interface AttendanceDailyRecord {
  id: string;
  team_id: string;
  user_id: string;
  record_date: string;
  status: AttendanceStatus;
  is_off_day: boolean;
  verified_at?: string | null;
  clock_start?: string | null;
  clock_end?: string | null;
  base_seconds: number;
  extend_seconds: number;
  extension_allowance_seconds: number;
  total_extend_minutes_used: number;
  last_heartbeat_at?: string | null;
  last_online_at?: string | null;
  locked: boolean;
}

export interface AttendanceStatusResponse {
  enabled: boolean;
  date: string;
  server_now?: string;
  is_off_day: boolean;
  is_working_day: boolean;
  tracking_disabled: boolean;
  show_ready_popup: boolean;
  /**
   * Today has not been started yet and is worth asking about — a scheduled working
   * day inside the office window. Off-days never set this; they can still be
   * started by hand.
   */
  needs_start: boolean;
  /** The start action would succeed right now. */
  can_start: boolean;
  counting: boolean;
  tracking_mode: AttendanceTrackingMode;
  daily_target_seconds: number;
  target_met: boolean;
  settings: AttendanceSettings;
  office_start_at?: string;
  office_end_at?: string;
  record: AttendanceDailyRecord | null;
  elapsed_seconds?: number;
  extend_minutes_used?: number;
  extend_minutes_remaining?: number;
  extension_remaining_seconds?: number;
}

export interface AttendanceLiveMember {
  user_id: string;
  name: string;
  username: string;
  avatar_url?: string;
  role: string;
  status: AttendanceStatus;
  is_off_day: boolean;
  verified_at?: string | null;
  clock_start?: string | null;
  elapsed_seconds: number;
  locked: boolean;
  online_now: boolean;
  self_tracked: boolean;
  is_premium?: boolean;
}

export interface AttendanceLiveResponse {
  date: string;
  office_start: string;
  office_end: string;
  timezone: string;
  tracking_mode: AttendanceTrackingMode;
  daily_target_seconds: number;
  members: AttendanceLiveMember[];
}

export interface AttendanceTeamTimelineEntry {
  id: string;
  user_id: string;
  name: string;
  username: string;
  avatar_url?: string;
  title: string;
  started_at: string;
  ended_at: string;
  source: "work_log" | "focus";
}

export interface AttendanceTeamTimelineResponse {
  date: string;
  office_start: string;
  office_end: string;
  timezone: string;
  entries: AttendanceTeamTimelineEntry[];
}

export interface AttendanceHistoryResponse {
  month: string;
  records: AttendanceDailyRecord[];
}

export interface AttendanceTeamSummaryMember {
  user_id: string;
  name: string;
  username: string;
  role: string;
  total_seconds: number;
  present_days: number;
  absent_days: number;
  off_day_worked_days: number;
  /** Days worked but finished under the daily target. Always 0 in schedule mode. */
  short_days: number;
}

export interface AttendanceTeamSummaryResponse {
  month: string;
  tracking_mode: AttendanceTrackingMode;
  daily_target_seconds: number;
  members: AttendanceTeamSummaryMember[];
}

export interface AttendanceWorkLog {
  id: string;
  team_id: string;
  user_id: string;
  record_date: string;
  daily_record_id?: string | null;
  title: string;
  description: string;
  started_at: string;
  ended_at: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceWorkLogResponse {
  date: string;
  user_id: string;
  editable: boolean;
  entries: AttendanceWorkLog[];
  settings?: AttendanceSettings;
}

export type AttendanceFocusStatus = "active" | "completed" | "stopped";

export interface AttendanceFocusSession {
  id: string;
  team_id: string;
  user_id: string;
  daily_record_id: string;
  record_date: string;
  title: string;
  planned_minutes: number;
  proof_url?: string;
  proof_file_name?: string;
  proof_mime_type?: string;
  proof_size_bytes?: number;
  started_at: string;
  ended_at?: string | null;
  status: AttendanceFocusStatus;
  created_at: string;
  updated_at: string;
}

export interface AttendanceFocusSessionsResponse {
  sessions: AttendanceFocusSession[];
}
