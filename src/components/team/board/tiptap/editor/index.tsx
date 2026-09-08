"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import { useEffect, useMemo, useRef } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  SquareCode,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  Unlink,
  Undo2,
  Redo2,
  Heading2,
  Heading3,
  Heading1,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildTiptapExtensions,
  parseTiptapContent,
  TIPTAP_PROSE_CLASSES,
  type TiptapCategorySuggestionOptions,
} from "../utils";
import type { TeamMember } from "@/lib/api/types/team";

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "secondary" : "ghost"}
      className="h-8 w-8 p-0"
      title={title}
      onClick={onClick}>
      {children}
    </Button>
  );
}

function TiptapToolbar({ editor, flush }: { editor: Editor; flush?: boolean }) {
  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap gap-0.5 border-b",
        flush ? "border-b px-2.5 py-1" : "p-1.5",
      )}
      style={{ borderColor: "var(--border)" }}>
      <ToolbarButton
        title="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }>
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }>
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }>
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <span className="mx-1 w-px self-stretch bg-border" />

      <ToolbarButton
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Inline code"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <SquareCode className="h-4 w-4" />
      </ToolbarButton>

      <span className="mx-1 w-px self-stretch bg-border" />

      <ToolbarButton
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Ordered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <span className="mx-1 w-px self-stretch bg-border" />

      <ToolbarButton
        title="Add link"
        active={editor.isActive("link")}
        onClick={setLink}>
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Remove link"
        onClick={() => editor.chain().focus().unsetLink().run()}>
        <Unlink className="h-4 w-4" />
      </ToolbarButton>

      <span className="mx-1 w-px self-stretch bg-border" />

      <ToolbarButton
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export default function TiptapEditor({
  value,
  onChange,
  editable = true,
  variant = "default",
  borderless = false,
  surface,
  layout,
  flushSize = "full",
  placeholder,
  mentionMembers,
  allowMentionAll = false,
  categorySuggestion,
  className,
  onSubmit,
  onEditorReady,
}: {
  value: string;
  onChange: (json: string) => void;
  editable?: boolean;
  variant?: "default" | "compact";
  borderless?: boolean;
  surface?: "kanban";
  layout?: "flush";
  flushSize?: "compact" | "full";
  placeholder?: string;
  mentionMembers?: TeamMember[];
  /** Offer @all / @everyone broadcast entries in the mention list (group chats). */
  allowMentionAll?: boolean;
  categorySuggestion?: TiptapCategorySuggestionOptions;
  className?: string;
  onSubmit?: () => void;
  onEditorReady?: (editor: Editor | null) => void;
}) {
  const compact = variant === "compact";
  const flush = layout === "flush";
  const kanbanSurface = surface === "kanban" || compact;
  const mentionMemberKey = useMemo(
    () => (mentionMembers ?? []).map((m) => m.user_id).join("\0"),
    [mentionMembers],
  );
  const categoryKey = useMemo(
    () =>
      categorySuggestion
        ? (categorySuggestion.categories ?? []).map((c) => c.slug).join("\0")
        : "",
    [categorySuggestion],
  );

  const onSubmitRef = useRef(onSubmit);
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  const editor = useEditor(
    {
      extensions: useMemo(() => {
        const categoryOpts = categorySuggestion
          ? {
              categories: categorySuggestion.categories,
              onSelect: categorySuggestion.onSelect,
              onCreateCategory: categorySuggestion.onCreateCategory,
            }
          : undefined;
        const list = buildTiptapExtensions(
          placeholder,
          mentionMembers,
          false,
          true,
          categoryOpts,
          allowMentionAll,
        );
        list.push(
          Extension.create({
            name: "submitOnEnter",
            addKeyboardShortcuts() {
              return {
                Enter: () => {
                  if (onSubmitRef.current) {
                    onSubmitRef.current();
                    return true;
                  }
                  return false;
                },
              };
            },
          }),
        );
        return list;
      }, [placeholder, mentionMembers, allowMentionAll, categorySuggestion]),
      content: parseTiptapContent(value),
      editable,
      immediatelyRender: false,
      onUpdate: ({ editor: ed }) => {
        if (ed.isDestroyed) return;
        onChange(JSON.stringify(ed.getJSON()));
      },
    },
    [mentionMemberKey, placeholder, categoryKey, allowMentionAll],
  );

  useEffect(() => {
    onEditorReady?.(editor);
    return () => {
      onEditorReady?.(null);
    };
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor || editor.isDestroyed || !editor.commands) return;
    const current = JSON.stringify(editor.getJSON());
    if (value !== current) {
      editor.commands.setContent(parseTiptapContent(value), {
        emitUpdate: false,
      });
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  if (!editor) return null;

  const showToolbar = editable && !compact;

  return (
    <div
      className={cn(
        "flex w-full flex-col",
        !borderless && !flush && "rounded-sm border",
        compact
          ? cn("overflow-visible", !borderless && "rounded-lg border")
          : "overflow-hidden",
        flush && "rounded-lg border bg-transparent",
        !flush && !compact && "bg-transparent",
        className,
      )}
      style={
        borderless
          ? undefined
          : kanbanSurface && !flush
            ? {
                borderColor: "var(--kanban-input-border)",
                background: "var(--kanban-input-bg)",
              }
            : flush
              ? {
                  borderColor: "var(--kanban-input-border)",
                  background: "var(--kanban-input-bg)",
                }
              : !flush
                ? { borderColor: "var(--border)" }
                : undefined
      }>
      {showToolbar ? <TiptapToolbar editor={editor} flush={flush} /> : null}
      <EditorContent
        editor={editor}
        className={cn(
          TIPTAP_PROSE_CLASSES,
          compact
            ? "p-2.5 [&_.ProseMirror]:min-h-[40px] [&_.ProseMirror]:text-sm [&_.ProseMirror]:text-(--text)"
            : flush
              ? cn(
                  "px-2.5 py-1.5 [&_.ProseMirror]:text-sm [&_.ProseMirror]:py-0 [&_.ProseMirror_p]:my-1",
                  flushSize === "full"
                    ? "min-h-0 flex-1 overflow-y-auto [&_.ProseMirror]:min-h-full"
                    : "[&_.ProseMirror]:min-h-[72px]",
                )
              : kanbanSurface
                ? "p-2 [&_.ProseMirror]:min-h-[72px] [&_.ProseMirror]:text-sm [&_.ProseMirror]:py-0 [&_.ProseMirror_p]:my-1"
                : "min-h-0 flex-1 overflow-y-auto p-3 [&_.ProseMirror]:min-h-[200px]",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0",
          "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none",
        )}
        data-placeholder={placeholder}
      />
    </div>
  );
}
