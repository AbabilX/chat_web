"use client";

import {
  File01Icon,
  Image01Icon,
  MusicNote01Icon,
  Pdf01Icon,
  Video01Icon,
} from "hugeicons-react";
import { tiptapToPlainText } from "@/components/team/board/tiptap/utils";
import {
  extractFromBrokenTiptapJson,
  fileBadgeKind,
  fileBadgeLabel,
  formatChatMessagePreview,
  resolvePreviewAttachments,
  type ChatPreviewAttachment,
} from "../chat-preview-utils";
import { truncatePreviewText } from "../chat-utils";
import { cn } from "@/lib/utils";

type PreviewSegment =
  | { kind: "text"; value: string }
  | { kind: "mention"; value: string }
  | { kind: "link"; value: string; href: string }
  | { kind: "code"; value: string };

type TiptapNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>;
  content?: TiptapNode[];
};

function nodeSegments(node: TiptapNode, out: PreviewSegment[]) {
  if (node.type === "mention") {
    const label = String(node.attrs?.label ?? node.attrs?.id ?? "user");
    out.push({ kind: "mention", value: `@${label}` });
    return;
  }
  if (node.type === "text" && node.text) {
    const linkMark = node.marks?.find((m) => m.type === "link");
    const codeMark = node.marks?.some((m) => m.type === "code");
    if (codeMark) {
      out.push({ kind: "code", value: node.text });
    } else if (linkMark?.attrs?.href) {
      out.push({
        kind: "link",
        value: node.text,
        href: String(linkMark.attrs.href),
      });
    } else {
      out.push({ kind: "text", value: node.text });
    }
    return;
  }
  if (node.type === "hardBreak") {
    out.push({ kind: "text", value: " " });
    return;
  }
  node.content?.forEach((child) => nodeSegments(child, out));
}

function canParseTiptapDoc(body: string): boolean {
  try {
    const doc = JSON.parse(body) as TiptapNode;
    return doc.type === "doc" && Array.isArray(doc.content);
  } catch {
    return false;
  }
}

function bodyToSegments(body: string): PreviewSegment[] {
  const trimmed = body?.trim();
  if (!trimmed) return [];
  try {
    const doc = JSON.parse(trimmed) as TiptapNode;
    if (doc.type === "doc" && doc.content?.length) {
      const out: PreviewSegment[] = [];
      doc.content.forEach((n) => nodeSegments(n, out));
      if (out.length) return out;
    }
  } catch {
    // plain text fallback
  }
  const plain = tiptapToPlainText(trimmed);
  if (plain && !plain.trim().startsWith("{")) {
    return [{ kind: "text", value: plain }];
  }
  const recovered = extractFromBrokenTiptapJson(trimmed);
  return recovered ? [{ kind: "text", value: recovered }] : [];
}

function truncateSegments(
  segments: PreviewSegment[],
  prefixLen: number,
  max: number,
) {
  const items: Array<{ seg: PreviewSegment; slice: string; key: number }> = [];
  let used = prefixLen;
  segments.forEach((seg, i) => {
    if (used >= max) return;
    const room = max - used;
    const slice =
      seg.value.length > room ? `${seg.value.slice(0, room)}…` : seg.value;
    used += slice.length;
    items.push({ seg, slice, key: i });
  });
  return items;
}

function FileBadge({ file }: { file: ChatPreviewAttachment }) {
  const kind = fileBadgeKind(file);
  const Icon =
    kind === "image"
      ? Image01Icon
      : kind === "video"
        ? Video01Icon
        : kind === "audio"
          ? MusicNote01Icon
          : kind === "pdf"
            ? Pdf01Icon
            : File01Icon;

  return (
    <span className="ml-1 inline-flex max-w-[140px] shrink-0 items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 align-middle text-[11px] font-semibold text-[var(--text)]">
      <Icon size={12} className="shrink-0 text-muted-foreground" />
      <span className="truncate">{fileBadgeLabel(file)}</span>
    </span>
  );
}

export default function ChatMessagePreview({
  body,
  className,
  prefix,
  attachmentType,
  attachmentName,
  attachments,
}: {
  body?: string;
  className?: string;
  prefix?: string;
  attachmentType?: string;
  attachmentName?: string;
  attachments?: ChatPreviewAttachment[];
}) {
  const files = resolvePreviewAttachments({
    attachments,
    attachmentType,
    attachmentName,
  });
  const previewText = formatChatMessagePreview({
    body,
    attachmentType,
    attachmentName,
    textOnly: true,
  });

  const hasText = !!previewText.trim();
  const hasFiles = files.length > 0;

  if (!hasText && !hasFiles && !prefix) {
    return (
      <span className={cn("text-xs text-muted-foreground italic", className)}>
        No messages yet
      </span>
    );
  }

  const trimmedBody = body?.trim() ?? "";
  const segments = bodyToSegments(trimmedBody);
  const useRichSegments =
    hasText &&
    canParseTiptapDoc(trimmedBody) &&
    segments.some((s) => s.kind !== "text" || s.value.length > 0);

  const truncated = useRichSegments
    ? truncateSegments(segments, prefix?.length ?? 0, 200)
    : null;
  const plain = !useRichSegments
    ? truncatePreviewText(previewText, 200)
    : "";

  return (
    <div className={cn("min-w-0 flex-1 text-xs leading-snug text-muted-foreground", className)}>
      <p className="line-clamp-2 break-words">
        {prefix ? (
          <span className="font-semibold text-[var(--text)]">{prefix.trim()} </span>
        ) : null}
        {useRichSegments && truncated
          ? truncated.map(({ seg, slice, key }) => {
              if (seg.kind === "mention") {
                return (
                  <span
                    key={key}
                    className="whitespace-nowrap rounded-sm bg-sky-500/20 px-0.5 font-medium text-sky-400 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
                  >
                    {slice}
                  </span>
                );
              }
              if (seg.kind === "link") {
                return (
                  <span key={key} className="text-sky-400">
                    {slice}
                  </span>
                );
              }
              if (seg.kind === "code") {
                return (
                  <span
                    key={key}
                    className="rounded bg-black/25 px-0.5 font-mono text-[11px] text-[var(--text)]"
                  >
                    {slice}
                  </span>
                );
              }
              return <span key={key}>{slice}</span>;
            })
          : hasText
            ? <span>{plain}</span>
            : null}
        {hasFiles
          ? files.map((file, i) => (
              <FileBadge
                key={`${file.file_name}-${file.content_type}-${i}`}
                file={file}
              />
            ))
          : null}
      </p>
    </div>
  );
}
