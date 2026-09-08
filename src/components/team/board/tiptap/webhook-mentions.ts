/**
 * Webhook descriptions arrive as markdown with plain `@handle` text. The Go
 * backend cannot build TipTap mention nodes, so it resolves the handles against
 * the team and ships the mapping alongside the raw markdown. This module does
 * the half Go can't: swap those exact handle runs for real mention nodes after
 * the markdown has been parsed.
 *
 * Handles the backend could not resolve are absent from the mapping and stay
 * plain text — a typo reads as text rather than silently vanishing.
 */

export type WebhookMention = {
  handle: string;
  id: string;
  label: string;
};

type Node = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: unknown[];
  content?: Node[];
};

/** Same boundary rule as the Go resolver, so both sides agree on what is a handle. */
const HANDLE = /(^|[^\w@./-])@([A-Za-z0-9][A-Za-z0-9._+-]{0,63})/g;

/** Replace resolved @handles inside a TipTap doc's text nodes with mention nodes. */
export function applyWebhookMentions(doc: unknown, mentions: WebhookMention[]) {
  if (!mentions?.length || !doc || typeof doc !== "object") return doc;

  const byHandle = new Map<string, WebhookMention>();
  for (const m of mentions) {
    if (m?.handle && m?.id) byHandle.set(m.handle.toLowerCase(), m);
  }
  if (byHandle.size === 0) return doc;

  walk(doc as Node, byHandle);
  return doc;
}

function walk(node: Node, byHandle: Map<string, WebhookMention>) {
  if (!Array.isArray(node.content)) return;

  const next: Node[] = [];
  for (const child of node.content) {
    // Code blocks and inline code are verbatim by definition — an @handle
    // inside a snippet is part of the snippet, not a ping.
    if (child.type === "codeBlock" || hasCodeMark(child)) {
      next.push(child);
      continue;
    }
    if (child.type === "text" && typeof child.text === "string") {
      next.push(...splitTextNode(child, byHandle));
      continue;
    }
    walk(child, byHandle);
    next.push(child);
  }
  node.content = next;
}

function hasCodeMark(node: Node): boolean {
  return (
    Array.isArray(node.marks) &&
    node.marks.some((m) => (m as { type?: string })?.type === "code")
  );
}

function splitTextNode(
  node: Node,
  byHandle: Map<string, WebhookMention>,
): Node[] {
  const text = node.text ?? "";
  const out: Node[] = [];
  let cursor = 0;

  HANDLE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = HANDLE.exec(text)) !== null) {
    const mention = byHandle.get(match[2].toLowerCase());
    if (!mention) continue;

    // match.index points at the boundary char; the '@' sits right after it.
    const start = match.index + match[1].length;
    const lead = text.slice(cursor, start);
    if (lead) out.push({ ...node, text: lead });
    out.push({ type: "mention", attrs: { id: mention.id, label: mention.label } });
    cursor = start + 1 + match[2].length;
  }

  if (out.length === 0) return [node];
  const tail = text.slice(cursor);
  if (tail) out.push({ ...node, text: tail });
  return out;
}
