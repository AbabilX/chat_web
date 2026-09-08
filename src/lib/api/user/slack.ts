import { apiFetch, jsonHeaders } from "../core";
import type { SlackChannel } from "../types/slack";

export function disconnectSlack() {
  return apiFetch<null>("/api/slack/disconnect", { method: "POST" });
}

export function getSlackChannels() {
  return apiFetch<SlackChannel[]>("/api/slack/channels");
}

export type SlackTestOptions = {
  send_as_user?: boolean;
  thread_enabled?: boolean;
  thread_style?: string;
  thread_example_message?: string;
  thread_count_format?: string;
  thread_count_custom?: string;
  example_message?: string;
  timezone?: string;
};

export function testSlackMessage(channelId: string, options?: SlackTestOptions) {
  return apiFetch<null>("/api/slack/test-message", {
    method: "POST",
    body: JSON.stringify({
      channel_id: channelId,
      send_as_user: options?.send_as_user ?? false,
      thread_enabled: options?.thread_enabled ?? false,
      thread_style: options?.thread_style ?? "",
      thread_example_message: options?.thread_example_message ?? "",
      thread_count_format: options?.thread_count_format ?? "number",
      thread_count_custom: options?.thread_count_custom ?? "",
      example_message: options?.example_message ?? "",
      timezone: options?.timezone ?? "UTC",
    }),
    headers: jsonHeaders,
  });
}
