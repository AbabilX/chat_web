import type { PaymentStatus } from "./team";

/** A manual bKash purchase of individual (solo) premium. No team involved. */
export type SoloPaymentRequest = {
  id: string;
  user_id: string;
  method: string;
  sender_number: string;
  trx_id: string;
  amount_bdt: number;
  months: number;
  status: PaymentStatus;
  review_message: string;
  reviewed_by?: string;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields (admin list only)
  buyer_name?: string;
  buyer_email?: string;
  buyer_avatar?: string;
};

/** Where a user's active premium came from. */
export type PremiumSource = "solo" | "team" | "admin" | "";

export type SoloPaymentStatusResponse = {
  request: SoloPaymentRequest | null;
  price_bdt: number;
  method: string;
  receive_number: string;
  is_premium: boolean;
  premium_until: string | null;
  premium_source: PremiumSource;
};

export type AdminSoloPaymentList = {
  entries: SoloPaymentRequest[] | null;
  price_bdt: number;
};
