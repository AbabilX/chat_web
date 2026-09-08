import { API_BASE } from "./core";

export type DesktopPlatform = "macos" | "windows" | "linux";

export type DesktopAsset = {
  name: string;
  url: string;
  platform: DesktopPlatform;
  size: number;
};

export type DesktopCheck = {
  version: string;
  download_url: string;
  min_supported_version: string;
  notes: string;
  /** True only when a published release with uploaded installers was found. */
  verified: boolean;
  available_platforms: DesktopPlatform[];
  assets: DesktopAsset[];
  commands: Partial<Record<DesktopPlatform, string>>;
};

/**
 * Reads the desktop release the API is currently advertising. Everything on the
 * download page comes from here — version, install commands and asset URLs — so
 * the page can never drift from what is actually published.
 */
export async function fetchDesktopCheck(): Promise<DesktopCheck | null> {
  try {
    const res = await fetch(`${API_BASE}/v1/api/check`, {
      // The API caches the GitHub lookup for 10 minutes; matching that here
      // keeps a fresh release visible quickly without hammering either side.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success || !json.data) return null;

    const data = json.data as Partial<DesktopCheck>;
    return {
      version: data.version ?? "",
      download_url: data.download_url ?? "",
      min_supported_version: data.min_supported_version ?? "0.0.0",
      notes: data.notes ?? "",
      verified: Boolean(data.verified),
      available_platforms: data.available_platforms ?? [],
      assets: data.assets ?? [],
      commands: data.commands ?? {},
    };
  } catch {
    return null;
  }
}

export const PLATFORM_LABELS: Record<DesktopPlatform, string> = {
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
};

/** Turns "AbabilX_0.2.0_aarch64.dmg" into something a human can pick from. */
export function assetLabel(asset: DesktopAsset): string {
  const lower = asset.name.toLowerCase();
  if (/aarch64|arm64/.test(lower)) return "Apple Silicon (arm64)";
  if (/x64|x86_64|amd64|intel/.test(lower)) return "Intel / x86_64";
  if (lower.endsWith(".msi")) return "Enterprise installer (.msi)";
  if (lower.endsWith(".exe")) return "Installer (.exe)";
  if (lower.endsWith(".deb")) return "Debian / Ubuntu (.deb)";
  if (lower.endsWith(".rpm")) return "Fedora / RHEL (.rpm)";
  if (lower.endsWith(".appimage")) return "AppImage";
  return asset.name;
}

export function formatSize(bytes: number): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}
