"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import {
  getScrollBottom,
  scrollToBottom,
  setScrollBottom,
} from "./scroll-to-bottom";

type Options = {
  conversationId: string | null;
  lastMessageId: string | null;
  messageCount: number;
  lastMessageFromSelf: boolean;
  loading: boolean;
};

/**
 * Signal Timeline scroll, as hooks.
 *
 * Open: `DoingInitialLoad` finished → `{ scrollBottom: 0 }` → setScrollBottom
 * before paint. That is why Signal never "scrolls down" on open — the first
 * frame is already on the last message.
 *
 * Stay: near-bottom is an IntersectionObserver on the 15px detector, not a
 * scroll listener (Timeline.dom.tsx). SizeObserver re-pins while near bottom.
 * Load-older preserves scrollBottom.
 */
export function useTimelineScroll({
  conversationId,
  lastMessageId,
  messageCount,
  lastMessageFromSelf,
  loading,
}: Options) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bottomDetectorRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const selfRef = useRef(lastMessageFromSelf);
  selfRef.current = lastMessageFromSelf;
  const prependBottomRef = useRef<number | null>(null);

  const anchorBeforePrepend = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    nearBottomRef.current = false;
    prependBottomRef.current = getScrollBottom(el);
  }, []);

  useLayoutEffect(() => {
    nearBottomRef.current = true;
    prependBottomRef.current = null;
  }, [conversationId]);

  useLayoutEffect(() => {
    if (loading) return;
    const el = containerRef.current;
    if (!el) return;
    const preserved = prependBottomRef.current;
    if (preserved !== null) {
      prependBottomRef.current = null;
      setScrollBottom(el, preserved);
      return;
    }
    if (nearBottomRef.current || selfRef.current) {
      setScrollBottom(el, 0);
      nearBottomRef.current = true;
    }
  }, [conversationId, loading, lastMessageId, messageCount]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    const content = contentRef.current;
    const detector = bottomDetectorRef.current;
    if (!el || !content || !detector) return;

    const io = new IntersectionObserver(
      (entries) => {
        nearBottomRef.current = entries.some(
          (entry) => entry.target === detector && entry.isIntersecting,
        );
      },
      { root: el, threshold: 0 },
    );
    io.observe(detector);

    const ro = new ResizeObserver(() => {
      if (prependBottomRef.current !== null) return;
      if (nearBottomRef.current) scrollToBottom(el);
    });
    ro.observe(content);
    ro.observe(el);

    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, [conversationId]);

  return { containerRef, contentRef, bottomDetectorRef, anchorBeforePrepend };
}
