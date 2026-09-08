function resolveApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export const API_BASE = resolveApiBase();

const TOKEN_KEY = "lbot_token";
const TOKEN_COOKIE = "lbot_token";
const TOKEN_MAX_AGE = 60 * 60; // 1 hour — matches backend access JWT TTL
// The 30-day refresh token now lives in an HttpOnly cookie set by the backend
// (/auth/exchange, /auth/refresh) — it is never readable by JavaScript, so XSS
// cannot steal it. Only the short-lived access token is held in JS.

const tokenListeners = new Set<() => void>();

function emitStoredTokenChange() {
  tokenListeners.forEach((listener) => listener());
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  const localToken = localStorage.getItem(TOKEN_KEY);
  if (localToken) return localToken;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function subscribeStoredToken(onChange: () => void): () => void {
  tokenListeners.add(onChange);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onChange);
  }
  return () => {
    tokenListeners.delete(onChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onChange);
    }
  };
}

export function getStoredTokenServerSnapshot(): boolean {
  return false;
}

export function getStoredTokenClientSnapshot(): boolean {
  return !!getStoredToken();
}

export function persistStoredToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${TOKEN_MAX_AGE}; SameSite=Lax`;
  emitStoredTokenChange();
}

export function clearStoredToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  emitStoredTokenChange();
}

// Retire the session: clears the HttpOnly refresh cookie server-side, then the
// local access token. Fire-and-forget on the network call.
export function logout() {
  if (typeof window === "undefined") return;
  void fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {});
  localStorage.removeItem("ababilx_chat_prefs");
  localStorage.removeItem("ababilx_chat_local_index");
  window.dispatchEvent(new Event("ababilx:logout"));
  clearStoredToken();
}

// Exchanges the one-time code from the OAuth redirect for an access token. The
// refresh token is set by the backend as an HttpOnly cookie (credentials:include
// lets the browser store it). Keeps both tokens out of the callback URL.
export async function exchangeAuthCode(code: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code }),
    });
    if (!res.ok) return false;
    const json = await res.json().catch(() => null);
    if (!json?.success || !json.access_token) return false;
    persistStoredToken(json.access_token);
    return true;
  } catch {
    return false;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  // Refresh token travels in the HttpOnly cookie; credentials:include sends it.
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ client: "web" }),
  });

  if (!res.ok) return false;

  const json = await res.json().catch(() => null);
  if (!json || !json.success) return false;

  const access = (json.access_token ?? json.token) as string | undefined;
  if (!access) return false;

  persistStoredToken(access);
  return true;
}

async function tryRefreshOnce(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = refreshAccessToken().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

// Thrown for non-success API responses. Keeps the backend error code as
// `message` (for existing string-matching callers) plus any extra JSON
// fields (e.g. `limit`) so callers can build precise, non-hardcoded copy.
export class ApiError extends Error {
  data: Record<string, unknown>;
  constructor(code: string, data: Record<string, unknown>) {
    super(code);
    this.name = "ApiError";
    this.data = data;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  async function doFetch(retryAfterRefresh: boolean): Promise<T> {
    const token = getStoredToken();
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: token
        ? { ...init?.headers, Authorization: `Bearer ${token}` }
        : init?.headers,
    });

    if (res.status === 401) {
      if (retryAfterRefresh && (await tryRefreshOnce())) {
        return doFetch(false);
      }
      if (typeof window !== "undefined") {
        logout();
        window.location.href = "/";
      }
      throw new Error("unauthorized");
    }

    const json = await res.json().catch(() => null);
    if (!json || !json.success) throw new ApiError(json?.error ?? "api error", json ?? {});
    return json.data as T;
  }

  return doFetch(true);
}

export const jsonHeaders = { "Content-Type": "application/json" } as const;
