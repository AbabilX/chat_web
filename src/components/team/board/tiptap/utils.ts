import type { Extensions } from "@tiptap/core";
import { Editor, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import { Markdown } from "@tiptap/markdown";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import type { TeamMember } from "@/lib/api/types/team";
import { createKanbanMentionSuggestion } from "./mention-suggestion";
import { applyWebhookMentions, type WebhookMention } from "./webhook-mentions";
import {
  WallCategoryHashtag,
  WallCategoryTag,
  type WallCategorySuggestionSource,
} from "./category-suggestion";

export type TiptapCategorySuggestionOptions = {
  categories: WallCategorySuggestionSource[];
  onSelect: (slug: string) => void;
  onCreateCategory?: (
    label: string,
  ) => Promise<{ id: string; label: string } | null>;
};

/** Shared ProseMirror typography for editor + viewer (code blocks, inline code, mentions). */
export const TIPTAP_PROSE_CLASSES = [
  "prose prose-sm dark:prose-invert max-w-none",
  "[&_.ProseMirror]:outline-none",
  "[&_code]:rounded [&_code]:bg-black/20 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
  "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-relaxed",
  "[&_pre]:border-[var(--kanban-input-border)] [&_pre]:bg-[var(--kanban-input-bg)]",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit",
  // A mention is a chip, so it must never be cut in half. A label with a
  // space in it ("@John Doe") is one inline box that the browser is free to
  // break at that space, which paints the background as two ragged halves
  // with padding on the outer edges only. whitespace-nowrap removes every
  // break opportunity inside the chip, so it moves to the next line whole.
  // box-decoration-break:clone is inert while that holds — nowrap means the
  // box is never fragmented for it to act on — and is kept only so the rule
  // still degrades into a full rounded background per fragment if nowrap is
  // ever dropped.
  "[&_.kanban-mention]:whitespace-nowrap [&_.kanban-mention]:[box-decoration-break:clone] [&_.kanban-mention]:[-webkit-box-decoration-break:clone]",
  "[&_.kanban-mention]:rounded [&_.kanban-mention]:bg-amber-400 [&_.kanban-mention]:px-1 [&_.kanban-mention]:py-px [&_.kanban-mention]:font-medium [&_.kanban-mention]:text-stone-900",
  "[&_.wall-category-tag]:rounded-sm [&_.wall-category-tag]:bg-indigo-500/20 [&_.wall-category-tag]:px-1 [&_.wall-category-tag]:font-medium [&_.wall-category-tag]:text-indigo-300 [&_.wall-category-tag]:whitespace-nowrap [&_.wall-category-tag]:[box-decoration-break:clone] [&_.wall-category-tag]:[-webkit-box-decoration-break:clone]",
  "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-5 [&_h1]:mb-3 [&_h1]:text-[var(--text)]",
  "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2.5 [&_h2]:text-[var(--text)]",
  "[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:text-[var(--text)]",
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3",
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3",
  "[&_li]:my-1",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-muted-foreground",
  "[&_s]:line-through [&_del]:line-through [&_strike]:line-through",
  "[&_hr]:my-4 [&_hr]:border-t [&_hr]:border-[var(--border)]",
  "[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse",
  "[&_th]:border [&_th]:border-[var(--kanban-input-border)] [&_th]:bg-black/10 [&_th]:p-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold",
  "[&_td]:border [&_td]:border-[var(--kanban-input-border)] [&_td]:p-2 [&_td]:text-xs",
].join(" ");

export function memberMentionLabel(m: {
  name?: string;
  user_name?: string;
  github_username?: string;
  user_id?: string;
}) {
  return (
    m.name?.trim() ||
    m.user_name?.trim() ||
    m.github_username?.trim() ||
    m.user_id?.slice(0, 8) ||
    "User"
  );
}

function kanbanTableExtensions(): Extensions {
  return [
    Table.configure({ resizable: false }),
    TableRow,
    TableCell,
    TableHeader,
  ];
}

export function buildTiptapExtensions(
  placeholder?: string,
  mentionMembers?: TeamMember[],
  linkOpenOnClick: boolean = true,
  includeLinks: boolean = true,
  categorySuggestion?: TiptapCategorySuggestionOptions,
  allowMentionAll: boolean = false,
): Extensions {
  const ext: Extensions = [
    StarterKit,
    ...kanbanTableExtensions(),
    Markdown.configure({ markedOptions: { gfm: true } }),
    Underline,
    WallCategoryTag,
    ...(includeLinks
      ? [
          Link.configure({
            openOnClick: linkOpenOnClick,
            autolink: true,
            HTMLAttributes: {
              target: "_blank",
              rel: "noopener noreferrer",
              class:
                "text-blue-500 dark:text-blue-400 hover:underline cursor-pointer",
            },
          }),
        ]
      : []),
    Mention.configure({
      HTMLAttributes: {
        class: "kanban-mention",
      },
      renderHTML({ options, node }) {
        return [
          "span",
          mergeAttributes(options.HTMLAttributes, { "data-mention": "" }),
          `@${node.attrs.label ?? node.attrs.id}`,
        ];
      },
      ...(mentionMembers && mentionMembers.length > 0
        ? {
            suggestion: createKanbanMentionSuggestion(
              mentionMembers,
              allowMentionAll,
            ),
          }
        : {}),
    }),
  ];
  if (categorySuggestion) {
    ext.push(
      WallCategoryHashtag.configure({
        categories: categorySuggestion.categories,
        onSelect: categorySuggestion.onSelect,
        onCreateCategory: categorySuggestion.onCreateCategory,
      }),
    );
  }
  if (placeholder) {
    ext.push(Placeholder.configure({ placeholder }));
  }
  return ext;
}

/**
 * Webhook task descriptions arrive as markdown and are stored by the Go backend
 * behind a `{format:"markdown",raw:...}` marker (Go can't run the TipTap
 * pipeline). Upgrade the marker to canonical TipTap JSON on read so every
 * downstream helper sees a normal doc. Non-marker values (real TipTap JSON,
 * legacy plain text) pass through untouched, so nothing else is affected.
 */
function upgradeWebhookMarkdown(value: string): string {
  const trimmed = value?.trim();
  if (!trimmed || trimmed[0] !== "{") return value;
  try {
    const parsed = JSON.parse(trimmed) as {
      format?: string;
      raw?: string;
      mentions?: WebhookMention[];
    };
    if (parsed?.format === "markdown" && typeof parsed.raw === "string") {
      const json = markdownToTiptapJson(parsed.raw);
      if (!parsed.mentions?.length) return json;
      // The backend resolved these @handles to real members; turn them into
      // mention chips now that the markdown is a doc.
      try {
        return JSON.stringify(
          applyWebhookMentions(JSON.parse(json), parsed.mentions),
        );
      } catch {
        return json;
      }
    }
  } catch {
    // not JSON — fall through to the untouched value
  }
  return value;
}

export function parseTiptapContent(value: string) {
  if (!value) return "";
  const upgraded = upgradeWebhookMarkdown(value);
  try {
    return JSON.parse(upgraded);
  } catch {
    const normalized = unescapeLiteralEscapes(upgraded);
    if (normalized.includes("\n") || normalized !== upgraded) {
      try {
        return JSON.parse(plainTextToTiptapJson(normalized));
      } catch {
        return normalized;
      }
    }
    return upgraded;
  }
}

export function isTiptapEmpty(value: string): boolean {
  if (!value?.trim()) return true;
  const upgraded = upgradeWebhookMarkdown(value);
  try {
    const doc = JSON.parse(upgraded) as {
      type?: string;
      content?: { type?: string; content?: unknown[] }[];
    };
    if (doc?.type !== "doc") return !upgraded.trim();
    const blocks = doc.content ?? [];
    if (blocks.length === 0) return true;
    return blocks.every((block) => {
      if (
        block.type === "paragraph" &&
        (!block.content || block.content.length === 0)
      )
        return true;
      return false;
    });
  } catch {
    return !upgraded.trim();
  }
}

/** Plain-text comments from before rich editor */
export function isPlainCommentBody(body: string): boolean {
  const t = body?.trim();
  if (!t) return true;
  return !t.startsWith("{");
}

export function textToTiptapJson(text: string): string {
  return JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  });
}

/**
 * Contact-form / webhook payloads often send literal "\\n" instead of real
 * newlines. Only rewrite when there are 2+ escaped separators and few/no
 * real newlines — avoids breaking paths like C:\\newfolder.
 */
export function unescapeLiteralEscapes(text: string): string {
  if (!text || !text.includes("\\")) return text;
  const literalN = (text.match(/\\n/g) ?? []).length;
  if (literalN < 2) return text;
  const realN = (text.match(/\n/g) ?? []).length;
  if (realN > 0 && literalN <= realN) return text;
  return text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t");
}

/** GFM markdown → TipTap JSON (headings, bold, code blocks, tables). Falls back to plain paragraphs. */
export function markdownToTiptapJson(markdown: string): string {
  const trimmed = unescapeLiteralEscapes(markdown).trim();
  if (!trimmed) {
    return JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });
  }
  try {
    const editor = new Editor({
      extensions: buildTiptapExtensions(),
      content: trimmed,
      contentType: "markdown",
    });
    const json = JSON.stringify(editor.getJSON());
    editor.destroy();
    return json;
  } catch {
    return plainTextToTiptapJson(markdown);
  }
}

/** Multiline plain text → TipTap doc (one paragraph per line). */
export function plainTextToTiptapJson(text: string): string {
  const trimmed = unescapeLiteralEscapes(text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();
  if (!trimmed) {
    return JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] });
  }
  const lines = trimmed.split("\n");
  return JSON.stringify({
    type: "doc",
    content: lines.map((line) =>
      line === ""
        ? { type: "paragraph" }
        : { type: "paragraph", content: [{ type: "text", text: line }] },
    ),
  });
}

/** Prefill a comment with a single @mention node. */
export function mentionToTiptapJson(userId: string, label: string): string {
  return JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "mention", attrs: { id: userId, label } },
          { type: "text", text: " " },
        ],
      },
    ],
  });
}

type TiptapNode = {
  type?: string;
  text?: string;
  attrs?: { id?: string; label?: string };
  content?: TiptapNode[];
};

function nodeToPlainText(node: TiptapNode): string {
  if (node.type === "hardBreak") return "\n";
  if (node.type === "mention")
    return `@${node.attrs?.label ?? node.attrs?.id ?? ""}`;
  if (node.type === "wallCategory") {
    return `#${node.attrs?.label ?? node.attrs?.id ?? ""}`;
  }
  if (node.text) return node.text;
  if (!node.content?.length) return "";
  return node.content.map(nodeToPlainText).join("");
}

/** Category slug from the first `wallCategory` node in TipTap JSON. */
export function extractWallCategorySlug(value: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  try {
    const doc = JSON.parse(trimmed) as TiptapNode;
    let slug = "";
    walkNodes(doc, (node) => {
      if (!slug && node.type === "wallCategory" && node.attrs?.id) {
        slug = String(node.attrs.id);
      }
    });
    return slug;
  } catch {
    return "";
  }
}

function walkNodes(node: TiptapNode, visit: (n: TiptapNode) => void) {
  visit(node);
  node.content?.forEach((child) => walkNodes(child, visit));
}

/** Unique user IDs from mention nodes in TipTap JSON. */
export function extractMentionUserIds(value: string): string[] {
  const trimmed = value?.trim();
  if (!trimmed || isPlainCommentBody(trimmed)) return [];
  try {
    const doc = JSON.parse(trimmed) as TiptapNode;
    const ids = new Set<string>();
    walkNodes(doc, (node) => {
      if (node.type === "mention" && node.attrs?.id) {
        ids.add(String(node.attrs.id));
      }
    });
    return [...ids];
  } catch {
    return [];
  }
}

/** Word count from Tiptap JSON or legacy plain strings. */
export function tiptapWordCount(value: string): number {
  const text = tiptapToPlainText(value).trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

/** Plain text for clipboard copy from Tiptap JSON or legacy plain strings. */
export function tiptapToPlainText(value: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  const upgraded = upgradeWebhookMarkdown(trimmed);
  if (isPlainCommentBody(upgraded)) return upgraded;
  try {
    const doc = JSON.parse(upgraded) as TiptapNode;
    if (doc.type !== "doc" || !doc.content?.length) return upgraded;
    return doc.content
      .map(nodeToPlainText)
      .map((line) => line.trimEnd())
      .filter((line) => line.length > 0)
      .join("\n");
  } catch {
    return upgraded;
  }
}

/** TipTap JSON → GitHub Flavored Markdown. Falls back to plain text on error. */
export function tiptapToMarkdown(value: string): string {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  const upgraded = upgradeWebhookMarkdown(trimmed);
  if (isPlainCommentBody(upgraded)) return upgraded;
  try {
    JSON.parse(upgraded);
  } catch {
    return upgraded;
  }
  try {
    const editor = new Editor({
      extensions: buildTiptapExtensions(),
    });
    editor.commands.setContent(JSON.parse(upgraded));
    const storage = editor.storage.markdown as { getMarkdown?: () => string };
    const md = storage.getMarkdown?.() ?? "";
    editor.destroy();
    return md.trim();
  } catch {
    return tiptapToPlainText(value);
  }
}

export function extractUrls(value: string): string[] {
  const urls = new Set<string>();

  const trimmed = value?.trim();
  if (trimmed) {
    try {
      const doc = JSON.parse(trimmed) as TiptapNode;
      if (doc.type === "doc") {
        collectTiptapLinkHrefs(doc, urls);
      }
    } catch {
      // plain text fallback below
    }
  }

  const text = tiptapToPlainText(value);
  if (text) {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const matches = text.match(urlRegex) ?? [];
    for (const match of matches) {
      let url = match;
      const suffix = match.match(/([.,;!?)]+)$/);
      if (suffix) {
        url = match.slice(0, -suffix[0].length);
      }
      urls.add(url);
    }
  }

  return [...urls];
}

type TiptapLinkNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>;
  content?: TiptapLinkNode[];
};

function collectTiptapLinkHrefs(node: TiptapLinkNode, urls: Set<string>) {
  if (node.type === "text" && node.marks?.length) {
    for (const mark of node.marks) {
      if (mark.type === "link" && mark.attrs?.href) {
        urls.add(String(mark.attrs.href));
      }
    }
  }
  node.content?.forEach((child) => collectTiptapLinkHrefs(child, urls));
}
