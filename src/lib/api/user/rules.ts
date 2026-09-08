import { apiFetch, jsonHeaders } from "../core";
import type {
  Rule,
  RuleMessage,
  RuleMessagesPage,
} from "../types/rules";

export function getRules() {
  return apiFetch<Rule[]>("/api/rules");
}

export function createRule(
  r: Omit<
    Rule,
    | "id"
    | "user_id"
    | "last_sent_at"
    | "created_at"
    | "updated_at"
    | "thread_ts"
    | "thread_count"
  >,
) {
  return apiFetch<Rule>("/api/rules", {
    method: "POST",
    body: JSON.stringify(r),
    headers: jsonHeaders,
  });
}

export function updateRule(
  id: string,
  r: Partial<Omit<Rule, "thread_ts" | "thread_count">>,
) {
  return apiFetch<Rule>(`/api/rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(r),
    headers: jsonHeaders,
  });
}

export function deleteRule(id: string) {
  return apiFetch<null>(`/api/rules/${id}`, { method: "DELETE" });
}

export function previewRule(id: string, currentMessage?: string) {
  return apiFetch<{
    message: string;
    date: string;
    commit_count: number;
    is_thread_reply: boolean;
    will_post_date_header?: boolean;
    thread_count: number;
  }>(`/api/rules/${id}/preview`, {
    method: "POST",
    ...(currentMessage
      ? {
          body: JSON.stringify({ current_message: currentMessage }),
          headers: jsonHeaders,
        }
      : {}),
  });
}

export function triggerRule(id: string, message?: string) {
  return apiFetch<{ message: string }>(`/api/rules/${id}/trigger`, {
    method: "POST",
    ...(message
      ? { body: JSON.stringify({ message }), headers: jsonHeaders }
      : {}),
  });
}

export function getRuleMessages(id: string, page = 1) {
  return apiFetch<RuleMessagesPage>(`/api/rules/${id}/messages?page=${page}`);
}

export function deleteRuleMessage(ruleId: string, msgId: string) {
  return apiFetch<null>(`/api/rules/${ruleId}/messages/${msgId}`, {
    method: "DELETE",
  });
}

export function updateRuleMessage(ruleId: string, msgId: string, content: string) {
  return apiFetch<RuleMessage>(`/api/rules/${ruleId}/messages/${msgId}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
    headers: jsonHeaders,
  });
}
