"use client";

import {
  isOutputRunning,
  playRingtoneLoop,
  resumeRingtoneOutput,
  stopRingtoneLoop,
  subscribeOutputState,
  warmRingtone,
} from "./ringtone-audio";

/**
 * Nothing may hold the ring longer than this. Both call systems expire a
 * ringing call after a minute, so a hold that outlives the window is a leak —
 * a dropped socket, a frozen tab, an unmount that never ran — and a leaked
 * hold used to let any later click start the ringtone with no call on screen.
 */
const MAX_RING_MS = 70_000;

const holds = new Set<symbol>();
let blocked = false;

/**
 * Bumped by every start and stop. Playback settles asynchronously, so its
 * result is only meaningful while it is still the current attempt — otherwise a
 * stop that lands mid-attempt gets its cleared state overwritten by the loser.
 */
let generation = 0;

const blockedListeners = new Set<() => void>();

/** The only condition under which this app is allowed to make noise. */
function ringing() {
  return holds.size > 0;
}

function setBlocked(next: boolean) {
  if (blocked === next) return;
  blocked = next;
  blockedListeners.forEach((listener) => listener());
}

/**
 * True when the browser refused to run the audio output. Autoplay is granted
 * per origin, so a developer who has loaded the app hundreds of times hears the
 * ring while a first-time user hears nothing — the failure has to be observable
 * rather than swallowed.
 */
export function isRingtoneBlocked() {
  return blocked;
}

export function subscribeRingtoneBlocked(listener: () => void) {
  blockedListeners.add(listener);
  return () => {
    blockedListeners.delete(listener);
  };
}

function play() {
  const token = (generation += 1);
  // Both guards matter: the hold can be released, or a newer attempt can take
  // over, while the file is still being fetched.
  void playRingtoneLoop(() => token === generation && ringing()).then((ok) => {
    if (token === generation) setBlocked(!ok);
  });
}

function silence() {
  generation += 1;
  setBlocked(false);
  stopRingtoneLoop();
}

let watching = false;

/**
 * The OS can pull the output out from under a live ring — an incoming phone
 * call on iOS, a tab freeze. One retry takes it back where that is allowed, and
 * failing that the ring is marked blocked so the "enable sound" affordance and
 * the desktop notice take over instead of the call going silent unannounced.
 */
function watchOutput() {
  if (watching) return;
  watching = true;
  subscribeOutputState(() => {
    if (!ringing() || isOutputRunning()) return;
    setBlocked(true);
    play();
  });
}

/**
 * Take the autoplay grant from a real user gesture, so a call that arrives with
 * no gesture on the stack still rings. Silent by construction — resuming the
 * output plays nothing — so priming it from every click cannot be heard.
 */
export async function unlockRingtone() {
  // A live ring is proof enough, and must not be disturbed.
  if (ringing()) return true;
  const ok = await resumeRingtoneOutput();
  if (!ok) return false;
  setBlocked(false);
  // The first gesture is also the moment to pay for the download, so the first
  // real call rings immediately.
  warmRingtone();
  return true;
}

/**
 * Rings until the returned release is called, and never past [MAX_RING_MS].
 * Holds are tokens rather than a counter so a doubled release cannot cancel
 * somebody else's ring, and a doubled start cannot strand one.
 */
export function startRingtone() {
  const token = Symbol("ring");
  holds.add(token);
  watchOutput();
  let expiry = 0;
  const release = () => {
    if (!holds.delete(token)) return;
    if (expiry) window.clearTimeout(expiry);
    if (!ringing()) silence();
  };
  expiry = window.setTimeout(release, MAX_RING_MS);
  play();
  return release;
}

/** Retry from a click on the invite dialog's "Enable sound" affordance. */
export function retryRingtone() {
  if (ringing()) play();
  else void unlockRingtone();
}
