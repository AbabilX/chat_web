import { apiFetch } from "../core";

export type TeamMemberConnections = {
  /** True if the assignee has Slack connected with a user token (DM-capable). */
  slack_dm_available: boolean;
  /** True if the assignee has email and hasn't opted out of email notifications. */
  email_available: boolean;
};

/**
 * Returns notification capability flags for a team member.
 * The caller must share the same team as the queried user.
 * No sensitive data (emails, tokens) is exposed — only boolean flags.
 */
export function getTeamMemberConnections(userId: string): Promise<TeamMemberConnections> {
  return apiFetch<TeamMemberConnections>(`/api/teams/members/${encodeURIComponent(userId)}/connections`);
}
