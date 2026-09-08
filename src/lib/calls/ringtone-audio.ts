"use client";

const RINGTONE_SRC = "/ringtone/Clear_Agenda.mp3";

/** Long enough to kill the click of a hard start or stop, short enough to feel instant. */
const FADE_S = 0.04;

/**
 * The ringtone deliberately avoids `<audio>`. A media element joins the
 * browser's media session as soon as it has played once, which handed the OS
 * play/pause key — and every "Now Playing" control behind it — the power to
 * resume the ringtone long after the call was over, with nothing on screen to
 * explain the noise. Web Audio exposes no transport controls, so there is
 * nothing left for a media key to resume: sound happens only when this module
 * is asked for it.
 */

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let context: AudioContext | null = null;
let playing: { source: AudioBufferSourceNode; gain: GainNode } | null = null;
let bytes: Promise<ArrayBuffer | null> | null = null;
let buffer: AudioBuffer | null = null;
let decoding: Promise<AudioBuffer | null> | null = null;

const stateListeners = new Set<() => void>();

function audio() {
  if (context) return context;
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!Ctor) return null;
  const created = new Ctor();
  // Safari drops the output to "interrupted" for a system call and browsers
  // suspend it around tab freezes. A live ring has to hear about that rather
  // than discover it as silence.
  created.addEventListener("statechange", () =>
    stateListeners.forEach((listener) => listener()),
  );
  context = created;
  return context;
}

export function isOutputRunning() {
  return context?.state === "running";
}

export function subscribeOutputState(listener: () => void) {
  stateListeners.add(listener);
  return () => {
    stateListeners.delete(listener);
  };
}

/**
 * Brings the output out of the suspended state browsers start it in — the Web
 * Audio face of the autoplay policy. Unlike the old element unlock this makes
 * no sound at all, so priming it from stray clicks can never be heard.
 */
export async function resumeRingtoneOutput() {
  const ctx = audio();
  if (!ctx) return false;
  if (ctx.state !== "running") {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }
  // Re-read rather than trust the check above: `resume` is what changes it,
  // and Safari can drop straight back to "interrupted" on its own.
  return (ctx.state as AudioContextState) === "running";
}

function download() {
  if (!bytes) {
    bytes = fetch(RINGTONE_SRC)
      .then((response) => (response.ok ? response.arrayBuffer() : null))
      .catch(() => null)
      .then((data) => {
        // A failed download must not stick, or one flaky moment costs the
        // ringtone for the rest of the session.
        if (!data) bytes = null;
        return data;
      });
  }
  return bytes;
}

function decode(ctx: AudioContext) {
  if (buffer) return Promise.resolve<AudioBuffer | null>(buffer);
  if (!decoding) {
    decoding = download()
      // `decodeAudioData` detaches what it is given, so the cached bytes are
      // copied — otherwise a retry would decode an emptied buffer.
      .then((data) => (data ? ctx.decodeAudioData(data.slice(0)) : null))
      .then((decoded) => (buffer = decoded))
      .catch(() => null)
      .finally(() => {
        decoding = null;
      });
  }
  return decoding;
}

/** Pay for the download ahead of the first call so ringing starts instantly. */
export function warmRingtone() {
  void download();
  if (context) void decode(context);
}

export function stopRingtoneLoop() {
  const current = playing;
  const ctx = context;
  if (!current) return;
  playing = null;
  current.source.onended = () => current.gain.disconnect();
  if (!ctx) return;
  const now = ctx.currentTime;
  try {
    current.gain.gain.cancelScheduledValues(now);
    current.gain.gain.setValueAtTime(current.gain.gain.value, now);
    current.gain.gain.linearRampToValueAtTime(0, now + FADE_S);
    current.source.stop(now + FADE_S);
  } catch {
    // Scheduling can throw on an already-finished source; stopping is enough.
    try {
      current.source.stop();
    } catch {
      // Already stopped. A source is single-use, so this is not an error.
    }
  }
}

/**
 * Loops until [stopRingtoneLoop]. `stillWanted` is re-checked after every await
 * so a call that ends while the file is still downloading never rings late.
 * Returns false only when the browser refused, or the file never arrived.
 */
export async function playRingtoneLoop(stillWanted: () => boolean) {
  const ctx = audio();
  if (!ctx) return false;
  if (!(await resumeRingtoneOutput())) return false;
  if (!stillWanted()) return true;
  const decoded = await decode(ctx);
  if (!decoded) return false;
  if (!stillWanted()) return true;
  // Its own gain node, so the outgoing ring can fade out on its own schedule
  // while this one is already fading in.
  stopRingtoneLoop();
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  const source = ctx.createBufferSource();
  source.buffer = decoded;
  source.loop = true;
  source.connect(gain);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(1, now + FADE_S);
  playing = { source, gain };
  source.start();
  return true;
}
