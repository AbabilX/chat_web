import type { AppUser } from "./me";
import type { TeamGraphMember, TeamGraphView } from "./team";

export type AdminUser = AppUser;

export type AdminUserGraph = {
  view: TeamGraphView;
  periods: string[];
  labels: string[];
  members: TeamGraphMember[]; // 0 or 1 entries — a user has at most one team
};

export type AdminUserMemory = {
  profile: string;
  chat_msgs_since_refresh: number;
};

export type AdminBillingInterestEntry = {
  team_id: string;
  team_name: string;
  user_id: string;
  name: string;
  username: string;
  email: string;
  avatar_url: string;
  seats: number;
  created_at: string;
};

export type AdminBillingInterest = {
  seat_price_usd: number;
  entries: AdminBillingInterestEntry[] | null;
};
