export type MessagingDevice = {
  device_id: string;
  platform: string;
  public_key: JsonWebKey;
  key_version: number;
  created_at: string;
  last_seen_at: string;
  rotated_at?: string | null;
  revoked_at?: string | null;
};

export type MessageReceiptStatus = "delivered" | "read";
