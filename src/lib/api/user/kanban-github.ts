import { apiFetch, jsonHeaders } from "../core";
import type { KanbanBoardPrefs, KanbanBoardRepo, KanbanTask } from "../types/kanban";

export function listKanbanBoardRepos(boardId: string) {
  return apiFetch<KanbanBoardRepo[]>(`/api/teams/kanban/boards/${boardId}/repos`);
}

export function setKanbanBoardRepos(boardId: string, repos: { repo_full_name: string }[]) {
  return apiFetch<KanbanBoardRepo[]>(`/api/teams/kanban/boards/${boardId}/repos`, {
    method: "PUT",
    body: JSON.stringify({ repos }),
    headers: jsonHeaders,
  });
}

export function getKanbanBoardPrefs(boardId: string) {
  return apiFetch<KanbanBoardPrefs>(`/api/teams/kanban/boards/${boardId}/prefs`);
}

export function setKanbanBoardPrefs(boardId: string, defaultBaseBranch: string) {
  return apiFetch<KanbanBoardPrefs>(`/api/teams/kanban/boards/${boardId}/prefs`, {
    method: "PUT",
    body: JSON.stringify({ default_base_branch: defaultBaseBranch }),
    headers: jsonHeaders,
  });
}

export function createKanbanTaskBranch(
  taskId: string,
  repoFullName: string,
  baseBranch: string,
) {
  return apiFetch<KanbanTask>(`/api/teams/kanban/tasks/${taskId}/branch`, {
    method: "POST",
    body: JSON.stringify({ repo_full_name: repoFullName, base_branch: baseBranch }),
    headers: jsonHeaders,
  });
}

export function createKanbanTaskPR(
  taskId: string,
  opts?: { base_branch?: string; title?: string; body?: string },
) {
  return apiFetch<KanbanTask>(`/api/teams/kanban/tasks/${taskId}/pr`, {
    method: "POST",
    body: JSON.stringify(opts ?? {}),
    headers: jsonHeaders,
  });
}
