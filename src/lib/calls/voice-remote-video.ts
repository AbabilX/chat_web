import type { VoiceCallSignal } from "@/lib/api/types/voice-call";
import { VoiceMediaMap } from "./voice-media-map";

type RemoteVideoCallbacks = {
  onCamera: (stream: MediaStream | null) => void;
  onScreen: (stream: MediaStream | null) => void;
};

/**
 * Turns "a video stream arrived / left" plus the peer's media map into two
 * stable answers — its camera and its screen — and only tells the owner when
 * one of them actually changes.
 */
export class VoiceRemoteVideo {
  private readonly map = new VoiceMediaMap();
  private cameraShown: MediaStream | null = null;
  private screenShown: MediaStream | null = null;

  constructor(private readonly callbacks: RemoteVideoCallbacks) {}

  get mapReceived() {
    return this.map.received;
  }

  applyMap(signal: VoiceCallSignal) {
    this.map.apply(signal);
    this.sync();
  }

  track(stream: MediaStream, present: boolean) {
    if (present) this.map.streams.set(stream.id, stream);
    else this.map.streams.delete(stream.id);
    this.sync();
  }

  /** Legacy peer re-offered without video: its screen share stopped. */
  legacyVideoGone() {
    this.map.clear();
    this.sync();
  }

  clear() {
    this.map.clear();
    this.map.received = false;
    this.sync();
  }

  private sync() {
    const camera = this.map.camera;
    if (camera !== this.cameraShown) {
      this.cameraShown = camera;
      this.callbacks.onCamera(camera);
    }
    const screen = this.map.screen;
    if (screen !== this.screenShown) {
      this.screenShown = screen;
      this.callbacks.onScreen(screen);
    }
  }
}
