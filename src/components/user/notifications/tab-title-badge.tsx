"use client";

import { useEffect } from "react";
import { useNotificationsFeed } from "./notifications-feed-provider";

export default function TabTitleBadge() {
  const { unread } = useNotificationsFeed();

  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = unread > 0 ? `(${unread}) ${base}` : base;

    return () => {
      document.title = document.title.replace(/^\(\d+\)\s*/, "");
    };
  }, [unread]);

  return null;
}
