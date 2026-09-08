"use client";

import { LoaderCircle, Mic, MicOff, Minimize2, MonitorUp, PhoneOff, ScreenShareOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GroupCallContextValue } from "./group-call-context";

export default function GroupCallControls({
  call,
  compact = false,
  onMinimize,
  onRequestLeave,
}: {
  call: GroupCallContextValue;
  compact?: boolean;
  onMinimize?: () => void;
  onRequestLeave?: () => void;
}) {
  const { view } = call;
  const otherScreen = !!view.call?.screen_sharer_id && !view.sharingScreen;
  const screenUnavailable = call.screenSharePending;
  const size = compact ? "h-9 w-9 px-0" : "h-11 rounded-full px-3 sm:px-4";
  const icon = compact ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {!compact && view.microphoneUnavailable ? (
        <p className="text-xs text-amber-500 [data-theme=light]:text-amber-700">
          Listening only — no microphone was detected.
        </p>
      ) : null}
      {!compact && otherScreen ? (
        <p className="text-xs text-[var(--text-muted)]">
          {view.call?.screen_sharer_name || "Another participant"} is sharing — you can take over
        </p>
      ) : null}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
      {onMinimize ? (
        <Button
          type="button"
          variant="secondary"
          className={`${size} rounded-full`}
          onClick={onMinimize}
          aria-label="Minimize group call"
        >
          <Minimize2 className={icon} />
          {compact ? null : <span className="hidden sm:inline">Minimize</span>}
        </Button>
      ) : null}
      {view.phase === "connected" ? (
        <>
      <Button
        type="button"
        variant="secondary"
        className={`${size} rounded-full`}
        disabled={view.microphoneUnavailable}
        onClick={() => void call.toggleMute()}
        aria-label={view.microphoneUnavailable
          ? "Microphone unavailable"
          : view.muted ? "Unmute microphone" : "Mute microphone"}
      >
        {view.muted ? <MicOff className={icon} /> : <Mic className={icon} />}
        {compact ? null : (
          <span className="hidden sm:inline">
            {view.microphoneUnavailable ? "No microphone" : view.muted ? "Unmute" : "Mute"}
          </span>
        )}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className={`${size} rounded-full`}
        disabled={screenUnavailable}
        onClick={() => void call.toggleScreenShare()}
        aria-label={view.sharingScreen
          ? "Stop sharing screen"
          : otherScreen ? "Take over screen sharing" : "Share screen"}
        title={otherScreen ? "Start sharing and stop the current screen share" : undefined}
      >
        {call.screenSharePending
          ? <LoaderCircle className={`${icon} animate-spin`} />
          : view.sharingScreen
            ? <ScreenShareOff className={icon} />
            : <MonitorUp className={icon} />}
        {compact ? null : (
          <span className="hidden sm:inline">
            {view.sharingScreen ? "Stop share" : otherScreen ? "Take over screen" : "Share screen"}
          </span>
        )}
      </Button>
        </>
      ) : null}
      <Button
        type="button"
        className={`${size} rounded-full bg-rose-600 text-white hover:bg-rose-500`}
        onClick={() => (onRequestLeave ? onRequestLeave() : void call.leave())}
        aria-label="Leave group call"
      >
        <PhoneOff className={icon} />
        {compact ? null : <span className="hidden sm:inline">Leave</span>}
      </Button>
      </div>
    </div>
  );
}
