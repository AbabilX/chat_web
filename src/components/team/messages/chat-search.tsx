"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search01Icon, Loading03Icon } from "hugeicons-react";
import { searchAIMessages } from "@/lib/api/user/assistant";
import type { AISearchHit } from "@/lib/api/types/assistant";
import {
  hitHref,
  hitSourceLabel,
} from "@/components/user/command-search/hit-utils";

export default function ChatSearch({ language }: { language?: string | null }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<AISearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bn = language === "bn";

  // Opened from the conversation header's actions sheet ("Search in conversation").
  useEffect(() => {
    function onFocusSearch() {
      setOpen(true);
      // Wait a frame so the (possibly just-mounted) sidebar input is focusable.
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ block: "nearest" });
      });
    }
    window.addEventListener("chat:focus-search", onFocusSearch);
    return () => window.removeEventListener("chat:focus-search", onFocusSearch);
  }, []);

  // Debounced keyword search (pure SQL server-side — instant, no AI tokens).
  useEffect(() => {
    const q = query.trim();
    const t = setTimeout(
      () => {
        if (q.length < 2) {
          setHits([]);
          setLoading(false);
          return;
        }
        setLoading(true);
        searchAIMessages(q, 8)
          .then((res) => {
            setHits(res);
            setLoading(false);
          })
          .catch(() => {
            // Free tier / disabled — quietly show no keyword results.
            setHits([]);
            setLoading(false);
          });
      },
      q.length < 2 ? 0 : 350,
    );
    return () => clearTimeout(t);
  }, [query]);

  // Close the dropdown on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function goTo(hit: AISearchHit) {
    setOpen(false);
    setQuery("");
    router.push(hitHref(hit));
  }

  function askAI() {
    setOpen(false);
    router.push(`/user/assistant?q=${encodeURIComponent(query.trim())}`);
  }

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={boxRef} className="relative px-3 py-2">
      <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5">
        <Search01Icon className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={bn ? "মেসেজ খুঁজুন…" : "Search messages…"}
          className="w-full bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"
        />
        {loading && (
          <Loading03Icon className="h-3.5 w-3.5 shrink-0 animate-spin text-[var(--text-muted)]" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-3 right-3 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-xl">
          {hits.map((hit) => (
            <button
              key={`${hit.source}-${hit.message_id || hit.post_id || hit.task_id}`}
              onClick={() => goTo(hit)}
              className="block w-full border-b border-[var(--border)] px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-[var(--surface)]"
            >
              <p className="flex items-baseline justify-between gap-2 text-xs">
                <span className="truncate font-medium text-[var(--text)]">
                  {hitSourceLabel(hit, language)}
                </span>
                <span className="shrink-0 text-[10px] text-[var(--text-muted)]">
                  {new Date(hit.created_at).toLocaleDateString()}
                </span>
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-[var(--text-muted)]">
                <span className="font-medium">{hit.author_name}:</span>{" "}
                {hit.snippet}
              </p>
            </button>
          ))}
          {hits.length === 0 && !loading && (
            <p className="px-3 py-2 text-xs text-[var(--text-muted)]">
              {bn ? "কোনো মিল পাওয়া যায়নি" : "No matches"}
            </p>
          )}
          <button
            onClick={askAI}
            className="block w-full border-t border-[var(--border)] px-3 py-2 text-left text-xs font-medium text-[var(--indigo)] transition-colors hover:bg-[var(--surface)]"
          >
            ✨ {bn ? "আবাবিল AI-কে জিজ্ঞেস করুন" : "Ask Ababil AI about this"}
          </button>
        </div>
      )}
    </div>
  );
}
