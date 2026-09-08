"use client";

import { isPremiumTeam } from "@/lib/plan";
import { useTeamContextOptional } from "./team-provider";

/**
 * Premium is a TEAM-level entitlement only. Team features — uploads, rich text,
 * webhooks, kanban, wall, attendance, digest — unlock strictly on the team's own
 * plan. A member's personal (solo) plan grants nothing inside a team: solo premium
 * covers automation features, team premium covers team features. The two are fully
 * separate products.
 *
 * Every team feature gate should read `isFreeTier` from here rather than checking
 * the current user's solo plan, which would leak solo premium into team features.
 */
export function useTeamPlan() {
  const teamCtx = useTeamContextOptional();
  const isPremium = isPremiumTeam(teamCtx?.detail);
  return { isPremium, isFreeTier: !isPremium };
}
