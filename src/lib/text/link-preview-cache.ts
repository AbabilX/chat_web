export type LinkPreviewMeta = {
  title: string;
  description?: string;
  image?: string;
  logo?: string;
  siteName?: string;
  /** Epoch milliseconds, already validated by `parseLinkPreviewDate`. */
  date?: number;
};

type Entry = { meta: LinkPreviewMeta | null; at: number };

/**
 * The version is part of the key on purpose, and it MUST be bumped whenever
 * the source of the metadata changes.
 *
 * A miss is cached, so every link that failed under the previous source stays
 * failed on this device for the whole miss window — even after a rebuild that
 * fixed the reason. That is exactly what happened moving off microlink: its
 * quota returned 429 for every link, those misses were stored, and the first
 * build to use the API endpoint drew nothing because it never asked.
 */
const STORE_KEY = "ababilx_link_preview_v4";
const MAX_ENTRIES = 200;
/** A page's title and image barely move; a whole day of reuse is generous. */
const HIT_TTL_MS = 24 * 60 * 60 * 1000;
/**
 * A miss is usually the daily quota, not a page without metadata, so it is
 * held briefly and retried rather than remembered as "this link has none".
 */
const MISS_TTL_MS = 2 * 60 * 60 * 1000;

const memory = new Map<string, Entry>();
let loaded = false;

function readStore(): Record<string, Entry> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Entry>) : {};
  } catch {
    return {};
  }
}

function hydrate() {
  if (loaded) return;
  loaded = true;
  if (typeof localStorage === "undefined") return;
  for (const [url, entry] of Object.entries(readStore())) {
    if (entry && typeof entry.at === "number") memory.set(url, entry);
  }
}

function persist() {
  if (typeof localStorage === "undefined") return;
  // Newest wins: a chat scrolls forward, so the oldest entries are the ones
  // nobody is looking at any more.
  const entries = [...memory.entries()]
    .sort((a, b) => b[1].at - a[1].at)
    .slice(0, MAX_ENTRIES);
  memory.clear();
  for (const [url, entry] of entries) memory.set(url, entry);
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // A full or blocked store costs the cache, never the preview.
  }
}

/** A cached answer, or undefined when it must be fetched. */
export function cachedPreview(url: string): Entry | undefined {
  hydrate();
  const entry = memory.get(url);
  if (!entry) return undefined;
  const ttl = entry.meta ? HIT_TTL_MS : MISS_TTL_MS;
  if (Date.now() - entry.at > ttl) {
    memory.delete(url);
    return undefined;
  }
  return entry;
}

export function rememberPreview(url: string, meta: LinkPreviewMeta | null) {
  hydrate();
  memory.set(url, { meta, at: Date.now() });
  persist();
}
