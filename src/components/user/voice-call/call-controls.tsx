"use client";

import { Mic, MicOff, Minimize2, MonitorUp, Phone, PhoneOff, ScreenShareOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VoiceCallContextValue } from "./voice-call-context";

/** Mute / share / hang-up cluster, shared by every call layout. */
export default function CallControls({
  call,
  compact = false,
  onMinimize,
  onRequestLeave,
}: {
  call: VoiceCallContextValue;
  compact?: boolean;
  onMinimize?: () => void;
  onRequestLeave?: () => void;
}) {
  const { view } = call;
  const incoming = view.phase === "incoming-ringing";
  const screenOnly = view.mode === "screen";
  const live = view.phase === "connecting" || view.phase === "connected";
  const canMute = !screenOnly && !view.microphoneUnavailable && live;
  // The other side holds the one shared screen a 1:1 call has. Pressing Share
  // there takes it over; the button used to be disabled instead, which read as
  // "screen sharing is broken on this call".
  const takingOver = !!view.remoteScreen && !view.screenSharing;
  const cameraOn = !!view.localCamera;
  const size = compact ? "h-9 w-9 px-0" : "h-11 rounded-full px-3 sm:px-4";
  const icon = compact ? "h-4 w-4" : "h-5 w-5";
  const label = (text: string) =>
    compact ? null : <span className="hidden sm:inline">{text}</span>;

  if (incoming) {
    return (
      <>
        <Button
          type="button"
          size="icon"
          className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-400"
          onClick={() => void call.accept()}
          aria-label={screenOnly ? "Accept screen share" : view.mode === "video" ? "Accept video call" : "Accept call"}
        >
          {screenOnly ? <MonitorUp className="h-5 w-5" /> : view.mode === "video" ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="h-14 w-14 rounded-full bg-rose-600 text-white hover:bg-rose-500"
          onClick={() => void call.hangUp()}
          aria-label={screenOnly ? "Decline screen share" : "Decline call"}
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {!compact && view.microphoneUnavailable ? (
        <p className="text-xs text-amber-500 [data-theme=light]:text-amber-700">
          Listening only — no microphone was detected.
        </p>
      ) : null}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {onMinimize ? (
          <Button
            type="button"
            variant="secondary"
            className={`${size} rounded-full`}
            onClick={onMinimize}
            aria-label="Minimize call"
          >
            <Minimize2 className={icon} />
            {label("Minimize")}
          </Button>
        ) : null}
        {canMute ? (
          <Button
            type="button"
            variant="secondary"
            className={`${size} rounded-full`}
            onClick={call.toggleMute}
            aria-label={view.muted ? "Unmute microphone" : "Mute microphone"}
          >
            {view.muted ? <MicOff className={icon} /> : <Mic className={icon} />}
            {label(view.muted ? "Unmute" : "Mute")}
          </Button>
        ) : null}
        {!screenOnly && live ? (
          <Button
            type="button"
            variant={cameraOn ? "default" : "secondary"}
            className={`${size} rounded-full`}
            onClick={() => void call.toggleCamera()}
            aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
          >
            {cameraOn ? <Video className={icon} /> : <VideoOff className={icon} />}
            {label(cameraOn ? "Camera off" : "Camera")}
          </Button>
        ) : null}
        {!screenOnly && view.phase === "connected" ? (
          <Button
            type="button"
            variant="secondary"
            className={`${size} rounded-full`}
            onClick={() => void call.toggleScreenShare()}
            aria-label={
              view.screenSharing
                ? "Stop sharing screen"
                : takingOver
                  ? "Take over screen sharing"
                  : "Share screen"
            }
          >
            {view.screenSharing ? <ScreenShareOff className={icon} /> : <MonitorUp className={icon} />}
            {label(view.screenSharing ? "Stop share" : takingOver ? "Take over" : "Share screen")}
          </Button>
        ) : null}
        <Button
          type="button"
          className={`${size} rounded-full bg-rose-600 text-white hover:bg-rose-500`}
          onClick={() => {
            if (!onRequestLeave) void call.hangUp();
            else onRequestLeave();
          }}
          aria-label={screenOnly ? "Stop sharing" : "Leave call"}
        >
          <PhoneOff className={icon} />
          {label("Leave")}
        </Button>
      </div>
    </div>
  );
}
