type GroupParticipantMetadata = {
  avatar_url?: unknown;
};

export function participantAvatarUrl(metadata?: string) {
  if (!metadata) return undefined;
  try {
    const parsed = JSON.parse(metadata) as GroupParticipantMetadata;
    return typeof parsed.avatar_url === "string" && parsed.avatar_url.trim()
      ? parsed.avatar_url
      : undefined;
  } catch {
    return undefined;
  }
}
