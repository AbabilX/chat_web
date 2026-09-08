"use client";

import { useState } from "react";
import { Notification03Icon, Cancel01Icon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { t, type AppLanguage } from "@/lib/i18n";
import {
  dismissBanner,
  getPermission,
  isBannerDismissed,
  notificationsSupported,
  requestNotificationPermission,
  setDesktopNotifEnabled,
} from "@/lib/notifications/desktop";

export default function NotificationEnableBanner({
  language,
}: {
  language: AppLanguage;
}) {
  const [visible, setVisible] = useState(
    () =>
      notificationsSupported() &&
      getPermission() === "default" &&
      !isBannerDismissed(),
  );

  async function handleEnable() {
    const result = await requestNotificationPermission();
    if (result === "granted") setDesktopNotifEnabled(true);
    dismissBanner();
    setVisible(false);
  }

  function handleDismiss() {
    dismissBanner();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        className="flex w-full max-w-md items-center gap-3 rounded-2xl border p-3 shadow-lg"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
          <Notification03Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-100 [data-theme=light]:text-slate-900">
            {t(language, "notif.enableBannerTitle")}
          </p>
          <p className="truncate text-xs text-slate-400">
            {t(language, "notif.enableBannerDesc")}
          </p>
        </div>
        <Button type="button" size="sm" onClick={handleEnable} className="shrink-0">
          {t(language, "notif.enableBannerAction")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-slate-400"
          aria-label={t(language, "notif.enableBannerDismiss")}
          onClick={handleDismiss}>
          <Cancel01Icon size={16} />
        </Button>
      </div>
    </div>
  );
}
