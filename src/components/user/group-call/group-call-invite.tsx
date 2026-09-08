"use client";

import { Headphones, PhoneOff, Users, VolumeX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { chatInitials } from "@/components/team/messages/chat-utils";
import { retryRingtone } from "@/lib/calls/ringtone";
import { useRingtoneBlocked } from "@/lib/calls/use-call-ringtone";
import type { GroupCall } from "@/lib/api";

/** Ringing card for a group call, mirroring the incoming 1:1 call modal. */
export default function GroupCallInvite({
  call,
  onJoin,
  onDecline,
}: {
  call: GroupCall;
  onJoin: () => void;
  onDecline: () => void;
}) {
  const channel = call.conversation_name || "Group call";
  const starter = call.starter_name || "Someone";
  const soundBlocked = useRingtoneBlocked();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Incoming group call"
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-950/95 px-6 py-8 text-center text-white shadow-2xl">
        <Avatar className="mx-auto h-24 w-24 ring-4 ring-indigo-500/20">
          <AvatarImage src={call.starter_avatar_url} alt={starter} />
          <AvatarFallback className="text-2xl">{chatInitials(channel)}</AvatarFallback>
        </Avatar>
        <h2 className="mt-5 truncate text-xl font-semibold">{channel}</h2>
        <p className="mt-2 min-h-5 text-sm text-slate-400">
          {starter} started a group call
        </p>
        {call.participant_count > 0 ? (
          <p className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5" /> {call.participant_count} already in call
          </p>
        ) : null}

        {soundBlocked ? (
          <button
            type="button"
            onClick={retryRingtone}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/25"
          >
            <VolumeX className="h-3.5 w-3.5" /> Sound is off — tap to enable
          </button>
        ) : null}

        <div className="mt-8 flex items-center justify-center gap-5">
          <Button
            type="button"
            size="icon"
            className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-400"
            onClick={onJoin}
            aria-label="Join group call"
          >
            <Headphones className="size-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="h-14 w-14 rounded-full bg-red-500 text-white hover:bg-red-400"
            onClick={onDecline}
            aria-label="Deny group call"
          >
            <PhoneOff className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
