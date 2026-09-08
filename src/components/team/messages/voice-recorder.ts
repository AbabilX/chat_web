/** Browser MediaRecorder helper for chat voice notes (mobile parity). */

export type VoiceRecorderMime = {
  mimeType: string;
  extension: string;
};

export function pickVoiceMime(): VoiceRecorderMime {
  if (typeof MediaRecorder === "undefined") {
    return { mimeType: "audio/webm", extension: "webm" };
  }
  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return { mimeType: "audio/webm;codecs=opus", extension: "webm" };
  }
  if (MediaRecorder.isTypeSupported("audio/webm")) {
    return { mimeType: "audio/webm", extension: "webm" };
  }
  if (MediaRecorder.isTypeSupported("audio/mp4")) {
    return { mimeType: "audio/mp4", extension: "m4a" };
  }
  return { mimeType: "", extension: "webm" };
}

export type RecordedVoice = {
  blob: Blob;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  durationMs: number;
};

export class VoiceMessageRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private startedAt = 0;
  private pausedMs = 0;
  private pauseStartedAt = 0;
  private mime = pickVoiceMime();

  get recording() {
    return this.recorder?.state === "recording";
  }

  get paused() {
    return this.recorder?.state === "paused";
  }

  async start() {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("Microphone is not supported in this browser");
    }
    this.mime = pickVoiceMime();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    this.chunks = [];
    this.pausedMs = 0;
    this.pauseStartedAt = 0;
    const options = this.mime.mimeType
      ? { mimeType: this.mime.mimeType }
      : undefined;
    const recorder = new MediaRecorder(this.stream, options);
    this.recorder = recorder;
    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) this.chunks.push(ev.data);
    };
    recorder.start(200);
    this.startedAt = Date.now();
  }

  pause() {
    if (this.recorder?.state === "recording") {
      this.recorder.pause();
      this.pauseStartedAt = Date.now();
    }
  }

  resume() {
    if (this.recorder?.state === "paused") {
      if (this.pauseStartedAt) {
        this.pausedMs += Date.now() - this.pauseStartedAt;
        this.pauseStartedAt = 0;
      }
      this.recorder.resume();
    }
  }

  elapsedMs() {
    if (!this.startedAt) return 0;
    const pausedExtra =
      this.pauseStartedAt > 0 ? Date.now() - this.pauseStartedAt : 0;
    return Math.max(0, Date.now() - this.startedAt - this.pausedMs - pausedExtra);
  }

  async stop(): Promise<RecordedVoice | null> {
    const recorder = this.recorder;
    if (!recorder) {
      this.cleanup();
      return null;
    }
    const durationMs = this.elapsedMs();
    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(
          new Blob(this.chunks, {
            type: this.mime.mimeType || "audio/webm",
          }),
        );
      };
      if (recorder.state !== "inactive") recorder.stop();
      else resolve(new Blob());
    });
    this.cleanup();
    if (blob.size === 0 || durationMs < 400) return null;
    const contentType = (blob.type || this.mime.mimeType || "audio/webm").split(
      ";",
    )[0];
    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    return {
      blob,
      fileName: `voice-${stamp}.${this.mime.extension}`,
      contentType,
      sizeBytes: blob.size,
      durationMs,
    };
  }

  cancel() {
    try {
      if (this.recorder && this.recorder.state !== "inactive") {
        this.recorder.stop();
      }
    } catch {
      // ignore
    }
    this.cleanup();
  }

  private cleanup() {
    this.recorder = null;
    this.chunks = [];
    this.startedAt = 0;
    this.pausedMs = 0;
    this.pauseStartedAt = 0;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}

export function formatVoiceTimer(ms: number) {
  const total = Math.min(3599, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
