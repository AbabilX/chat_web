export const CHANNEL_NAME_MAX = 80;

/** Slack-style slug: lowercase, spaces→hyphens, drop anything but a-z0-9-_. */
export function slugifyChannel(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_]/g, "");
}
