import { apiFetch } from "@/lib/api/core";

export type UnfurledLink = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  site_name?: string;
  logo?: string;
  date?: string;
};

/** Server-side unfurl — the reader's device never contacts the link host. */
export async function unfurlLink(url: string): Promise<UnfurledLink> {
  const data = await apiFetch<Omit<UnfurledLink, "url">>(
    `/api/link-preview?url=${encodeURIComponent(url)}`,
  );
  return { url, ...data };
}
