/**
 * Origin of the Go API. Server-only — the browser talks to `/backend` on this
 * app and never learns this host.
 */
export function goApiOrigin(): string {
  const raw =
    process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim() || "";
  if (!raw) {
    throw new Error("API_URL is not set");
  }
  return raw.replace(/\/$/, "");
}
