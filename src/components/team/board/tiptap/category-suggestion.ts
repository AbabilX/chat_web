import { Extension, Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { exitSuggestion } from "@tiptap/suggestion";
import CategoryList, {
  categoryItemsFromList,
  type CategorySuggestionItem,
} from "./category-list";

const categorySuggestionPluginKey = new PluginKey("wall-category-suggestion");

export type WallCategorySuggestionSource = {
  slug: string;
  label: string;
  description?: string;
};

/** Inline `#Category` chip kept in the editor content. */
export const WallCategoryTag = TiptapNode.create({
  name: "wallCategory",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      id: { default: null },
      label: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-wall-category]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-wall-category": "",
        class: "wall-category-tag",
      }),
      `#${node.attrs.label ?? node.attrs.id ?? ""}`,
    ];
  },

  renderText({ node }) {
    return `#${node.attrs.label ?? node.attrs.id ?? ""}`;
  },
});

type EditorLike = {
  view?: { dom?: globalThis.Node; hasFocus?: () => boolean };
};

function dismissCategorySuggestion(editor: unknown) {
  const view = (editor as Editor | null)?.view;
  if (view) exitSuggestion(view, categorySuggestionPluginKey);
}

function setupDismissListeners(
  editor: unknown,
  popup: HTMLDivElement,
): () => void {
  const editorDom = (editor as EditorLike | null)?.view?.dom;
  if (!(editorDom instanceof HTMLElement)) return () => {};

  const onOutsidePointerDown = (event: PointerEvent) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (popup.contains(target) || editorDom.contains(target)) return;
    dismissCategorySuggestion(editor);
  };

  const onEditorFocusOut = (event: FocusEvent) => {
    const related = event.relatedTarget;
    if (
      related instanceof Node &&
      (popup.contains(related) || editorDom.contains(related))
    ) {
      return;
    }
    window.setTimeout(() => {
      const view = (editor as Editor | null)?.view;
      if (view && !view.hasFocus()) {
        dismissCategorySuggestion(editor);
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

function findCategoryAnchor(
  editor: EditorLike | null | undefined,
): HTMLElement | null {
  const dom = editor?.view?.dom;
  if (!(dom instanceof HTMLElement)) return null;

  const selectors = [
    "[data-mention-composer]",
    ".overflow-hidden.rounded-lg.border",
    ".overflow-hidden.rounded-xl.border",
    "#wall-composer",
  ];

  for (const selector of selectors) {
    const match = dom.closest(selector);
    if (match instanceof HTMLElement) return match;
  }

  const shell = dom.closest(".rounded-lg.border, .rounded-sm.border");
  return shell instanceof HTMLElement ? shell : dom;
}

function positionPopup(
  el: HTMLElement,
  editor: EditorLike | null | undefined,
  clientRect?: (() => DOMRect | null) | null,
) {
  const anchor = findCategoryAnchor(editor);
  const popupHeight =
    el.offsetHeight || el.getBoundingClientRect().height || 208;
  const gap = 8;
  const pad = 8;

  // Keep the popover overlaid inside the editor panel (not outside above it).
  if (anchor) {
    const a = anchor.getBoundingClientRect();
    const maxWidth = Math.max(160, a.width - pad * 2);
    el.style.left = `${a.left + pad}px`;
    el.style.width = `${maxWidth}px`;

    const caret = clientRect?.();
    let top: number;
    if (caret && caret.bottom >= a.top && caret.top <= a.bottom) {
      const below = caret.bottom + gap;
      if (below + popupHeight <= a.bottom - pad) {
        top = below;
      } else {
        top = caret.top - popupHeight - gap;
      }
    } else {
      top = a.bottom - popupHeight - pad;
    }

    const minTop = a.top + pad;
    const maxTop = Math.max(minTop, a.bottom - popupHeight - pad);
    el.style.top = `${Math.min(Math.max(top, minTop), maxTop)}px`;
    return;
  }

  const rect = clientRect?.();
  if (!rect) return;
  el.style.left = `${rect.left}px`;
  el.style.width = "";
  el.style.top = `${rect.bottom + gap}px`;
}

function schedulePosition(
  popup: HTMLDivElement,
  editor: EditorLike | null | undefined,
  clientRect?: (() => DOMRect | null) | null,
) {
  positionPopup(popup, editor, clientRect);
  requestAnimationFrame(() => positionPopup(popup, editor, clientRect));
}

function insertWallCategoryTag(
  editor: Editor,
  range: { from: number; to: number },
  item: { id: string; label: string },
) {
  const type = editor.schema.nodes.wallCategory;
  if (!type) {
    editor.chain().focus().insertContentAt(range, `#${item.label} `).run();
    return;
  }

  editor
    .chain()
    .focus()
    .command(({ tr, dispatch }) => {
      if (!dispatch) return false;

      const deletes: { from: number; to: number }[] = [];
      tr.doc.descendants((node, pos) => {
        if (node.type.name === "wallCategory") {
          deletes.push({ from: pos, to: pos + node.nodeSize });
        }
      });
      for (let i = deletes.length - 1; i >= 0; i -= 1) {
        const del = deletes[i];
        if (!del) continue;
        tr.delete(del.from, del.to);
      }

      const from = tr.mapping.map(range.from);
      const to = tr.mapping.map(range.to);
      const node = type.create({ id: item.id, label: item.label });
      tr.replaceWith(from, to, node);
      const space = editor.schema.text(" ");
      tr.insert(from + node.nodeSize, space);
      dispatch(tr);
      return true;
    })
    .run();
}

export function createWallCategorySuggestion(options: {
  categories: WallCategorySuggestionSource[];
  onSelect: (slug: string) => void;
  onCreateCategory?: (
    label: string,
  ) => Promise<{ id: string; label: string } | null>;
}) {
  const { categories, onSelect, onCreateCategory } = options;

  return {
    char: "#",
    allowSpaces: true,
    pluginKey: categorySuggestionPluginKey,
    items: ({ query }: { query: string }) =>
      categoryItemsFromList(categories, query),
    command: ({
      editor,
      range,
      props,
    }: {
      editor: Editor;
      range: { from: number; to: number };
      props: CategorySuggestionItem;
    }) => {
      if (props.create) {
        if (!onCreateCategory) return;
        // Clear `#query` immediately, then create + insert the tag.
        editor.chain().focus().deleteRange(range).run();
        const insertPos = range.from;
        void (async () => {
          const created = await onCreateCategory(props.label);
          if (!created) return;
          const pos = Math.min(insertPos, editor.state.doc.content.size);
          insertWallCategoryTag(editor, { from: pos, to: pos }, created);
          onSelect(created.id);
        })();
        return;
      }

      insertWallCategoryTag(editor, range, {
        id: props.id,
        label: props.label,
      });
      onSelect(props.id);
    },
    render: () => {
      let component: ReactRenderer | null = null;
      let popup: HTMLDivElement | null = null;
      let removeDismissListeners: (() => void) | null = null;

      return {
        onStart: (props: {
          editor: unknown;
          clientRect?: (() => DOMRect | null) | null;
          items: CategorySuggestionItem[];
          command: (item: CategorySuggestionItem) => void;
        }) => {
          popup = document.createElement("div");
          popup.style.position = "fixed";
          popup.style.zIndex = "9999";
          document.body.appendChild(popup);

          component = new ReactRenderer(CategoryList, {
            props,
            editor: props.editor as never,
          });

          popup.appendChild(component.element);
          schedulePosition(popup, props.editor as EditorLike, props.clientRect);
          removeDismissListeners?.();
          removeDismissListeners = setupDismissListeners(props.editor, popup);
        },
        onUpdate: (props: {
          editor: unknown;
          clientRect?: (() => DOMRect | null) | null;
          items: CategorySuggestionItem[];
          command: (item: CategorySuggestionItem) => void;
        }) => {
          component?.updateProps(props);
          if (popup) {
            schedulePosition(
              popup,
              props.editor as EditorLike,
              props.clientRect,
            );
          }
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
          popup?.remove();
          component?.destroy();
          popup = null;
          component = null;
        },
      };
    },
  };
}

export const WallCategoryHashtag = Extension.create<{
  categories: WallCategorySuggestionSource[];
  onSelect: (slug: string) => void;
  onCreateCategory?: (
    label: string,
  ) => Promise<{ id: string; label: string } | null>;
}>({
  name: "wallCategoryHashtag",

  addOptions() {
    return {
      categories: [],
      onSelect: () => {},
      onCreateCategory: undefined,
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...createWallCategorySuggestion({
          categories: this.options.categories,
          onSelect: this.options.onSelect,
          onCreateCategory: this.options.onCreateCategory,
        }),
      }),
    ];
  },
});
