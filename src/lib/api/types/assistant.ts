export type AIActionType =
  | "mark_task_done"
  | "move_task_status"
  | "open_task"
  | "create_task"
  | "draft_reply";

export type AIAction = {
  type: AIActionType;
  task_id?: string;
  board_id?: string;
  status?: string;
  title?: string;
  conversation_id?: string;
  draft?: string;
  label: string;
};

export type AISearchHitSource =
  | "dm"
  | "channel"
  | "wall_post"
  | "wall_comment"
  | "task_comment"
  | "task";

export type AISearchHit = {
  source: AISearchHitSource;
  conversation_id?: string;
  message_id?: string;
  anchor_id?: string;
  post_id?: string;
  task_id?: string;
  board_id?: string;
  label: string;
  author_name: string;
  snippet: string;
  created_at: string;
};

export type AIActionState =
  | "pending"
  | "confirmed"
  | "dismissed"
  | "done"
  | "failed"
  | null;

export type AIMessageKind = "chat" | "proactive" | "action";
export type AIMessageRole = "user" | "assistant";

export type AIMessage = {
  id: string;
  user_id: string;
  role: AIMessageRole;
  kind: AIMessageKind;
  body: string;
  action: AIAction | null;
  action_state: AIActionState;
  read: boolean;
  created_at: string;
};

export type AIStatus = {
  enabled: boolean;
  premium: boolean;
  unread: number;
  /** Chat count in the current 2h usage window (key kept for compatibility). */
  used_today: number;
  /** Per-window cap (key kept for compatibility). */
  daily_cap: number;
  /** Seconds until the current usage window resets. */
  cap_resets_in_seconds?: number;
};
