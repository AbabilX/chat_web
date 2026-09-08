"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChatStore } from "@/store/chat-store";
import { messageConversationHref } from "@/lib/messages/routes";

/**
 * Keeps `?c=<conversationId>` in step with the store.
 *
 * The store is the source of truth; the URL is a mirror. `router.replace` is an
 * async App Router navigation, so `useSearchParams()` keeps returning the *old*
 * `?c=` until that navigation commits. Treating the URL as authoritative during
 * that window makes a fresh click get overwritten by the stale param — the
 * conversation snaps back and only a page refresh recovers it.
 *
 * So the URL only wins when it changes for a reason outside this hook: first
 * mount, a deep link (Ababil AI `?c=&m=`), or back/forward.
 */
export function useConversationUrlSync({
  ready,
  convParam,
  activeConversationId,
}: {
  ready: boolean;
  convParam: string | null;
  activeConversationId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
  // `undefined` (not `null`) so the first run always counts as an external change.
  const prevConvParamRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!ready) return;

    const urlChanged = convParam !== prevConvParamRef.current;
    prevConvParamRef.current = convParam;

    if (
      (urlChanged || !activeConversationId) &&
      convParam &&
      convParam !== activeConversationId
    ) {
      setActiveConversationId(convParam);
      return;
    }

    // Sole writer of `?c=` — no other call site may replace it, or concurrent
    // navigations to the same href cancel each other.
    if (activeConversationId && convParam !== activeConversationId) {
      router.replace(messageConversationHref(pathname, activeConversationId), {
        scroll: false,
      });
    }
  }, [
    ready,
    convParam,
    activeConversationId,
    setActiveConversationId,
    router,
    pathname,
  ]);
}
