"use client";

import { useEffect } from "react";
import { useNotificationsFeed } from "./notifications-feed-provider";

type BadgingNavigator = Navigator & {
  setAppBadge?: (contents?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

const FAVICON_ID = "notification-favicon";
const ICON_SOURCE = "/icons/icon-32.png";

function updateNativeAppBadge(unread: number) {
  const navigatorWithBadge = navigator as BadgingNavigator;

  if (unread > 0) {
    void navigatorWithBadge.setAppBadge?.(unread).catch(() => {});
    return;
  }

  void navigatorWithBadge.clearAppBadge?.().catch(() => {});
}

function removeNotificationFavicon() {
  document.getElementById(FAVICON_ID)?.remove();
}

function addNotificationFavicon() {
  const image = new Image();
  image.src = ICON_SOURCE;

  image.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(image, 0, 0, 32, 32);
    context.beginPath();
    context.arc(25, 7, 6, 0, Math.PI * 2);
    context.fillStyle = "#ef4444";
    context.fill();
    context.lineWidth = 1.5;
    context.strokeStyle = "#ffffff";
    context.stroke();

    removeNotificationFavicon();
    const favicon = document.createElement("link");
    favicon.id = FAVICON_ID;
    favicon.rel = "icon";
    favicon.type = "image/png";
    favicon.href = canvas.toDataURL("image/png");
    document.head.appendChild(favicon);
  };
}

/** Keeps the installed web app and browser tab visibly marked while notifications remain unread. */
export default function AppIconBadge() {
  const { unread } = useNotificationsFeed();

  useEffect(() => {
    updateNativeAppBadge(unread);

    if (unread === 0) {
      removeNotificationFavicon();
      return;
    }

    addNotificationFavicon();
  }, [unread]);

  useEffect(() => {
    return () => {
      removeNotificationFavicon();
      updateNativeAppBadge(0);
    };
  }, []);

  return null;
}
