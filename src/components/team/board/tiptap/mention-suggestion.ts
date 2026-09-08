import type { Editor } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import { PluginKey } from "@tiptap/pm/state";
import { exitSuggestion } from "@tiptap/suggestion";
import type { TeamMember } from "@/lib/api/types/team";
import MentionPopover from "./mention-list/mention-popover";
import { mentionItemsFromMembers } from "./mention-list";

const mentionSuggestionPluginKey = new PluginKey("kanban-mention-suggestion");

type EditorLike = {
  view?: { dom?: Node; hasFocus?: () => boolean };
};

function dismissMentionSuggestion(editor: unknown) {
  const view = (editor as Editor | null)?.view;
  if (view) exitSuggestion(view, mentionSuggestionPluginKey);
}

// The popover content is portaled by Radix, so "inside the popup" is detected by
// the data attribute rather than a container reference.
function isInsideMentionPopover(node: Node | null): boolean {
  return (
    node instanceof HTMLElement && !!node.closest("[data-mention-popover]")
  );
}

function setupDismissListeners(editor: unknown): () => void {
  const editorDom = (editor as EditorLike | null)?.view?.dom;
  if (!(editorDom instanceof HTMLElement)) return () => {};

  const onOutsidePointerDown = (event: PointerEvent) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (isInsideMentionPopover(target) || editorDom.contains(target)) return;
    dismissMentionSuggestion(editor);
  };

  const onEditorFocusOut = (event: FocusEvent) => {
    const related = event.relatedTarget;
    if (
      related instanceof Node &&
      (isInsideMentionPopover(related) || editorDom.contains(related))
    ) {
      return;
    }

    window.setTimeout(() => {
      const view = (editor as Editor | null)?.view;
      if (view && !view.hasFocus()) {
        dismissMentionSuggestion(editor);
      }
    }, 0);
  };

  document.addEventListener("pointerdown", onOutsidePointerDown, true);
  editorDom.addEventListener("focusout", onEditorFocusOut);

  return () => {
    document.removeEventListener("pointerdown", onOutsidePointerDown, true);
    editorDom.removeEventListener("focusout", onEditorFocusOut);
  };
}

export function createKanbanMentionSuggestion(
  members: TeamMember[],
  allowMentionAll = false,
) {
  return {
    char: "@",
    allowSpaces: false,
    pluginKey: mentionSuggestionPluginKey,
    items: ({ query }: { query: string }) =>
      mentionItemsFromMembers(members, query, allowMentionAll),
    render: () => {
      let component: ReactRenderer | null = null;
      let host: HTMLDivElement | null = null;
      let removeDismissListeners: (() => void) | null = null;

      return {
        onStart: (props: {
          editor: unknown;
          clientRect?: (() => DOMRect | null) | null;
          items: ReturnType<typeof mentionItemsFromMembers>;
          command: (item: { id: string; label: string }) => void;
        }) => {
          // Radix portals the visible content; this host only anchors the React tree.
          host = document.createElement("div");
          document.body.appendChild(host);

          component = new ReactRenderer(MentionPopover, {
            props,
            editor: props.editor as never,
          });
          host.appendChild(component.element);

          removeDismissListeners?.();
          removeDismissListeners = setupDismissListeners(props.editor);
        },
        onUpdate: (props: {
          editor: unknown;
          clientRect?: (() => DOMRect | null) | null;
          items: ReturnType<typeof mentionItemsFromMembers>;
          command: (item: { id: string; label: string }) => void;
        }) => {
          component?.updateProps(props);
        },
        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (props.event.key === "Escape") return true;
          const ref = component?.ref as {
            onKeyDown?: (p: { event: KeyboardEvent }) => boolean;
          } | null;
          return ref?.onKeyDown?.(props) ?? false;
        },
        onExit: () => {
          removeDismissListeners?.();
          removeDismissListeners = null;
          component?.destroy();
          host?.remove();
          component = null;
          host = null;
        },
      };
    },
  };
}
