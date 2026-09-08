import type { GroupMediaSnapshot } from "../group-call-context";

export type GroupMediaHandlers = {
  onSnapshot: (snapshot: GroupMediaSnapshot) => void;
  /** Fired once when the call ends for any reason other than a local leave. */
  onClosed: (reason?: string) => void;
  /** The local screen-share track stopped — the browser's own bar, or a takeover. */
  onScreenEnded: () => void;
};

/**
 * What the call UI needs from a media server, and nothing more. Everything
 * LiveKit-specific lives behind this, so the components never see a `Room`.
 */
export type GroupMediaSession = {
  /** False when the microphone was missing or busy: a listen-only join. */
  readonly microphoneAvailable: boolean;
  setMuted: (muted: boolean) => Promise<void>;
  setScreenShareEnabled: (active: boolean) => Promise<void>;
  resumeAudio: () => Promise<void>;
  /** Re-emits a snapshot, optionally against a new server-side screen owner. */
  refreshSnapshot: (screenOwnerId?: string) => void;
  disconnect: () => void;
};
