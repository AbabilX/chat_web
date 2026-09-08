import { captureScreenStream, stopStream } from "./voice-media";
import { SCREEN_MAX_BITRATE, capVideoSendBitrate } from "./voice-video-quality";

/**
 * The local screen share on one peer connection. Unlike the camera it is a
 * real add/remove each time: a display capture is a new track with a new
 * source, and the browser's own "stop sharing" bar can end it under us.
 */
export class VoiceScreenLane {
  private stream: MediaStream | null = null;
  private sender: RTCRtpSender | null = null;

  constructor(private readonly onChanged: (sharing: boolean) => void) {}

  get on() {
    return this.stream !== null;
  }

  get wireId() {
    return this.stream?.id ?? "";
  }

  /** `onEnded` is the browser's stop-sharing bar; the owner renegotiates. */
  async start(peer: RTCPeerConnection, onEnded: () => void) {
    if (this.stream) return;
    this.adopt(peer, await captureScreenStream(), onEnded);
  }

  adopt(peer: RTCPeerConnection, stream: MediaStream, onEnded: () => void) {
    const track = stream.getVideoTracks()[0];
    if (!track) {
      stopStream(stream);
      throw new Error("screen_capture_unavailable");
    }
    this.stream = stream;
    this.sender = peer.addTrack(track, stream);
    // Fire-and-forget: `adopt` is synchronous, and an uncapped share still works.
    void capVideoSendBitrate(this.sender, SCREEN_MAX_BITRATE, "maintain-resolution");
    this.onChanged(true);
    track.onended = onEnded;
  }

  /** Removes the track; the owner decides whether to renegotiate. */
  stop(peer: RTCPeerConnection | null) {
    const stream = this.stream;
    if (!stream) return false;
    stopStream(stream);
    if (peer && this.sender && peer.connectionState !== "closed") {
      try {
        peer.removeTrack(this.sender);
      } catch {
        // Already closed; nothing to remove from.
      }
    }
    this.stream = null;
    this.sender = null;
    this.onChanged(false);
    return true;
  }
}
