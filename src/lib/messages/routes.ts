export const PERSONAL_MESSAGES_PATH = "/user/messages";
export const WORKSPACE_MESSAGES_PATH = "/user/workspace/messages";

export function messageBasePath(pathname: string) {
  return pathname === PERSONAL_MESSAGES_PATH ||
    pathname.startsWith(`${PERSONAL_MESSAGES_PATH}/`)
    ? PERSONAL_MESSAGES_PATH
    : WORKSPACE_MESSAGES_PATH;
}

export function messageEntryPath({
  hasTeam,
  independentChat,
}: {
  hasTeam: boolean;
  independentChat: boolean;
}) {
  return independentChat && !hasTeam
    ? PERSONAL_MESSAGES_PATH
    : WORKSPACE_MESSAGES_PATH;
}

export function messageConversationHref(
  pathname: string,
  conversationId: string,
) {
  return `${messageBasePath(pathname)}?c=${encodeURIComponent(conversationId)}`;
}
