"use client";

import { Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatConversation } from "@/lib/api";
import { useVoiceCall } from "@/components/user/voice-call/voice-call-context";
import { chatConvLabel } from "../chat-utils";

/**
 * Voice, video and screen sharing share one call. Video opens the camera
 * before the first offer; a camera that will not open still places the call.
 */
export default function DmCallActions({
  conv,
  capsule = false,
}: {
  conv: ChatConversation;
  /** Render inline inside a shared capsule — no wrapper div or own border/bg. */
  capsule?: boolean;
}) {
  const voiceCall = useVoiceCall();
  const name = chatConvLabel(conv);
  const unavailable = !!conv.peer_left;
  const disabled = voiceCall.active || unavailable;

  const btn = (
    <Button
      type="button"
      variant={capsule ? "ghost" : "secondary"}
      size="sm"
      className={cn(
        "h-7 shrink-0 gap-1.5 px-2.5 text-xs",
        capsule ? "rounded-none" : "rounded-full",
      )}
      disabled={disabled}
      onClick={() => void voiceCall.start(conv)}
      aria-label={`Call ${name}`}
      title={
        unavailable
          ? "This teammate is unavailable"
          : "Start voice call (screen sharing is available after connecting)"
      }
    >
      <Phone className="size-4" />
      <span className="hidden sm:inline">Call</span>
    </Button>
  );
  const videoBtn = (
    <Button
      type="button"
      variant={capsule ? "ghost" : "secondary"}
      size="sm"
      className={cn(
        "h-7 shrink-0 gap-1.5 px-2.5 text-xs",
        capsule ? "rounded-r-full" : "rounded-full",
      )}
      disabled={disabled}
      onClick={() => void voiceCall.start(conv, { video: true })}
      aria-label={`Video call ${name}`}
      title={unavailable ? "This teammate is unavailable" : "Start video call"}
    >
      <Video className="size-4" />
      <span className="hidden sm:inline">Video</span>
    </Button>
  );

  if (capsule) return <>{btn}{videoBtn}</>;

  return (
    <div className="ml-auto flex shrink-0 items-center gap-1">
      {btn}
      {videoBtn}
    </div>
  );
}
