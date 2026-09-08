export type KanbanStatus = string;

export type KanbanColumnRole = "todo" | "active" | "review" | "done" | "custom";

export type KanbanColumn = {
  id: string;
  board_id: string;
  key: string;
  label: string;
  position: number;
  color: string;
  role: KanbanColumnRole;
  created_at: string;
};

export type KanbanColumnInput = {
  key: string;
  label: string;
  position: number;
  color: string;
  role: KanbanColumnRole;
};

export type KanbanGithubState =
  | "none"
  | "branch_created"
  | "branch_pushed"
  | "pr_open"
  | "pr_merged"
  | "pr_closed";

export type KanbanCIStatus = "none" | "pending" | "success" | "failure";

export type KanbanPriority = "none" | "low" | "medium" | "high" | "urgent";

export type KanbanBoardRepo = {
  repo_full_name: string;
  installation_id: number;
  position: number;
};

export type KanbanBoard = {
  id: string;
  team_id: string;
  name: string;
  created_by: string;
  created_at: string;
  member_ids?: string[];
  repos?: KanbanBoardRepo[];
  columns?: KanbanColumn[];
};

export type KanbanBoardWebhook = {
  id: string;
  board_id: string;
  name: string;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  last_used_at?: string | null;
};

export type KanbanBoardWebhookCreated = KanbanBoardWebhook & {
  url: string;
  token: string;
};

export type KanbanBoardWebhookMessage = {
  id: string;
  board_id: string;
  webhook_id: string;
  content: string;
  sender_name: string;
  sender_avatar_url?: string;
  webhook_created_by: string;
  created_at: string;
};

export type KanbanBoardNote = {
  id: string;
  board_id: string;
  user_id: string;
  parent_id?: string | null;
  body: string;
  created_at: string;
  user_name?: string;
  user_avatar_url?: string;
  attachments?: KanbanNoteAttachment[];
  reactions?: KanbanReactionGroup[];
};

export type KanbanNoteAttachment = {
  id: string;
  note_id: string;
  file_name: string;
  file_url: string;
  content_type: string;
  size_bytes: number;
  uploaded_by: string;
  created_at: string;
  /** True when the workspace's files are locked: file_url is withheld until upgrade. */
  locked?: boolean;
};

export type KanbanTaskLabel = {
  id: string;
  task_id: string;
  name: string;
  color: string;
};

/** A board member assigned to a task. */
export type KanbanTaskAssignee = {
  user_id: string;
  user_name?: string;
  user_avatar_url?: string;
};

export type KanbanTask = {
  id: string;
  board_id: string;
  team_id: string;
  task_number: number;
  task_key?: string;
  title: string;
  description: string;
  status: KanbanStatus;
  position: number;
  assignee_id: string | null;
  /** All assignees. `assignee_id` remains the first assignee for compatibility. */
  assignee_ids?: string[];
  assignees?: KanbanTaskAssignee[];
  reporter_id: string;
  start_date: string | null;
  due_date: string | null;
  github_url: string;
  repo_full_name: string;
  branch_name: string;
  base_branch: string;
  branch_created_by?: string | null;
  branch_created_at?: string | null;
  branch_pushed_at?: string | null;
  pr_number: number;
  pr_url: string;
  github_state: KanbanGithubState;
  ci_status: KanbanCIStatus;
  github_issue_number: number;
  github_issue_url: string;
  watching?: boolean;
  priority: KanbanPriority;
  created_by: string;
  created_at: string;
  updated_at: string;
  assignee_name?: string;
  assignee_avatar_url?: string;
  reporter_name?: string;
  reporter_avatar_url?: string;
  labels?: KanbanTaskLabel[];
  parent_task_id?: string | null;
  parent_task_key?: string;
  parent_task_title?: string;
  involved_users?: KanbanTaskInvolvedUser[];
  /**
   * "YYYY-MM-DD" — the day the task last moved into a done column, from the
   * activity log. Only the timeline endpoint fills it; it closes the derived bar
   * of a task that carries no start/due date.
   */
  completed_at?: string | null;
};

export type KanbanTaskInvolvedUser = {
  user_id: string;
  user_name?: string;
  user_avatar_url?: string;
};

export type KanbanReactionUser = {
  user_id: string;
  user_name?: string;
};

export type KanbanReactionGroup = {
  emoji: string;
  count: number;
  users: KanbanReactionUser[];
  reacted_by_me: boolean;
};

export type KanbanTaskComment = {
  id: string;
  task_id: string;
  user_id: string;
  parent_id?: string | null;
  body: string;
  created_at: string;
  user_name?: string;
  user_avatar_url?: string;
  attachments?: KanbanTaskAttachment[];
  reactions?: KanbanReactionGroup[];
};

export type KanbanTaskAttachment = {
  id: string;
  task_id: string;
  comment_id?: string | null;
  file_name: string;
  file_url: string;
  content_type: string;
  size_bytes: number;
  uploaded_by: string;
  created_at: string;
  /** True when the workspace's files are locked: file_url is withheld until upgrade. */
  locked?: boolean;
};

export type KanbanCommentAttachmentInput = {
  file_url: string;
  file_name: string;
  content_type: string;
  size_bytes: number;
};

export type KanbanNoteAttachmentInput = KanbanCommentAttachmentInput;

export type KanbanTaskDetail = KanbanTask & {
  comments: KanbanTaskComment[];
  attachments: KanbanTaskAttachment[];
  description_reactions?: KanbanReactionGroup[];
};

export type KanbanTaskPatch = {
  title?: string;
  description?: string;
  status?: KanbanStatus;
  assignee_id?: string | null;
  /** Replaces the task's complete assignee list. */
  assignee_ids?: string[];
  clear_assignee?: boolean;
  start_date?: string | null;
  clear_start_date?: boolean;
  due_date?: string | null;
  clear_due_date?: boolean;
  github_url?: string;
  priority?: KanbanPriority;
  labels?: { name: string; color: string }[];
  /**
   * Deprecated: ignored server-side. Assignment always notifies once
   * (in-app + email/Slack when available), Jira-style.
   */
  notify_channels?: Array<"inapp" | "slack" | "email">;
  parent_task_id?: string | null;
  clear_parent_task?: boolean;
  github_issue_number?: number;
  github_issue_url?: string;
  clear_github_issue?: boolean;
};

export type KanbanBoardPrefs = {
  default_base_branch: string;
};

export const KANBAN_PRIORITIES: {
  value: KanbanPriority;
  label: string;
  color: string;
}[] = [
  { value: "none", label: "None", color: "#64748b" },
  { value: "low", label: "Low", color: "#3b82f6" },
  { value: "medium", label: "Medium", color: "#eab308" },
  { value: "high", label: "High", color: "#f97316" },
  { value: "urgent", label: "Urgent", color: "#ef4444" },
];

export const DEFAULT_KANBAN_COLUMNS: KanbanColumnInput[] = [
  { key: "task", label: "Task", position: 0, color: "#6366f1", role: "todo" },
  { key: "in_progress", label: "In Work", position: 1, color: "#f59e0b", role: "active" },
  { key: "in_review", label: "In Review", position: 2, color: "#8b5cf6", role: "review" },
  { key: "complete", label: "Complete", position: 3, color: "#22c55e", role: "done" },
];

/** @deprecated Use board.columns from API */
export const KANBAN_COLUMNS: { status: KanbanStatus; label: string }[] = DEFAULT_KANBAN_COLUMNS.map(
  (c) => ({ status: c.key, label: c.label }),
);

export function kanbanColumnLabel(columns: KanbanColumn[] | undefined, status: string): string {
  return columns?.find((c) => c.key === status)?.label ?? status;
}

export function kanbanPriorityMeta(priority?: KanbanPriority | string) {
  const p = (priority ?? "none") as KanbanPriority;
  return KANBAN_PRIORITIES.find((x) => x.value === p) ?? KANBAN_PRIORITIES[0];
}

export function taskHasLinkedBranch(task: KanbanTask): boolean {
  return !!task.branch_name?.trim();
}

/** Branch was created via the board (drag dialog or API), not manual git. */
export function taskHasBoardBranch(task: KanbanTask): boolean {
  if (!task.branch_name?.trim() || !task.repo_full_name?.trim()) return false;
  return task.github_state === "branch_created" || task.github_state === "branch_pushed";
}

export function taskHasOpenPR(task: KanbanTask): boolean {
  return task.pr_number > 0 && task.github_state === "pr_open";
}

export function taskHasMergedPR(task: KanbanTask): boolean {
  return task.github_state === "pr_merged";
}

export function taskCIStatusColor(status?: KanbanCIStatus | string): string | null {
  switch (status) {
    case "success":
      return "#22c55e";
    case "failure":
      return "#ef4444";
    case "pending":
      return "#eab308";
    default:
      return null;
  }
}

export function taskCanCreatePRFromBoard(task: KanbanTask): boolean {
  return taskHasBoardBranch(task) && !taskHasOpenPR(task);
}

export function taskParentLabel(task: KanbanTask): string | null {
  if (!task.parent_task_id) return null;
  const key = task.parent_task_key?.trim();
  const title = task.parent_task_title?.trim();
  if (key && title) return `${key} · ${title}`;
  return key || title || null;
}

export function taskBranchReadyForPR(task: KanbanTask): boolean {
  return task.github_state === "branch_pushed";
}

export type KanbanTimelineParams = {
  board_id?: string;
  assignee_id?: string;
  from?: string;
  to?: string;
};

export type KanbanTimelineBoard = {
  id: string;
  name: string;
};

export type KanbanTimeline = {
  tasks: KanbanTask[];
  boards: KanbanTimelineBoard[];
};

export type KanbanEventType =
  | "created"
  | "moved"
  | "assigned"
  | "unassigned"
  | "start_date"
  | "due_date"
  | "priority"
  | "renamed";

/** One entry in a task's activity history. */
export type KanbanTaskEvent = {
  id: string;
  task_id: string;
  board_id: string;
  actor_id: string | null;
  actor_name?: string;
  actor_avatar_url?: string;
  type: KanbanEventType;
  /** Raw stored values (column key, user id, date, priority, title). */
  from_value: string;
  to_value: string;
  /** Server-resolved display labels; empty when the value has no label to resolve. */
  from_label?: string;
  to_label?: string;
  created_at: string;
};
