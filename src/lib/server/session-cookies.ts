import { cookies } from "next/headers";

export const ACCESS_COOKIE = "abx_access";
export const REFRESH_COOKIE = "abx_refresh";
export const SESSION_FLAG_COOKIE = "abx_in";

const ACCESS_MAX_AGE = 60 * 60;
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60;

function cookieSecure(): boolean {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return site.startsWith("https://");
}

function baseOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: cookieSecure(),
    path: "/",
  };
}

export async function readAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value || null;
}

export async function readRefreshToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(REFRESH_COOKIE)?.value || null;
}

export async function writeSessionCookies(access: string, refresh?: string) {
  const jar = await cookies();
  const base = baseOptions();
  jar.set(ACCESS_COOKIE, access, { ...base, maxAge: ACCESS_MAX_AGE });
  if (refresh) {
    jar.set(REFRESH_COOKIE, refresh, { ...base, maxAge: REFRESH_MAX_AGE });
  }
  jar.set(SESSION_FLAG_COOKIE, "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function clearSessionCookies() {
  const jar = await cookies();
  const base = baseOptions();
  jar.set(ACCESS_COOKIE, "", { ...base, maxAge: 0 });
  jar.set(REFRESH_COOKIE, "", { ...base, maxAge: 0 });
  jar.set(SESSION_FLAG_COOKIE, "", {
    httpOnly: false,
    sameSite: "lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: 0,
  });
}

export function refreshTokenFromGoSetCookie(setCookies: string[]): string | null {
  for (const line of setCookies) {
    const match = line.match(/^lbot_refresh_token=([^;]*)/i);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }
  return null;
}
