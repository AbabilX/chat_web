import type { ThreadMessage } from "./thread-types";

export function buildCommentThreads<T extends ThreadMessage>(messages: T[]) {
  const byId = new Map(messages.map((m) => [m.id, m]));
  const roots: T[] = [];
  const repliesByParent = new Map<string, T[]>();

  for (const m of messages) {
    if (m.parent_id) {
      const list = repliesByParent.get(m.parent_id) ?? [];
      list.push(m);
      repliesByParent.set(m.parent_id, list);
    } else {
      roots.push(m);
    }
  }

  roots.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  for (const replies of repliesByParent.values()) {
    replies.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }

  function threadRoot(messageId: string): T {
    let m = byId.get(messageId);
    if (!m) throw new Error("message not found");
    while (m.parent_id) {
      const parent = byId.get(m.parent_id);
      if (!parent) break;
      m = parent;
    }
    return m;
  }

  return { roots, repliesByParent, threadRoot, byId };
}
