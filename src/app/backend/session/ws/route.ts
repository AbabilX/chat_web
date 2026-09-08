import { readAccessToken } from "@/lib/server/session-cookies";
import { refreshGoSession } from "@/lib/server/forward-go";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Hands the browser a short-lived access JWT for the WebSocket handshake only.
 * REST stays cookie-only. The token is not written to storage.
 */
export async function GET() {
  let token = await readAccessToken();
  if (!token && (await refreshGoSession())) {
    token = await readAccessToken();
  }
  if (!token) {
    return Response.json({ success: false, error: "unauthorized" }, { status: 401 });
  }
  return Response.json({ success: true, token });
}
