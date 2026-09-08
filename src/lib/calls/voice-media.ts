/** Local capture helpers shared by audio calls and screen-only sessions. */

export async function captureMicStream() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("voice_call_browser_unsupported");
  }
  return navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    video: false,
  });
}

const unavailableMicrophoneErrors = new Set([
  "NotFoundError",
  "DevicesNotFoundError",
  "NotReadableError",
  "TrackStartError",
  "OverconstrainedError",
]);

/**
 * Permission refused, as opposed to hardware missing. Kept separate from the
 * set above because the two need different copy: one is fixed in the browser's
 * site settings, the other by plugging something in.
 */
const blockedMicrophoneErrors = new Set([
  "NotAllowedError",
  "PermissionDeniedError",
  "SecurityError",
]);

export function isMicrophoneBlockedError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const { name } = error as { name?: unknown };
  return typeof name === "string" && blockedMicrophoneErrors.has(name);
}

/** Hardware missing/busy is a listen-only state, not a call failure. */
export function isMicrophoneUnavailableError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: unknown; message?: unknown };
  return (
    typeof candidate.name === "string" && unavailableMicrophoneErrors.has(candidate.name)
  ) || candidate.message === "voice_call_browser_unsupported";
}

/**
 * Camera only — the microphone is captured separately so a missing or refused
 * camera never costs the call its audio. Video-only getUserMedia after the mic
 * was granted adds one more prompt in some browsers, which is the price of
 * degrading cleanly.
 */
export async function captureCameraStream() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("camera_browser_unsupported");
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 24, max: 30 },
    },
  });
  if (!stream.getVideoTracks()[0]) {
    stopStream(stream);
    throw new Error("camera_unavailable");
  }
  return stream;
}

/**
 * Why the camera could not open, as copy. Every case is non-fatal: a video
 * call whose camera fails is an audio call, never a failed call.
 */
export function cameraErrorMessage(error: unknown) {
  const name = error && typeof error === "object" ? (error as { name?: unknown }).name : "";
  const message = error instanceof Error ? error.message : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") {
    return "Camera permission was not granted — continuing without video.";
  }
  if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") {
    return "The camera is in use by another app — continuing without video.";
  }
  if (message === "camera_browser_unsupported") {
    return "This browser cannot use the camera — continuing without video.";
  }
  return "No camera was found — continuing without video.";
}

/**
 * Must be called straight from a click: browsers only open the display picker
 * while a user gesture is still active.
 */
export async function captureScreenStream() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("screen_capture_browser_unsupported");
  }
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: { ideal: 15, max: 30 } },
    audio: false,
  });
  if (!stream.getVideoTracks()[0]) {
    stopStream(stream);
    throw new Error("screen_capture_unavailable");
  }
  return stream;
}

export function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => {
    track.onended = null;
    track.stop();
  });
}
