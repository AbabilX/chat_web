/**
 * Why CRM is locked for the current viewer.
 * - premium: team is not on a premium plan
 * - permission: team is premium but this member has no CRM access
 * - null: unlocked (or no team yet — caller should hide nav)
 */
export type CRMLockReason = "premium" | "permission" | null;

export function resolveCRMLockReason(opts: {
  hasTeam: boolean;
  teamPremium: boolean;
  crmAccess: boolean;
  viewerFrozen: boolean;
}): CRMLockReason {
  if (!opts.hasTeam) return null;
  if (!opts.teamPremium) return "premium";
  if (!opts.crmAccess || opts.viewerFrozen) return "permission";
  return null;
}

export const CRM_LOCK_TOAST = {
  premium: "CRM needs a premium team plan.",
  permission: "You need permission to access CRM.",
} as const;
