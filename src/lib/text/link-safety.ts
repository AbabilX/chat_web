/**
 * Whether a link may be unfurled — Signal's `shouldPreviewHref` /
 * `isLinkSneaky`, ported (`ts/types/LinkPreview.std.ts`).
 *
 * A preview is the one place a message can make the app act on a URL before
 * anybody clicks it, so the bar is higher than for rendering it as a link. The
 * homograph rules are the point: `аpple.com` with a Cyrillic а draws a card
 * carrying Apple's real title and logo, which is a far better phishing lure
 * than the bare link ever was.
 */

/** Signal's cap. A href longer than this is not a link anyone typed. */
const MAX_HREF_LENGTH = 2 ** 12;

/** Box-drawing characters are used to paint a fake UI inside a domain. */
const BOX_DRAWING = /[─-◿]/;

const VALID_URI_CHARACTERS = new Set(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" +
    "-._~:/?#[]@!$&'()*+,;=%",
);

/** Hosts that exist to be examples or are unreachable from here. */
const EXCLUDED_DOMAINS = [
  "debuglogs.org",
  "example",
  "example.com",
  "example.net",
  "example.org",
  "invalid",
  "localhost",
  "onion",
  "test",
];

function isExcluded(hostname: string) {
  const host = hostname.toLowerCase();
  return EXCLUDED_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

/**
 * The host as it appears in the text the author wrote, which is where a mixed
 * script shows. `URL.hostname` has already punycoded it into `xn--…`, so the
 * substitution is invisible by the time it gets there.
 */
function rawHost(href: string) {
  return afterScheme(href).split(/[/?#]/)[0] ?? "";
}

function afterScheme(href: string) {
  return href.replace(/^[a-z]+:\/\//i, "");
}

/**
 * The path exactly as written. `URL.pathname` has already percent-encoded a
 * raw space or control character, so checking it would approve the very input
 * this is meant to catch.
 */
function rawPath(href: string) {
  const rest = afterScheme(href);
  const cut = rest.search(/[/?#]/);
  return cut === -1 ? "" : rest.slice(cut);
}

function isMixedScript(host: string) {
  let ascii = false;
  let other = false;
  for (const char of host) {
    const code = char.codePointAt(0) ?? 0;
    if (/[a-zA-Z]/.test(char)) ascii = true;
    else if (code > 0x7f) other = true;
  }
  return ascii && other;
}

export function shouldPreviewUrl(href: string): boolean {
  if (!href || href.length > MAX_HREF_LENGTH) return false;
  if (BOX_DRAWING.test(href)) return false;

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return false;
  }
  // https only. An http preview would be fetched over a link anybody on the
  // path can rewrite, and the card would carry whatever they substituted.
  if (url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  if (!url.hostname || url.hostname.length > 2048) return false;
  if (url.hostname.includes("%")) return false;
  if (isExcluded(url.hostname)) return false;

  const labels = url.hostname.split(".");
  if (labels.length < 2 || labels.some((label) => label.length === 0)) return false;
  if (isMixedScript(rawHost(href))) return false;

  // Anything outside RFC 3986's set in the path is an attempt to render
  // something other than a path.
  for (const char of rawPath(href)) {
    if (!VALID_URI_CHARACTERS.has(char)) return false;
  }
  return true;
}
