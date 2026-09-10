/**
 * The date on a link preview card — Signal's `isLinkPreviewDateValid` and its
 * `LinkPreviewDate`, ported.
 *
 * Rust hands the tag through as the page wrote it and the parsing happens
 * here, which is where Signal does it too (`Date.parse` in its fetch code). One
 * parser, so a date the card accepts is a date the card can format.
 */

const ONE_DAY = 24 * 60 * 60 * 1000;

/**
 * Signal's `MIN_DATE` / `MAX_DATE`: "we want to discard unreasonable dates,
 * update this in ~950 years". A page claiming the year 12,000 is broken
 * markup, not news.
 */
const MIN_DATE = 0;
const MAX_DATE = new Date(3000, 0, 1).valueOf();

/** Epoch milliseconds, or null when the page gave nothing usable. */
export function parseLinkPreviewDate(raw?: string | null): number | null {
  if (!raw) return null;
  const parsed = Date.parse(raw);
  if (!Number.isFinite(parsed)) return null;
  if (parsed <= MIN_DATE || parsed >= MAX_DATE) return null;
  // A day's grace, as Signal allows: time zones alone can put a fresh article
  // slightly in the future.
  if (parsed >= Date.now() + ONE_DAY) return null;
  return parsed;
}

/** Signal shows moment's `ll` — "Sep 9, 2026". */
export function formatLinkPreviewDate(value: number, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(value);
}
