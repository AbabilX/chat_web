"use client";

/** Web chat reads attachments directly from the CDN URL. */
export function useLocalAsset(url: string | null | undefined): string | null {
  return url || null;
}
