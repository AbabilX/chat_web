"use client";

import { useState } from "react";
import Link from "next/link";
import { Notification01Icon } from "hugeicons-react";
import { type AppNotification } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotificationsFeed } from "@/components/user/notifications/notifications-feed-provider";
import { toInternalPath } from "@/lib/notifications/desktop";
import { cn } from "@/lib/utils";

type NotificationBellProps = {
  variant?: "default" | "sidebar";
  collapsed?: boolean;
};

export default function NotificationBell({
  variant = "default",
  collapsed = false,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const {
    items,
    unread,
    refresh,
    markRead: markReadById,
    markAllRead,
  } = useNotificationsFeed();

  async function handleOpen(next: boolean) {
    setOpen(next);
    if (next) await refresh();
  }

  async function markRead(n: AppNotification) {
    if (n.read) return;
    await markReadById(n.id);
  }

  const trigger =
    variant === "sidebar" ? (
      <button
        type="button"
        aria-label="Notifications"
        title="Notifications"
        className={cn(
          "relative flex items-center justify-center rounded-lg p-2 text-sm transition-colors",
          "hover:bg-white/4 [data-theme=light]:hover:bg-black/4",
          collapsed && "w-full",
        )}
        style={{ color: "var(--text-muted)" }}>
        <Notification01Icon size={16} className="shrink-0" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-500 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </button>
    ) : unread > 0 ? (
      <Button
        variant="ghost"
        size="sm"
        className="relative h-8 gap-1.5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-2.5 text-indigo-400 font-semibold hover:bg-indigo-500/20 hover:text-indigo-300"
        aria-label="Notifications">
        <Notification01Icon size={16} />
        <span className="text-xs">Inbox</span>
        <span className="h-4 min-w-4 px-1 rounded-full bg-indigo-500 text-[10px] font-bold text-white flex items-center justify-center">
          {unread}
        </span>
      </Button>
    ) : (
      <Button
        variant="ghost"
        size="icon"
        className="relative h-8 w-8 text-slate-400 [data-theme=light]:text-slate-600 rounded-2xl"
        aria-label="Notifications">
        <Notification01Icon size={18} />
      </Button>
    );

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side={variant === "sidebar" ? "right" : "bottom"}
        align="end"
        sideOffset={variant === "sidebar" ? 8 : 4}
        className="w-80 border-(--border) bg-(--surface) p-0">
        <div className="flex items-center justify-between gap-2 border-b border-(--border) p-3">
          <p className="text-sm font-medium text-slate-200 [data-theme=light]:text-slate-900">
            Notifications
          </p>
          {unread > 0 ? (
            <button
              type="button"
              className="shrink-0 text-xs text-indigo-400 hover:text-indigo-300"
              onClick={() => void markAllRead()}>
              Mark all read
            </button>
          ) : null}
        </div>
        <ul className="max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <li className="p-4 text-sm text-slate-500">No notifications</li>
          ) : (
            items.map((n) => (
              <li
                key={n.id}
                className="border-b border-(--border) last:border-0">
                {n.link ? (
                  <Link
                    href={toInternalPath(n.link)}
                    onClick={() => {
                      markRead(n);
                      setOpen(false);
                    }}
                    className={`block p-3 hover:bg-white/5 ${!n.read ? "bg-indigo-500/5" : ""}`}>
                    <p className="text-sm font-medium text-slate-200 [data-theme=light]:text-slate-900">
                      {n.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                      {n.body}
                    </p>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => markRead(n)}
                    className={`w-full p-3 text-left hover:bg-white/5 ${!n.read ? "bg-indigo-500/5" : ""}`}>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
