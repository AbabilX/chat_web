"use client";

import type { AppUser } from "@/lib/api";
import ChatStoreSync from "@/components/team/messages/chat-store-sync";
import { TeamProvider } from "@/components/team/shared/team-provider";
import GroupCallProvider from "@/components/user/group-call/group-call-provider";
import AppIconBadge from "@/components/user/notifications/app-icon-badge";
import DesktopNotificationEngine from "@/components/user/notifications/desktop-notification-engine";
import NotificationEnableBanner from "@/components/user/notifications/enable-banner";
import { NotificationsFeedProvider } from "@/components/user/notifications/notifications-feed-provider";
import TabTitleBadge from "@/components/user/notifications/tab-title-badge";
import VoiceCallProvider from "@/components/user/voice-call/voice-call-provider";

export default function ShellProviders({
  user,
  children,
}: {
  user: AppUser | null;
  children: React.ReactNode;
}) {
  return (
    <TeamProvider>
      <NotificationsFeedProvider>
        <VoiceCallProvider currentUserId={user?.id}>
          <GroupCallProvider currentUserId={user?.id}>
            <ChatStoreSync />
            <DesktopNotificationEngine
              serverEnabled={user?.desktop_notifications_enabled ?? true}
            />
            <AppIconBadge />
            <TabTitleBadge />
            <NotificationEnableBanner language={user?.app_language ?? "en"} />
            {children}
          </GroupCallProvider>
        </VoiceCallProvider>
      </NotificationsFeedProvider>
    </TeamProvider>
  );
}
