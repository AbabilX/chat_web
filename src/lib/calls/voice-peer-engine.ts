import type { VoiceCallSignal, VoiceIceServer } from "@/lib/api/types/voice-call";
import { sdpSendsVideo } from "./voice-sdp";
import { captureMicStream, isMicrophoneUnavailableError, stopStream } from "./voice-media";
import { attachPeerHandlers } from "./voice-peer-handlers";
import { VoiceCameraLane } from "./voice-camera-lane";
import { VoiceScreenLane } from "./voice-screen-lane";
import { VoiceRemoteVideo } from "./voice-remote-video";
import { VoiceNegotiator } from "./voice-negotiator";

type VoicePeerEngineOptions = {
  sendSignal: (signal: VoiceCallSignal) => Promise<boolean>;
  onConnected: () => void;
  onFailed: (reason: string) => void;
  onLocalScreenChanged: (sharing: boolean) => void;
  onRemoteScreenChanged: (stream: MediaStream | null) => void;
  onLocalCameraChanged: (stream: MediaStream | null) => void;
  onRemoteCameraChanged: (stream: MediaStream | null) => void;
  /** True on the side that placed the call: the only side that may offer. */
  isOfferer?: boolean;
};

/**
 * `microphone: false` is the screen-share-only session: no getUserMedia call is
 * ever made, so the browser shows no mic indicator and asks for no permission.
 * `camera: true` opens the camera BEFORE the first offer/answer so a video call
 * negotiates exactly once — starting it on `connected` had both sides re-offer
 * in the same instant, and colliding offers are dropped silently.
 */
type PrepareOptions = {
  microphone: boolean;
  camera?: boolean;
  screenStream?: MediaStream | null;
};

export type PrepareResult = {
  microphone: boolean;
  /** Set when the camera was asked for and could not open; the call goes on. */
  cameraError?: unknown;
};

export class VoicePeerEngine {
  private peer: RTCPeerConnection | null = null;
  private negotiator: VoiceNegotiator | null = null;
  private localStream: MediaStream | null = null;
  private remoteAudio: HTMLAudioElement | null = null;
  private readonly screen: VoiceScreenLane;
  private readonly camera: VoiceCameraLane;
  private readonly remote: VoiceRemoteVideo;
  private disposed = false;
  private clearHandlers: (() => void) | null = null;

  constructor(private readonly options: VoicePeerEngineOptions) {
    this.screen = new VoiceScreenLane(options.onLocalScreenChanged);
    this.camera = new VoiceCameraLane(options.onLocalCameraChanged);
    this.remote = new VoiceRemoteVideo({
      onCamera: options.onRemoteCameraChanged,
      onScreen: options.onRemoteScreenChanged,
    });
  }

  get ready() {
    return this.peer !== null;
  }

  get answerReceived() {
    return this.negotiator?.answerReceived ?? false;
  }

  get cameraOn() {
    return this.camera.on;
  }

  async prepare(iceServers: VoiceIceServer[], setup: PrepareOptions): Promise<PrepareResult> {
    if (this.disposed) throw new Error("voice peer disposed");
    if (this.ready) return { microphone: !!this.localStream?.getAudioTracks().length };

    if (setup.microphone) {
      try {
        const stream = await captureMicStream();
        if (this.disposed) {
          stopStream(stream);
          return { microphone: false };
        }
        this.localStream = stream;
      } catch (error) {
        if (!isMicrophoneUnavailableError(error)) throw error;
      }
    }

    const peer = new RTCPeerConnection({
      iceServers,
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    });
    this.peer = peer;
    this.negotiator = new VoiceNegotiator(peer, this.options.sendSignal, this.options.isOfferer ?? true);
    this.clearHandlers = attachPeerHandlers(peer, {
      sendSignal: this.options.sendSignal,
      onConnected: this.options.onConnected,
      onFailed: this.options.onFailed,
      onRemoteVideo: (stream, present) => this.remote.track(stream, present),
      onRemoteAudio: (stream) => this.playRemoteAudio(stream),
      disposed: () => this.disposed,
    });

    const local = this.localStream;
    if (local) local.getAudioTracks().forEach((track) => peer.addTrack(track, local));
    else if (setup.microphone) peer.addTransceiver("audio", { direction: "recvonly" });
    if (setup.screenStream) this.screen.adopt(peer, setup.screenStream, this.onScreenEnded);

    const result: PrepareResult = { microphone: !!local?.getAudioTracks().length };
    if (setup.camera) {
      // No camera is an audio call, never a failed one. The offer/answer that
      // follows carries the media map, so nothing is sent here.
      try {
        await this.camera.start(peer);
      } catch (error) {
        result.cameraError = error;
      }
      if (this.disposed) this.camera.dispose();
    }
    return result;
  }

  async createAndSendOffer(retry = false) {
    const negotiator = this.requireNegotiator();
    if (!retry && this.camera.on) await this.sendMediaMap();
    await negotiator.offer(retry);
  }

  /** Camera replaces a running screen share (one video lane). Later off/on is a replaceTrack: no glare. */
  async startCamera() {
    const peer = this.requirePeer();
    const droppedScreen = this.screen.stop(peer);
    const needsOffer = await this.camera.start(peer);
    if (this.disposed) return;
    await this.sendMediaMap();
    if (needsOffer || droppedScreen) await this.requireNegotiator().renegotiate();
  }

  async stopCamera() {
    if (!this.camera.on) return;
    await this.camera.stop();
    if (!this.disposed) await this.sendMediaMap();
  }

  setCameraPaused(paused: boolean) {
    this.camera.setPaused(paused);
  }

  /** Sharing a screen turns the camera off — the far side shows one or the other. */
  async startScreenShare() {
    if (this.screen.on) return;
    const peer = this.requirePeer();
    await this.camera.stop();
    await this.screen.start(peer, this.onScreenEnded);
    try {
      await this.sendMediaMap();
      await this.requireNegotiator().renegotiate();
    } catch (error) {
      await this.stopScreenShare(false);
      throw error;
    }
  }

  async stopScreenShare(renegotiate = true) {
    const peer = this.peer;
    if (!this.screen.stop(peer)) return;
    if (renegotiate && peer && peer.connectionState !== "closed" && !this.disposed) {
      await this.sendMediaMap();
      await this.requireNegotiator().renegotiate();
    }
  }

  async handleSignal(signal: VoiceCallSignal) {
    if (this.disposed) return;
    const negotiator = this.requireNegotiator();
    if (signal.kind === "media") {
      this.remote.applyMap(signal);
    } else if (signal.kind === "offer" && signal.sdp) {
      if (!this.remote.mapReceived && !sdpSendsVideo(signal.sdp)) {
        this.remote.legacyVideoGone();
      }
      await negotiator.answer(signal.sdp, async () => {
        if (this.camera.on || this.screen.on) await this.sendMediaMap();
      });
    } else if (signal.kind === "answer" && signal.sdp) {
      await negotiator.applyAnswer(signal.sdp);
    } else if (signal.kind === "renegotiate") {
      // The peer's tracks changed and it is not allowed to offer.
      if (this.options.isOfferer ?? true) {
        this.ensureVideoRecvCapacity();
        await negotiator.renegotiate();
      }
    } else if (signal.kind === "screen_takeover") {
      // The peer has started sharing, and a 1:1 call shows one shared screen.
      // A no-op unless we are the one sharing.
      await this.stopScreenShare();
    } else if (signal.kind === "ice") {
      await negotiator.addIce(signal);
    }
  }

  setMuted(muted: boolean) {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }

  async dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.clearHandlers?.();
    this.screen.stop(this.peer);
    this.camera.dispose();
    stopStream(this.localStream);
    this.localStream = null;
    if (this.remoteAudio) this.remoteAudio.srcObject = null;
    this.remoteAudio = null;
    this.peer?.close();
    this.peer = null;
    this.negotiator?.clear();
    this.negotiator = null;
    this.remote.clear();
  }

  // The browser's own "stop sharing" bar must reach the peer; a race with hang-up is not worth surfacing.
  /**
   * "I am taking the screen share" — the peer stops sharing its own.
   *
   * Sent only after our own capture succeeded: a picker the user backs out of
   * must not end somebody else's share for nothing.
   */
  async requestScreenTakeover() {
    if (this.disposed) return;
    await this.options.sendSignal({ kind: "screen_takeover" });
  }

  private readonly onScreenEnded = () => void this.stopScreenShare().catch(() => {});

  /**
   * Tells the far side which of our stream ids is the camera and which the
   * screen. Sent before any offer/answer that touches video, and again on
   * every camera on/off so a peer can clear its view without a renegotiation.
   */
  private async sendMediaMap() {
    if (this.disposed) return;
    await this.options.sendSignal({
      kind: "media",
      camera_stream: this.camera.wireId,
      screen_stream: this.screen.wireId,
    });
  }

  private playRemoteAudio(stream: MediaStream) {
    const audio = this.remoteAudio ?? new Audio();
    audio.autoplay = true;
    audio.srcObject = stream;
    this.remoteAudio = audio;
    void audio.play().catch(() => {});
  }

  /**
   * An offer only ever describes transceivers that already exist, so a peer
   * that just turned its camera on needs an m-line here to be answered into.
   * Without this, a callee's camera reached an audio call and negotiated
   * nothing — the request arrived, the offer went out unchanged, and the
   * picture never appeared with no error anywhere.
   */
  private ensureVideoRecvCapacity() {
    const peer = this.requirePeer();
    const canReceive = peer
      .getTransceivers()
      .some(
        (transceiver) =>
          transceiver.receiver.track?.kind === "video" &&
          (transceiver.direction === "sendrecv" || transceiver.direction === "recvonly"),
      );
    // One line is not always enough. A peer that has ever sent its camera
    // keeps that transceiver for a later replaceTrack, and WebRTC never reuses
    // a transceiver that has sent — so its screen share arrives on a second
    // one, which needs an m-line of its own or it is never sent at all. That
    // was "video call, then share: the other side sees nothing".
    if (!canReceive || this.remote.awaitingStream) {
      peer.addTransceiver("video", { direction: "recvonly" });
    }
  }

  private requirePeer() {
    if (!this.peer) throw new Error("voice peer not prepared");
    return this.peer;
  }

  private requireNegotiator() {
    if (!this.negotiator) throw new Error("voice peer not prepared");
    return this.negotiator;
  }
}
