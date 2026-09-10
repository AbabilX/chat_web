"use client";

import { useEffect, useState } from "react";
import { parseLinkPreviewDate } from "./link-preview-date";
import { unfurlLink } from "./unfurl";
import {
  cachedPreview,
  rememberPreview,
  type LinkPreviewMeta,
} from "./link-preview-cache";

/** One request per URL, however many bubbles are showing the same link. */
const inflight = new Map<string, Promise<LinkPreviewMeta | null>>();

async function request(url: string): Promise<LinkPreviewMeta | null> {
  const data = await unfurlLink(url);
  if (!data?.title) return null;
  return {
    title: data.title,
    description: data.description || undefined,
    image: data.image || undefined,
    logo: data.logo || undefined,
    siteName: data.site_name || undefined,
    date: parseLinkPreviewDate(data.date) ?? undefined,
  };
}

function load(url: string): Promise<LinkPreviewMeta | null> {
  const running = inflight.get(url);
  if (running) return running;
  const promise = request(url)
    .catch((error) => {
      // Never rethrown — a link with no card is not a broken message — but a
      // silent catch is what made the last two failures indistinguishable
      // from "this page has no metadata". Leave a trace.
      console.warn("[link-preview] could not unfurl", url, error);
      return null;
    })
    .then((meta) => {
      rememberPreview(url, meta);
      return meta;
    })
    .finally(() => {
      inflight.delete(url);
    });
  inflight.set(url, promise);
  return promise;
}

export function useLinkPreview(url: string) {
  const cached = cachedPreview(url);
  const [state, setState] = useState<{
    url: string;
    meta: LinkPreviewMeta | null;
    loading: boolean;
  }>({ url, meta: cached?.meta ?? null, loading: !cached });

  useEffect(() => {
    const hit = cachedPreview(url);
    if (hit) {
      setState({ url, meta: hit.meta, loading: false });
      return;
    }
    let active = true;
    setState({ url, meta: null, loading: true });
    void load(url).then((meta) => {
      if (active) setState({ url, meta, loading: false });
    });
    return () => {
      active = false;
    };
  }, [url]);

  // The first render after `url` changes still holds the previous answer;
  // reporting it would flash the old site's title under the new link.
  if (state.url !== url) return { meta: cached?.meta ?? null, loading: !cached };
  return { meta: state.meta, loading: state.loading };
}
