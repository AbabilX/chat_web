import type { VoiceCallSignal } from "@/lib/api/types/voice-call";

/**
 * Which remote video stream is the camera and which is the screen.
 *
 * Two video tracks on one peer connection are indistinguishable on the wire.
 * The sender tells us with a `media` signal carrying its MediaStream ids, sent
 * ahead of the offer/answer that adds or removes a track — so by the time
 * `ontrack` fires the id is already known. A peer that never sends one (an
 * older build) has only ever sent a screen, which is what the fallback keeps
 * drawing.
 */
export class VoiceMediaMap {
  cameraId: string | null = null;
  screenId: string | null = null;
  received = false;

  /**
   * Every remote video stream we have been handed, by id. Kept even while the
   * far side has its camera off: the track only mutes — the stream object is
   * reused when they turn it back on without renegotiating.
   */
  readonly streams = new Map<string, MediaStream>();

  apply(signal: VoiceCallSignal) {
    this.received = true;
    this.cameraId = VoiceMediaMap.id(signal.camera_stream);
    this.screenId = VoiceMediaMap.id(signal.screen_stream);
  }

  private static id(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  get camera(): MediaStream | null {
    return this.cameraId ? this.streams.get(this.cameraId) ?? null : null;
  }

  get screen(): MediaStream | null {
    if (this.screenId) return this.streams.get(this.screenId) ?? null;
    if (this.received) return null;
    // Legacy peer: no map ever arrived, so the only video it can send is a
    // screen share — the newest stream we hold.
    let last: MediaStream | null = null;
    for (const stream of this.streams.values()) last = stream;
    return last;
  }

  /**
   * The peer has named a stream we are not receiving yet: it has just added a
   * track, and that track may need a transceiver of ours to arrive on.
   */
  get awaiting(): boolean {
    return [this.cameraId, this.screenId].some((id) => id !== null && !this.streams.has(id));
  }

  clear() {
    this.streams.clear();
    this.cameraId = null;
    this.screenId = null;
  }
}
