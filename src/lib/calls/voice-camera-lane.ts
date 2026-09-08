import { captureCameraStream, stopStream } from "./voice-media";
import { CAMERA_MAX_BITRATE, capVideoSendBitrate } from "./voice-video-quality";

/**
 * The local camera on one peer connection.
 *
 * The first `start` adds a transceiver (renegotiate). Every later off/on is a
 * `replaceTrack` on that same sender — no offer, no glare — which is also why
 * the wire stream id is remembered from the first addTrack: replaceTrack keeps
 * the original msid, and that is the id the far side's media map has to name.
 */
export class VoiceCameraLane {
  private stream: MediaStream | null = null;
  private sender: RTCRtpSender | null = null;
  private wireStreamId: string | null = null;

  constructor(private readonly onChanged: (stream: MediaStream | null) => void) {}

  get on() {
    return this.stream !== null;
  }

  get localStream() {
    return this.stream;
  }

  /** What the `media` signal reports: the id the peer learned, or "" for off. */
  get wireId() {
    return this.stream ? this.wireStreamId ?? "" : "";
  }

  /** Returns true when the peer needs a fresh offer (first camera ever). */
  async start(peer: RTCPeerConnection): Promise<boolean> {
    if (this.stream) return false;
    const stream = await captureCameraStream();
    const track = stream.getVideoTracks()[0];
    let needsOffer = false;
    try {
      if (this.sender) {
        await this.sender.replaceTrack(track);
      } else {
        this.sender = peer.addTrack(track, stream);
        this.wireStreamId = stream.id;
        needsOffer = true;
      }
    } catch (error) {
      stopStream(stream);
      throw error;
    }
    if (this.sender) await capVideoSendBitrate(this.sender, CAMERA_MAX_BITRATE, "maintain-framerate");
    this.stream = stream;
    // Unplugged mid-call: fall back to audio rather than freezing a frame.
    track.onended = () => void this.stop().catch(() => {});
    this.onChanged(stream);
    return needsOffer;
  }

  async stop() {
    const stream = this.stream;
    if (!stream) return;
    this.stream = null;
    stopStream(stream);
    try {
      await this.sender?.replaceTrack(null);
    } catch {
      // The connection is closing; the far side hears nothing either way.
    }
    this.onChanged(null);
  }

  setPaused(paused: boolean) {
    this.stream?.getVideoTracks().forEach((track) => {
      track.enabled = !paused;
    });
  }

  dispose() {
    const stream = this.stream;
    this.stream = null;
    this.sender = null;
    this.wireStreamId = null;
    if (stream) {
      stopStream(stream);
      this.onChanged(null);
    }
  }
}
