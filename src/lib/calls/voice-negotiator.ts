import type { VoiceCallSignal } from "@/lib/api/types/voice-call";

/**
 * SDP and ICE for one RTCPeerConnection. Keeps the two rules that matter:
 * a trickled candidate that arrives before the remote description is queued
 * and flushed only after the SDP answer has left, and a bad candidate is
 * never fatal — the others can still connect.
 */
export class VoiceNegotiator {
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private remoteDescriptionSet = false;
  /** Counts applied remote offers, so the fallback below can see an answer. */
  private remoteOffers = 0;
  private renegotiateFallback: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly peer: RTCPeerConnection,
    private readonly sendSignal: (signal: VoiceCallSignal) => Promise<boolean>,
    /**
     * Only the side that placed the call creates offers. The callee asks for
     * one instead. Browsers can roll back a colliding offer, but the phone
     * cannot — flutter_webrtc has no rollback — so glare has to be avoided
     * rather than resolved, and that means one offerer for the whole call.
     */
    private readonly isOfferer = true,
  ) {}

  get answerReceived() {
    return this.peer.remoteDescription?.type === "answer";
  }

  /** Fresh offer, or re-send the current local description on a retry. */
  async offer(retry = false) {
    if (!retry) {
      await this.peer.setLocalDescription(await this.peer.createOffer());
    }
    await this.sendLocal("offer");
  }

  /**
   * Our tracks changed and we need a new offer. The caller makes one; the
   * callee asks the caller for one.
   */
  async renegotiate() {
    if (this.isOfferer) {
      // No stability check: replacing an offer this side already has out is
      // legal, and skipping the offer instead would silently drop the very
      // track change that asked for it.
      await this.offer();
      return;
    }
    if (!(await this.sendSignal({ kind: "renegotiate" }))) {
      throw new Error("signaling_unavailable");
    }
    this.armRenegotiateFallback();
  }

  /**
   * A peer on a build that predates `renegotiate` drops it silently — the
   * socket accepted the frame, so `sendSignal` reports success. If no offer
   * has arrived by the time this fires, offer directly, which is what this
   * side used to do unconditionally. Glare is possible in that fallback; a
   * picture that never appears is worse.
   */
  private armRenegotiateFallback() {
    if (this.renegotiateFallback) clearTimeout(this.renegotiateFallback);
    const before = this.remoteOffers;
    this.renegotiateFallback = setTimeout(() => {
      this.renegotiateFallback = null;
      if (this.remoteOffers !== before || this.peer.signalingState !== "stable") return;
      void this.offer().catch((error) => {
        console.warn("[voice-call] renegotiate fallback failed", error);
      });
    }, 4_000);
  }

  /** `beforeAnswer` runs after the remote offer is applied and before ours goes out. */
  async answer(sdp: string, beforeAnswer: () => Promise<void>) {
    if (this.peer.signalingState !== "stable") {
      // Glare. The browser can drop its own offer and take theirs; doing so
      // beats throwing, which used to end the call for both people.
      await this.peer.setLocalDescription({ type: "rollback" });
    }
    await this.peer.setRemoteDescription({ type: "offer", sdp });
    this.remoteDescriptionSet = true;
    this.remoteOffers += 1;
    if (this.renegotiateFallback) {
      clearTimeout(this.renegotiateFallback);
      this.renegotiateFallback = null;
    }
    await beforeAnswer();
    await this.peer.setLocalDescription(await this.peer.createAnswer());
    await this.sendLocal("answer");
    // An individual trickled candidate may be stale or unsupported. Never
    // let that prevent the SDP answer from reaching the caller.
    await this.flushCandidates();
  }

  async applyAnswer(sdp: string) {
    await this.peer.setRemoteDescription({ type: "answer", sdp });
    this.remoteDescriptionSet = true;
    await this.flushCandidates();
  }

  async addIce(signal: VoiceCallSignal) {
    if (!signal.candidate) return;
    const candidate: RTCIceCandidateInit = {
      candidate: signal.candidate,
      sdpMid: signal.sdp_mid ?? null,
      sdpMLineIndex: signal.sdp_mline_index ?? null,
    };
    if (!this.remoteDescriptionSet) this.pendingCandidates.push(candidate);
    else await this.addCandidate(candidate);
  }

  clear() {
    this.pendingCandidates = [];
    if (this.renegotiateFallback) {
      clearTimeout(this.renegotiateFallback);
      this.renegotiateFallback = null;
    }
  }

  private async sendLocal(kind: "offer" | "answer") {
    const sdp = this.peer.localDescription?.sdp;
    if (!sdp || !(await this.sendSignal({ kind, sdp }))) {
      throw new Error("signaling_unavailable");
    }
  }

  private async flushCandidates() {
    for (const candidate of this.pendingCandidates) {
      await this.addCandidate(candidate);
    }
    this.pendingCandidates = [];
  }

  private async addCandidate(candidate: RTCIceCandidateInit) {
    try {
      await this.peer.addIceCandidate(candidate);
    } catch (error) {
      // ICE is opportunistic: other host/srflx/relay candidates can still
      // establish the call. Keep negotiation alive and leave a useful trace.
      console.warn("[voice-call] ignored ICE candidate", error);
    }
  }
}
