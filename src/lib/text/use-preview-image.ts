"use client";

import { useEffect, useState } from "react";
import { shouldPreviewUrl } from "./link-safety";

export type PreviewImage = { src: string; width: number; height: number };

const cache = new Map<string, PreviewImage>();
const inflight = new Map<string, Promise<PreviewImage | null>>();

function measure(src: string): Promise<PreviewImage | null> {
  return new Promise((resolve) => {
    const probe = new Image();
    probe.onload = () =>
      resolve({ src, width: probe.naturalWidth, height: probe.naturalHeight });
    probe.onerror = () => resolve(null);
    probe.src = src;
  });
}

function load(url: string): Promise<PreviewImage | null> {
  const running = inflight.get(url);
  if (running) return running;
  const promise = measure(url)
    .then((image) => {
      if (image) cache.set(url, image);
      return image;
    })
    .catch(() => null)
    .finally(() => {
      inflight.delete(url);
    });
  inflight.set(url, promise);
  return promise;
}

export function forgetPreviewImage(url: string) {
  cache.delete(url);
}

export function usePreviewImage(url: string | undefined): PreviewImage | null {
  const safe = url && shouldPreviewUrl(url) ? url : undefined;
  const [state, setState] = useState<{ url?: string; image: PreviewImage | null }>(() => ({
    url: safe,
    image: safe ? (cache.get(safe) ?? null) : null,
  }));

  useEffect(() => {
    if (!safe) {
      setState({ url: safe, image: null });
      return;
    }
    const held = cache.get(safe);
    if (held) {
      setState({ url: safe, image: held });
      return;
    }
    let active = true;
    setState({ url: safe, image: null });
    void load(safe).then((image) => {
      if (active) setState({ url: safe, image });
    });
    return () => {
      active = false;
    };
  }, [safe]);

  if (state.url !== safe) return safe ? (cache.get(safe) ?? null) : null;
  return state.image;
}
