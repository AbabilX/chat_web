import type { AppUser, TeamDetail } from "@/lib/api";

export type Plan = "free" | "premium";

type PlanUser = Pick<AppUser, "plan" | "is_premium" | "premium_until" | "is_super_admin">;

export function isPlanActive(premiumUntil: string | null): boolean {
  if (!premiumUntil) return true;
  return new Date(premiumUntil) > new Date();
}

export function getEffectivePlan(user: PlanUser | null | undefined): Plan {
  if (!user) return "free";
  const active = isPlanActive(user.premium_until);
  const plan = user.plan;
  if ((plan === "premium" || user.is_premium) && active) return "premium";
  return "free";
}

export function isPremiumUser(user: PlanUser | null | undefined): boolean {
  return getEffectivePlan(user) === "premium";
}

type PlanTeam = Pick<TeamDetail, "team_is_premium" | "team_premium_until">;

export function isPremiumTeam(detail: PlanTeam | null | undefined): boolean {
  if (!detail?.team_is_premium) return false;
  return isPlanActive(detail.team_premium_until ?? null);
}

/**
 * Whether uploads are allowed for a member acting inside a team. Team features
 * are gated on the TEAM's own plan only — a solo-premium member gets no team
 * perks (solo premium covers automation features, not team features). A premium
 * team covers every member, including free-plan ones.
 */
export function canUploadInTeam(
  _user: PlanUser | null | undefined,
  detail: PlanTeam | null | undefined,
): boolean {
  return isPremiumTeam(detail);
}

export function isSuperAdminUser(user: PlanUser | null | undefined): boolean {
  return !!user?.is_super_admin;
}
