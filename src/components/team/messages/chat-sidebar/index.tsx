"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Edit02Icon,
  UserGroupIcon,
  UserAdd01Icon,
  SidebarLeftIcon,
} from "hugeicons-react";
import ConversationList from "./conversation-list";
import type { TeamMember } from "@/lib/api/types/team";
import type { ChatConversation } from "@/lib/api";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chat-store";
import { useTeamContextOptional } from "@/components/team/shared/team-provider";
import CreateChannelDialog from "./create-channel-dialog";
import NewDmDialog from "./new-dm-dialog";
import ConnectionsDialog from "../chat-connections/connections-dialog";
import CreatePersonalGroupDialog from "../chat-connections/create-personal-group-dialog";
import NotificationBell from "@/components/user/notification-bell";
export default function ChatSidebar({
  members,
  onSelect,
  onStartDM,
  language,
  className,
  collapsed = false,
  onCollapsedChange,
  onOpenProfile,
}: {
  members: TeamMember[];
  onSelect: (id: string, messageId?: string) => void;
  onStartDM: (userId: string) => void;
  language?: string | null;
  className?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onOpenProfile?: (userId: string) => void;
}) {
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [personalGroupOpen, setPersonalGroupOpen] = useState(false);
  const currentUserId = useChatStore((s) => s.currentUserId);
  const upsertChannel = useChatStore((s) => s.upsertChannel);
  const independentChat = useChatStore((s) => s.independentChat);
  const hasTeam = !!useTeamContextOptional()?.detail?.team?.id;
  const teamName = useTeamContextOptional()?.detail?.team?.name ?? "";
  function handleGroupCreated(channel: ChatConversation) {
    upsertChannel(channel);
    onSelect(channel.id);
  }
  if (collapsed) {
    return (
      <aside
        className={cn(
          "relative flex h-full w-14 shrink-0 flex-col border-r border-[var(--border)]",
          className,
        )}
        style={{ background: "var(--surface)" }}
      >
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1 p-2">
          <NotificationBell variant="sidebar" collapsed />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-lg shadow-slate-950/10 hover:bg-[var(--surface2)]"
            aria-label="Expand messages sidebar"
            title="Expand messages sidebar"
            onClick={() => onCollapsedChange?.(false)}
          >
            <ArrowRight01Icon size={18} />
          </Button>
        </div>
      </aside>
    );
  }
  return (
    <aside
      className={cn(
        "relative flex h-full w-80 shrink-0 flex-col border-r border-[var(--border)]",
        className,
      )}
      style={{ background: "var(--surface)" }}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ConversationList
          members={members}
          onSelect={onSelect}
          onStartDM={onStartDM}
          onOpenProfile={onOpenProfile}
          language={language}
          onOpenPeople={independentChat ? () => setPeopleOpen(true) : undefined}
        />
      </div>
      <div className="absolute inset-x-3 bottom-3 z-10 flex items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl shadow-slate-950/10">
        <Link
          href={hasTeam ? "/user/workspace/overview" : "/user/overview"}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-white/55 hover:text-[var(--text)] dark:hover:bg-white/10"
        >
          <ArrowLeft01Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{t(language, "chat.backToOverview")}</span>
        </Link>
        <NotificationBell variant="sidebar" />
        {independentChat ? (
          <div className="relative shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl hover:bg-white/55 dark:hover:bg-white/10"
              aria-label="Add people"
              title="Add people — find someone and start a chat"
              onClick={() => setPeopleOpen(true)}
            >
              <UserAdd01Icon size={17} />
            </Button>
          </div>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl hover:bg-white/55 dark:hover:bg-white/10"
          aria-label={t(language, "chat.createChannel")}
          title={
            hasTeam
              ? t(language, "chat.createChannel")
              : "New personal group"
          }
          onClick={() =>
            hasTeam ? setCreateGroupOpen(true) : setPersonalGroupOpen(true)
          }
        >
          <UserGroupIcon size={17} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-xl hover:bg-white/55 dark:hover:bg-white/10"
          aria-label={t(language, "chat.newMessage")}
          title={t(language, "chat.newMessage")}
          onClick={() =>
            !hasTeam && independentChat
              ? setPeopleOpen(true)
              : setComposeOpen(true)
          }
        >
          <Edit02Icon size={17} />
        </Button>
        {onCollapsedChange ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl hover:bg-white/55 dark:hover:bg-white/10"
            aria-label="Collapse messages sidebar"
            title="Collapse messages sidebar"
            onClick={() => onCollapsedChange(true)}
          >
            <SidebarLeftIcon size={17} />
          </Button>
        ) : null}
      </div>
      <CreateChannelDialog
        open={createGroupOpen}
        onOpenChange={setCreateGroupOpen}
        members={members}
        currentUserId={currentUserId}
        teamName={teamName}
        language={language}
        onCreated={handleGroupCreated}
      />
      <ConnectionsDialog
        open={peopleOpen}
        onOpenChange={setPeopleOpen}
        onMessage={onStartDM}
      />
      <CreatePersonalGroupDialog
        open={personalGroupOpen}
        onOpenChange={setPersonalGroupOpen}
        onCreated={handleGroupCreated}
      />
      <NewDmDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        members={members}
        currentUserId={currentUserId}
        onStartDM={onStartDM}
        language={language}
      />
    </aside>
  );
}
