import type { VoiceCallSignal } from "@/lib/api/types/voice-call";

type PeerHandlerOptions = {
  sendSignal: (signal: VoiceCallSignal) => Promise<boolean>;
  onConnected: () => void;
  onFailed: (reason: string) => void;
  /** A remote video stream arrived or lost its last video track. */
  onRemoteVideo: (stream: MediaStream, present: boolean) => void;
  onRemoteAudio: (stream: MediaStream) => void;
  disposed: () => boolean;
};

/**
 * Wires ICE trickling, remote track routing and connection-state recovery onto
 * a fresh RTCPeerConnection. Returns a cleanup for the disconnect timer.
 */
export function attachPeerHandlers(peer: RTCPeerConnection, options: PeerHandlerOptions) {
  let disconnectTimer: ReturnType<typeof setTimeout> | null = null;

  peer.onicecandidate = (event) => {
    const candidate = event.candidate;
    if (!candidate || options.disposed()) return;
    void options.sendSignal({
      kind: "ice",
      candidate: candidate.candidate,
      sdp_mid: candidate.sdpMid ?? "",
      sdp_mline_index: candidate.sdpMLineIndex,
    });
  };

  peer.ontrack = (event) => {
    if (options.disposed()) return;
    const remoteStream = event.streams[0] ?? new MediaStream([event.track]);
    if (event.track.kind === "video") {
      // Camera or screen is decided by the media map, not here: the engine
      // looks the stream id up. A muted camera stays present on purpose —
      // the far side turned it off with replaceTrack and will reuse it.
      options.onRemoteVideo(remoteStream, true);
      event.track.onended = () => options.onRemoteVideo(remoteStream, false);
      remoteStream.onremovetrack = () => {
        if (remoteStream.getVideoTracks().length === 0) options.onRemoteVideo(remoteStream, false);
      };
      return;
    }
    if (event.track.kind === "audio") options.onRemoteAudio(remoteStream);
  };

  peer.onconnectionstatechange = () => {
    if (options.disposed()) return;
    if (peer.connectionState === "connected") {
      if (disconnectTimer) clearTimeout(disconnectTimer);
      options.onConnected();
    } else if (peer.connectionState === "failed") {
      options.onFailed("peer_connection_failed");
    } else if (peer.connectionState === "disconnected") {
      if (disconnectTimer) clearTimeout(disconnectTimer);
      disconnectTimer = setTimeout(() => options.onFailed("peer_connection_disconnected"), 12_000);
    }
  };

  return () => {
    if (disconnectTimer) clearTimeout(disconnectTimer);
  };
}
