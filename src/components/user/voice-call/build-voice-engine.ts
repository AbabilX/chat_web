import type { MutableRefObject } from "react";
import type { VoiceCallSignal } from "@/lib/api";
import { VoicePeerEngine } from "@/lib/calls/voice-peer-engine";
import type { WebCallView } from "./voice-call-context";

type EngineDeps = {
  sendSignal: (signal: VoiceCallSignal) => Promise<boolean>;
  viewRef: MutableRefObject<WebCallView>;
  setView: (next: WebCallView) => void;
  clearTimers: () => void;
  fail: (reason: string) => Promise<void>;
  hangUpRef: MutableRefObject<() => Promise<void>>;
  screenOnly: boolean;
  /** The side that placed the call: the only one that creates offers. */
  isOfferer: boolean;
};

/** Every engine callback lands in the view; nothing else is decided here. */
export function buildVoiceEngine(deps: EngineDeps) {
  const { viewRef, setView, screenOnly } = deps;
  return new VoicePeerEngine({
    sendSignal: deps.sendSignal,
    isOfferer: deps.isOfferer,
    onConnected: () => {
      deps.clearTimers();
      setView({ ...viewRef.current, phase: "connected", connectedAt: Date.now(), error: undefined });
    },
    onFailed: (reason) => void deps.fail(reason),
    onLocalScreenChanged: (screenSharing) => {
      setView({ ...viewRef.current, screenSharing, screenError: undefined });
      // Legacy screen-only sessions still end when their only media stops.
      if (!screenSharing && screenOnly) void deps.hangUpRef.current();
    },
    onRemoteScreenChanged: (remoteScreen) => {
      setView({ ...viewRef.current, remoteScreen: remoteScreen ?? undefined });
    },
    onLocalCameraChanged: (localCamera) => {
      setView({ ...viewRef.current, localCamera: localCamera ?? undefined });
    },
    onRemoteCameraChanged: (remoteCamera) => {
      setView({ ...viewRef.current, remoteCamera: remoteCamera ?? undefined });
    },
  });
}
