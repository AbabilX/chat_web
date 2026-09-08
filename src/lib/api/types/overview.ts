export type OverviewStatCard = {
  value: number;
  subtitle: string;
  series: number[];
  change_pct: number | null;
  change_label: string;
  trend_up: boolean;
};

export type OverviewStats = {
  auto_commits: OverviewStatCard;
  standups_sent: OverviewStatCard;
  board_tasks: OverviewStatCard;
  time_saved: OverviewStatCard;
};

export type OverviewActivityItem = {
  id: string;
  kind: string;
  status: "success" | "warning";
  label: string;
  occurred_at: string;
  href: string;
  source: "slack" | "github" | "discord" | "digest" | "rule";
};

export type OverviewActivityResponse = {
  items: OverviewActivityItem[];
};
