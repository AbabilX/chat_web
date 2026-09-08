"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { SuggestionKeyDownProps } from "@tiptap/suggestion";
import { PlusSignIcon, Tag01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";

export type CategorySuggestionItem = {
  id: string;
  label: string;
  description?: string;
  create?: boolean;
};

const CategoryList = forwardRef<
  { onKeyDown: (props: SuggestionKeyDownProps) => boolean },
  {
    items: CategorySuggestionItem[];
    command: (item: CategorySuggestionItem) => void;
  }
>(function CategoryList({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.children[
      selectedIndex + 1
    ] as HTMLElement | null;
    activeEl?.scrollIntoView({ block: "nearest", behavior: "auto" });
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: SuggestionKeyDownProps) => {
      if (items.length === 0) return false;
      if (event.key === "ArrowUp") {
        setSelectedIndex((i) => (i + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        const item = items[selectedIndex];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div
        className="rounded-lg border bg-(--surface2) p-2.5 text-xs text-muted-foreground shadow-md"
        style={{ borderColor: "var(--border)" }}
      >
        Type a name to create a category
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="max-h-56 overflow-y-auto rounded-lg border bg-(--surface2) p-1 shadow-md"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Categories
      </div>
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={cn(
            "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
            index === selectedIndex
              ? "bg-indigo-500/15 text-indigo-300"
              : "text-(--text) hover:bg-white/5",
          )}
          onClick={() => command(item)}
        >
          {item.create ? (
            <PlusSignIcon size={14} className="mt-0.5 shrink-0 opacity-70" />
          ) : (
            <Tag01Icon size={14} className="mt-0.5 shrink-0 opacity-70" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {item.create ? `Create #${item.label}` : `#${item.label}`}
            </span>
            {item.description ? (
              <span className="block truncate text-[11px] text-muted-foreground">
                {item.description}
              </span>
            ) : null}
          </span>
        </button>
      ))}
    </div>
  );
});

export default CategoryList;

export function categoryItemsFromList(
  categories: { slug: string; label: string; description?: string }[],
  query: string,
): CategorySuggestionItem[] {
  const q = query.trim();
  const qLower = q.toLowerCase();
  const matched = categories
    .filter((c) => {
      if (!qLower) return true;
      return (
        c.label.toLowerCase().includes(qLower) ||
        c.slug.toLowerCase().includes(qLower)
      );
    })
    .slice(0, 10)
    .map((c) => ({
      id: c.slug,
      label: c.label,
      description: c.description,
    }));

  if (!q || q.length > 64) return matched;

  const exactExists = categories.some(
    (c) =>
      c.label.toLowerCase() === qLower || c.slug.toLowerCase() === qLower,
  );
  if (exactExists) return matched;

  return [
    ...matched,
    {
      id: `__create__:${qLower}`,
      label: q,
      description: "Create instantly for this team",
      create: true,
    },
  ];
}
