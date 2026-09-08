// Per-seat team billing copy + pricing. No payment gateway is wired yet — this
// drives the "coming soon" billing card in team settings. Price is echoed by
// the backend (handlers/billing_handler.go SeatPriceUSD) on interest capture.

import { FREE_FILE_LOCK_MONTHS, TEAM_RETENTION_COPY } from "@/constant/team/retention";
import { TEAM_CALL_QUOTA_COPY } from "@/constant/team/call-quota";

export const SEAT_PRICE_USD = 2.5;

// Manual bKash pricing. The backend is the source of truth (plan.SeatPriceBDTPerMonth
// + bkashReceiveNumber); these are fallbacks used before the status API responds.
export const SEAT_PRICE_BDT = 150;
export const BKASH_RECEIVE_NUMBER = "";
export const MAX_BILLING_MONTHS = 12;

/** Formats a USD amount with a leading $ and two decimals, e.g. 12.5 -> "$12.50". */
export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/** Formats a BDT amount with the ৳ symbol and thousands separators, e.g. "৳1,500". */
export function formatBdt(amount: number): string {
  return `৳${Math.round(amount).toLocaleString("en-US")}`;
}

export const TEAM_BILLING_COPY = {
  planBadge: "Free (unpaid)",
  comingSoon: "Coming soon",
  perSeatUnit: "per member / month",
  blurb:
    "One premium plan for the whole team. The leader pays a single monthly bill priced per member — everyone gets full access.",
  notifyCta: "Notify me when it's ready",
  notifyDone: "You're on the list — we'll email you when billing goes live.",
  memberNote:
    "Your team leader manages the upgrade. They'll be billed for the whole team when this launches.",
  seatNote: "The leader's seat is included. Total updates as members join or leave.",
  pendingSeatsTitle: "New members need seats",
  pendingSeatsBody: (count: number, amountLabel: string) =>
    `${count} member${count === 1 ? " is" : "s are"} waiting for a seat — pay ${amountLabel} to activate ${count === 1 ? "them" : "them"}.`,
  pendingSeatsCta: "Pay for seats",
} as const;

export const SEAT_PENDING_COPY = {
  title: "Your seat is pending",
  body: "Your team is over its paid seat limit. Ask your team leader to pay for an extra seat — until then workspace features stay locked.",
  leaveHint: "You can leave the team anytime while you wait.",
} as const;

// What the paid team plan unlocks. Shown as a checklist on the pricing card.
export const TEAM_PLAN_FEATURES: readonly string[] = [
  TEAM_RETENTION_COPY.planFeature(FREE_FILE_LOCK_MONTHS),
  TEAM_CALL_QUOTA_COPY.planFeature,
  "Up to 15 boards per team",
  "45 GB shared team storage",
  "Unlimited board access for every member",
  "Full team wall, chat & attachments",
  "One bill covers the whole team",
];
