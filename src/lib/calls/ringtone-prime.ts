"use client";

import {
  isRingtoneBlocked,
  retryRingtone,
  subscribeRingtoneBlocked,
  unlockRingtone,
} from "./ringtone";

const GESTURES = ["pointerdown", "keydown", "touchstart"] as const;

let started = false;
let listening = false;

function listen(on: boolean) {
  if (listening === on) return;
  listening = on;
  GESTURES.forEach((event) =>
    on
      ? window.addEventListener(event, onGesture, { passive: true })
      : window.removeEventListener(event, onGesture),
  );
}

function onGesture() {
  // While a blocked call is ringing, the gesture is worth more than an unlock:
  // it can start the ring itself, so the first click anywhere brings the sound
  // in without a trip to the "enable sound" pill.
  if (isRingtoneBlocked()) {
    retryRingtone();
    return;
  }
  void unlockRingtone().then((ok) => {
    // Keep listening until one gesture actually wins the grant. A single failed
    // attempt used to disarm this forever, which left the ring silent for the
    // whole session.
    if (ok) listen(false);
  });
}

/**
 * Unlock the ringtone element from ordinary user gestures, so a call that
 * arrives with no gesture on the stack still rings.
 *
 * Browsers refuse gesture-less `play()` until an element has been started once
 * from a real gesture; there is no permission to ask for and no way to grant it
 * ahead of time. Every click, key, and tap in the app is therefore treated as
 * the unlock — and the listener re-arms whenever a ring is refused, so the
 * grant is retried instead of being given up on.
 */
export function primeRingtone() {
  if (started || typeof window === "undefined") return;
  started = true;
  listen(true);
  subscribeRingtoneBlocked(() => {
    if (isRingtoneBlocked()) listen(true);
  });
}
