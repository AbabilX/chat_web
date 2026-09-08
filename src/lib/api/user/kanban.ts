import { apiFetch, jsonHeaders } from "../core";
import { friendlyError } from "../error-messages";
import type {
  KanbanBoard,
  KanbanBoardNote,
  KanbanBoardWebhook,
  KanbanBoardWebhookCreated,
  KanbanBoardWebhookMessage,
  KanbanColumn,
  KanbanColumnInput,
  KanbanReactionGroup,
  KanbanStatus,
  KanbanTask,
  KanbanTaskAttachment,
  KanbanTaskComment,
  KanbanTaskDetail,
  KanbanTaskEvent,
  KanbanTaskPatch,
  KanbanTimeline,
  KanbanTimelineParams,
  KanbanCommentAttachmentInput,
  KanbanNoteAttachmentInput,
} from "../types/kanban";

export function formatKanbanUploadError(error: unknown) {
  return friendlyError(error, "Upload failed");
}

export function listKanbanBoards() {
  return apiFetch<KanbanBoard[]>("/api/teams/kanban/boards");
}

export function createKanbanBoard(name: string, memberIds: string[]) {
  return apiFetch<KanbanBoard>("/api/teams/kanban/boards", {
    method: "POST",
    body: JSON.stringify({ name, member_ids: memberIds }),
    headers: jsonHeaders,
  });
}

export function renameKanbanBoard(boardId: string, name: string) {
  return apiFetch<KanbanBoard>(`/api/teams/kanban/boards/${boardId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
    headers: jsonHeaders,
  });
}

export function updateKanbanBoardMembers(boardId: string, memberIds: string[]) {
  return apiFetch<KanbanBoard>(`/api/teams/kanban/boards/${boardId}`, {
    method: "PATCH",
    body: JSON.stringify({ member_ids: memberIds }),
    headers: jsonHeaders,
  });
}

export function deleteKanbanBoard(boardId: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/kanban/boards/${boardId}`, {
    method: "DELETE",
  });
}

export function leaveKanbanBoard(boardId: string) {
  return apiFetch<{ ok: boolean; deleted: boolean }>(
    `/api/teams/kanban/boards/${boardId}/leave`,
    { method: "POST", headers: jsonHeaders },
  );
}

export function listKanbanBoardColumns(boardId: string) {
  return apiFetch<KanbanColumn[]>(`/api/teams/kanban/boards/${boardId}/columns`);
}

export function setKanbanBoardColumns(boardId: string, columns: KanbanColumnInput[]) {
  return apiFetch<KanbanColumn[]>(`/api/teams/kanban/boards/${boardId}/columns`, {
    method: "PUT",
    body: JSON.stringify({ columns }),
    headers: jsonHeaders,
  });
}

export function deleteKanbanBoardColumn(boardId: string, key: string, moveToKey: string) {
  return apiFetch<KanbanColumn[]>(`/api/teams/kanban/boards/${boardId}/columns/${encodeURIComponent(key)}`, {
    method: "DELETE",
    body: JSON.stringify({ move_to_key: moveToKey }),
    headers: jsonHeaders,
  });
}

export function listKanbanTasks(boardId: string, q?: string, assigneeId?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (assigneeId) params.set("assignee_id", assigneeId);
  const qs = params.toString();
  return apiFetch<KanbanTask[]>(
    `/api/teams/kanban/boards/${boardId}/tasks${qs ? `?${qs}` : ""}`,
  );
}

export function getKanbanTimeline(params: KanbanTimelineParams = {}) {
  const qs = new URLSearchParams();
  if (params.board_id) qs.set("board_id", params.board_id);
  if (params.assignee_id) qs.set("assignee_id", params.assignee_id);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  const s = qs.toString();
  return apiFetch<KanbanTimeline>(`/api/teams/kanban/timeline${s ? `?${s}` : ""}`);
}

export function listKanbanTaskEvents(taskId: string) {
  return apiFetch<KanbanTaskEvent[]>(`/api/teams/kanban/tasks/${taskId}/events`);
}

export function createKanbanTask(boardId: string, title: string) {
  return apiFetch<KanbanTask>(`/api/teams/kanban/boards/${boardId}/tasks`, {
    method: "POST",
    body: JSON.stringify({ title }),
    headers: jsonHeaders,
  });
}

export function getKanbanTask(taskId: string) {
  return apiFetch<KanbanTaskDetail>(`/api/teams/kanban/tasks/${taskId}`);
}

export function patchKanbanTask(taskId: string, body: KanbanTaskPatch) {
  return apiFetch<KanbanTask>(`/api/teams/kanban/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function moveKanbanTask(taskId: string, status: KanbanStatus, position: number) {
  return apiFetch<KanbanTask>(`/api/teams/kanban/tasks/${taskId}/move`, {
    method: "PATCH",
    body: JSON.stringify({ status, position }),
    headers: jsonHeaders,
  });
}

export function deleteKanbanTask(taskId: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/kanban/tasks/${taskId}`, {
    method: "DELETE",
  });
}

export function createKanbanComment(
  taskId: string,
  body: string,
  opts?: {
    mentioned_user_ids?: string[];
    parent_id?: string;
    attachments?: KanbanCommentAttachmentInput[];
    also_send_dm?: boolean;
  },
) {
  return apiFetch<KanbanTaskComment>(`/api/teams/kanban/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify({
      body,
      ...(opts?.parent_id ? { parent_id: opts.parent_id } : {}),
      ...(opts?.attachments?.length ? { attachments: opts.attachments } : {}),
      ...(opts?.mentioned_user_ids?.length
        ? { mentioned_user_ids: opts.mentioned_user_ids }
        : {}),
      also_send_dm: opts?.also_send_dm ?? false,
    }),
    headers: jsonHeaders,
  });
}

export function deleteKanbanComment(taskId: string, commentId: string) {
  return apiFetch<{ ok: boolean }>(
    `/api/teams/kanban/tasks/${taskId}/comments/${commentId}`,
    { method: "DELETE" },
  );
}

export function updateKanbanComment(taskId: string, commentId: string, body: string) {
  return apiFetch<KanbanTaskComment>(
    `/api/teams/kanban/tasks/${taskId}/comments/${commentId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ body }),
      headers: jsonHeaders,
    },
  );
}

export function toggleKanbanReaction(
  taskId: string,
  emoji: string,
  commentId?: string,
) {
  return apiFetch<{ added: boolean; reactions: KanbanReactionGroup[] }>(
    `/api/teams/kanban/tasks/${taskId}/reactions`,
    {
      method: "POST",
      body: JSON.stringify({
        emoji,
        comment_id: commentId ?? null,
      }),
      headers: jsonHeaders,
    },
  );
}

export function presignKanbanAttachment(
  taskId: string,
  contentType: string,
  fileName: string,
  sizeBytes: number,
) {
  return apiFetch<{ upload_url: string; public_url: string; object_key: string }>(
    `/api/teams/kanban/tasks/${taskId}/attachments/presign`,
    {
      method: "POST",
      body: JSON.stringify({
        content_type: contentType,
        file_name: fileName,
        size_bytes: sizeBytes,
      }),
      headers: jsonHeaders,
    },
  );
}

export function discardKanbanUpload(taskId: string, fileUrl: string) {
  return apiFetch<{ ok: boolean }>(
    `/api/teams/kanban/tasks/${taskId}/attachments/discard`,
    {
      method: "POST",
      body: JSON.stringify({ file_url: fileUrl }),
      headers: jsonHeaders,
    },
  );
}

export function confirmKanbanAttachment(
  taskId: string,
  body: {
    file_url: string;
    file_name: string;
    content_type: string;
    size_bytes: number;
  },
) {
  return apiFetch<KanbanTaskAttachment>(
    `/api/teams/kanban/tasks/${taskId}/attachments`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: jsonHeaders,
    },
  );
}

export function deleteKanbanAttachment(taskId: string, attachmentId: string) {
  return apiFetch<{ ok: boolean }>(
    `/api/teams/kanban/tasks/${taskId}/attachments/${attachmentId}`,
    { method: "DELETE" },
  );
}

export function listKanbanBoardNotes(boardId: string) {
  return apiFetch<KanbanBoardNote[]>(`/api/teams/kanban/boards/${boardId}/notes`);
}

export function createKanbanBoardNote(
  boardId: string,
  body: string,
  opts?: {
    parent_id?: string;
    attachments?: KanbanNoteAttachmentInput[];
    mentioned_user_ids?: string[];
  },
) {
  return apiFetch<KanbanBoardNote>(`/api/teams/kanban/boards/${boardId}/notes`, {
    method: "POST",
    body: JSON.stringify({
      body,
      ...(opts?.parent_id ? { parent_id: opts.parent_id } : {}),
      ...(opts?.attachments?.length ? { attachments: opts.attachments } : {}),
      ...(opts?.mentioned_user_ids?.length
        ? { mentioned_user_ids: opts.mentioned_user_ids }
        : {}),
    }),
    headers: jsonHeaders,
  });
}

export function updateKanbanBoardNote(boardId: string, noteId: string, body: string) {
  return apiFetch<KanbanBoardNote>(`/api/teams/kanban/boards/${boardId}/notes/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify({ body }),
    headers: jsonHeaders,
  });
}

export function deleteKanbanBoardNote(boardId: string, noteId: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/kanban/boards/${boardId}/notes/${noteId}`, {
    method: "DELETE",
  });
}

export function toggleKanbanNoteReaction(boardId: string, noteId: string, emoji: string) {
  return apiFetch<{ added: boolean; reactions: KanbanReactionGroup[] }>(
    `/api/teams/kanban/boards/${boardId}/notes/${noteId}/reactions`,
    {
      method: "POST",
      body: JSON.stringify({ emoji }),
      headers: jsonHeaders,
    },
  );
}

export function presignKanbanNoteAttachment(
  boardId: string,
  contentType: string,
  fileName: string,
  sizeBytes: number,
) {
  return apiFetch<{ upload_url: string; public_url: string; object_key: string }>(
    `/api/teams/kanban/boards/${boardId}/notes/attachments/presign`,
    {
      method: "POST",
      body: JSON.stringify({
        content_type: contentType,
        file_name: fileName,
        size_bytes: sizeBytes,
      }),
      headers: jsonHeaders,
    },
  );
}

export function discardKanbanNoteUpload(boardId: string, fileUrl: string) {
  return apiFetch<{ ok: boolean }>(
    `/api/teams/kanban/boards/${boardId}/notes/attachments/discard`,
    {
      method: "POST",
      body: JSON.stringify({ file_url: fileUrl }),
      headers: jsonHeaders,
    },
  );
}

export function generateKanbanTaskDescription(
  taskId: string,
  body?: { title?: string; description?: string },
) {
  return apiFetch<{ description: string; mode: "generate" | "improve" }>(
    `/api/teams/kanban/tasks/${taskId}/ai/description`,
    {
      method: "POST",
      body: JSON.stringify(body ?? {}),
      headers: jsonHeaders,
    },
  );
}

export function watchKanbanTask(taskId: string) {
  return apiFetch<{ watching: boolean }>(`/api/teams/kanban/tasks/${taskId}/watch`, {
    method: "POST",
  });
}

export function unwatchKanbanTask(taskId: string) {
  return apiFetch<{ watching: boolean }>(`/api/teams/kanban/tasks/${taskId}/watch`, {
    method: "DELETE",
  });
}

export type GitHubIssueSearchResult = {
  number: number;
  title: string;
  html_url: string;
  state: string;
};

export function searchKanbanBoardIssues(boardId: string, repo: string, q?: string) {
  const params = new URLSearchParams({ repo });
  if (q) params.set("q", q);
  return apiFetch<GitHubIssueSearchResult[]>(
    `/api/teams/kanban/boards/${boardId}/issues?${params.toString()}`,
  );
}

export function listKanbanBoardWebhooks(boardId: string) {
  return apiFetch<KanbanBoardWebhook[]>(`/api/teams/kanban/boards/${boardId}/webhooks`);
}

export function createKanbanBoardWebhook(boardId: string, name: string) {
  return apiFetch<KanbanBoardWebhookCreated>(`/api/teams/kanban/boards/${boardId}/webhooks`, {
    method: "POST",
    body: JSON.stringify({ name }),
    headers: jsonHeaders,
  });
}

export function deleteKanbanBoardWebhook(boardId: string, hookId: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/kanban/boards/${boardId}/webhooks/${hookId}`, {
    method: "DELETE",
  });
}

export function regenerateKanbanBoardWebhook(boardId: string, hookId: string) {
  return apiFetch<KanbanBoardWebhookCreated>(
    `/api/teams/kanban/boards/${boardId}/webhooks/${hookId}/regenerate`,
    { method: "POST" },
  );
}

export function presignKanbanBoardWebhookAvatar(
  boardId: string,
  hookId: string,
  contentType: string,
) {
  return apiFetch<{ upload_url: string; public_url: string; object_key: string }>(
    `/api/teams/kanban/boards/${boardId}/webhooks/${hookId}/avatar/presign`,
    {
      method: "POST",
      body: JSON.stringify({ content_type: contentType }),
      headers: jsonHeaders,
    },
  );
}

export function updateKanbanBoardWebhookAvatar(
  boardId: string,
  hookId: string,
  avatarUrl: string,
) {
  return apiFetch<KanbanBoardWebhook>(
    `/api/teams/kanban/boards/${boardId}/webhooks/${hookId}/avatar`,
    {
      method: "PATCH",
      body: JSON.stringify({ avatar_url: avatarUrl }),
      headers: jsonHeaders,
    },
  );
}

const MAX_WEBHOOK_AVATAR_BYTES = 5 * 1024 * 1024;

export async function uploadKanbanBoardWebhookAvatar(
  boardId: string,
  hookId: string,
  file: File,
): Promise<KanbanBoardWebhook> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }
  if (file.size > MAX_WEBHOOK_AVATAR_BYTES) {
    throw new Error("Image must be 5 MB or smaller");
  }

  const { upload_url, public_url } = await presignKanbanBoardWebhookAvatar(
    boardId,
    hookId,
    file.type,
  );
  const putRes = await fetch(upload_url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!putRes.ok) {
    throw new Error("Upload to storage failed");
  }

  return updateKanbanBoardWebhookAvatar(boardId, hookId, public_url);
}

export function listKanbanBoardWebhookMessages(boardId: string, limit = 100, offset = 0) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiFetch<KanbanBoardWebhookMessage[]>(
    `/api/teams/kanban/boards/${boardId}/webhook-messages?${params.toString()}`,
  );
}

export function deleteKanbanBoardWebhookMessage(boardId: string, msgId: string) {
  return apiFetch<{ ok: boolean }>(
    `/api/teams/kanban/boards/${boardId}/webhook-messages/${msgId}`,
    { method: "DELETE" },
  );
}
