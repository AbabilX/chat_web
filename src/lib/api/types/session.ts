/**
 * One place the user is signed in. Survives token rotation, so it maps to a
 * real device the user can recognise — and revoke.
 *
 * Mirrors models.UserSession on the backend.
 */
export type UserSession = {
  id: string;
  /** web | desktop | mobile | unknown */
  client: string;
  /** How the sign-in happened: github | google | qr | desktop_code | legacy */
  origin: string;
  /** Display name — the user-chosen or client-sent device name, else from the user agent. */
  label: string;
  browser?: string;
  os?: string;
  ip?: string;
  created_at: string;
  last_seen_at: string;
  /** The session making the request. Offered a sign-out, never a revoke. */
  current: boolean;
};
