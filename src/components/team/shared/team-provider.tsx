"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, type TeamDetail } from "@/lib/api";
import {
  resolveCRMLockReason,
  type CRMLockReason,
} from "@/components/team/crm/shared/crm-lock";

export type TeamNavKey =
  | "overview"
  | "board"
  | "timeline"
  | "wall"
  | "messages"
  | "crm"
  | "weeklyDigestTeams"
  | "teamMembers"
  | "teamSettings"
  | "attendance";

type TeamContextValue = {
  detail: TeamDetail | null;
  loading: boolean;
  error: string;
  hasTeam: boolean;
  isLeader: boolean;
  isManager: boolean;
  isMember: boolean;
  /** True when this member exceeds paid_seats on a premium team. */
  viewerFrozen: boolean;
  // Manager permission gates (leader always true; manager per team toggle).
  canManageKanban: boolean;
  canModerateWall: boolean;
  canConfigAttendance: boolean;
  canConfigDigest: boolean;
  canEditTeamSettings: boolean;
  /** Leader or manager: may look up users and send workspace invites. */
  canInviteMembers: boolean;
  // CRM module gates. All require the team to be premium; leaders get all.
  crm: {
    access: boolean;
    view: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    configure: boolean;
  };
  /** Why CRM is locked for this viewer; null when unlocked or no team. */
  crmLockReason: CRMLockReason;
  reload: () => Promise<void>;
  isNavEnabled: (key: TeamNavKey) => boolean;
};

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [detail, setDetail] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const team = await api.getMyTeam();
      setDetail(team);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load team");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .getMyTeam()
      .then((team) => {
        if (!cancelled) setDetail(team);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load team");
        setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasTeam = !!detail?.team;
  const isLeader = hasTeam && detail?.my_role === "leader";
  const isManager = hasTeam && detail?.my_role === "manager";
  const isMember = hasTeam && detail?.my_role === "member";
  const viewerFrozen = !!detail?.viewer_frozen;

  const perms = detail?.role_permissions;
  const canManageKanban = isLeader || (isManager && !!perms?.kanban_admin);
  const canModerateWall = isLeader || (isManager && !!perms?.wall_moderation);
  const canConfigAttendance = isLeader || (isManager && !!perms?.attendance_settings);
  const canConfigDigest = isLeader || (isManager && !!perms?.digest_config);
  const canEditTeamSettings = isLeader || (isManager && !!perms?.team_settings_edit);
  // Inviting is not a per-team toggle — leaders and managers always may, plain
  // members never do. Mirrors TeamDetail.CanInviteMembers on the server.
  const canInviteMembers = isLeader || isManager;

  // CRM is premium-only. Grants come from the acting member's resolved module
  // permissions (leader already gets all-true from the backend). View unlocks
  // the route; sidebar still shows CRM greyed when locked.
  const teamPremium = !!detail?.team_is_premium;
  const crmGrants = detail?.module_permissions?.crm;
  // Per-member allowlist gate: leaders/managers are implicit-true from backend.
  // A member needs both an explicit allowlist grant AND the View action.
  const memberCrmAccess = !!detail?.crm_access;
  const crmAccess = teamPremium && memberCrmAccess && !viewerFrozen;
  const crm = useMemo(
    () => ({
      access: crmAccess,
      // Entry (allowlist / implicit role) IS the view right — mirrors backend.
      // Finer actions still require the role-matrix grant.
      view: crmAccess,
      create: crmAccess && !!crmGrants?.create,
      update: crmAccess && !!crmGrants?.update,
      delete: crmAccess && !!crmGrants?.delete,
      configure: crmAccess && !!crmGrants?.configure,
    }),
    [crmAccess, crmGrants],
  );
  const crmLockReason = resolveCRMLockReason({
    hasTeam,
    teamPremium,
    crmAccess: memberCrmAccess,
    viewerFrozen,
  });

  const isNavEnabled = useCallback(
    (key: TeamNavKey) => {
      if (loading) return false;
      if (key === "crm") return crm.view;
      if (isLeader) return true;
      // Managers and members share the same nav allowlist; page-level components
      // branch on the specific permission booleans, not on nav access.
      if (isMember || isManager) {
        return (
          key === "overview" ||
          key === "board" ||
          key === "timeline" ||
          key === "wall" ||
          key === "messages" ||
          key === "teamMembers" ||
          key === "attendance" ||
          key === "teamSettings"
        );
      }
      // No team yet: the overview entry is the way in (it renders a create/join
      // prompt). teamMembers/teamSettings are no longer sidebar entries.
      return key === "overview";
    },
    [loading, isLeader, isMember, isManager, crm.view],
  );

  const value = useMemo(
    () => ({
      detail,
      loading,
      error,
      hasTeam,
      isLeader,
      isManager,
      isMember,
      viewerFrozen,
      canManageKanban,
      canModerateWall,
      canConfigAttendance,
      canConfigDigest,
      canEditTeamSettings,
      canInviteMembers,
      crm,
      crmLockReason,
      reload,
      isNavEnabled,
    }),
    [
      detail,
      loading,
      error,
      hasTeam,
      isLeader,
      isManager,
      isMember,
      viewerFrozen,
      canManageKanban,
      canModerateWall,
      canConfigAttendance,
      canConfigDigest,
      canEditTeamSettings,
      canInviteMembers,
      crm,
      crmLockReason,
      reload,
      isNavEnabled,
    ],
  );

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeamContext() {
  const ctx = useContext(TeamContext);
  if (!ctx) {
    throw new Error("useTeamContext must be used within TeamProvider");
  }
  return ctx;
}

export function useTeamContextOptional() {
  return useContext(TeamContext);
}
