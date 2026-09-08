"use client";

import { useCallback, type MutableRefObject } from "react";
import type { VoicePeerEngine } from "@/lib/calls/voice-peer-engine";
import { cameraErrorMessage } from "@/lib/calls/voice-media";
import type { WebCallView } from "./voice-call-context";

type ToggleDeps = {
  engineRef: MutableRefObject<VoicePeerEngine | null>;
  viewRef: MutableRefObject<WebCallView>;
  setView: (next: WebCallView) => void;
};

/** Mute / screen share / camera — the in-call switches, off the provider. */
export function useCallMediaToggles({ engineRef, viewRef, setView }: ToggleDeps) {
  const toggleMute = useCallback(() => {
    if (viewRef.current.microphoneUnavailable) return;
    const muted = !viewRef.current.muted;
    engineRef.current?.setMuted(muted);
    setView({ ...viewRef.current, muted });
  }, [engineRef, setView, viewRef]);

  const toggleScreenShare = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine || viewRef.current.phase !== "connected" || viewRef.current.mode === "screen") return;
    try {
      if (viewRef.current.screenSharing) await engine.stopScreenShare();
      else await engine.startScreenShare();
    } catch (error) {
      const code = error instanceof Error ? error.name : "screen_capture_failed";
      setView({
        ...viewRef.current,
        screenError: code === "NotAllowedError" ? "Screen sharing permission was not granted." : "Could not share this screen.",
      });
    }
  }, [engineRef, setView, viewRef]);

  // Never fatal: a camera that will not open leaves the call as it was, with
  // the reason shown where the mute/share notes already live.
  const toggleCamera = useCallback(async () => {
    const engine = engineRef.current;
    const phase = viewRef.current.phase;
    if (!engine || viewRef.current.mode === "screen") return;
    if (phase !== "connected" && phase !== "connecting") return;
    try {
      if (engine.cameraOn) await engine.stopCamera();
      else await engine.startCamera();
      setView({ ...viewRef.current, cameraError: undefined });
    } catch (error) {
      setView({ ...viewRef.current, cameraError: cameraErrorMessage(error) });
    }
  }, [engineRef, setView, viewRef]);

  return { toggleMute, toggleScreenShare, toggleCamera };
}
