"use client";

import { useState } from "react";
import DeviceLinkScreen from "../device-link";
import RecoveryCodeScreen from "../recovery-code";

/**
 * Picks how this browser gets the account's message key.
 *
 * Scanning from a phone leads: nothing has to be typed, and the key travels
 * sealed between the two devices. The recovery code is the way in for somebody
 * with no phone to hand — the common case here, since most of this user base is
 * on the web across several machines.
 *
 * Both paths end with the same identity in this browser. Neither involves the
 * server holding anything it can open.
 */
export default function VaultUnlockScreen() {
  const [mode, setMode] = useState<"link" | "code">("link");

  return mode === "link" ? (
    <DeviceLinkScreen onNeedCode={() => setMode("code")} />
  ) : (
    <RecoveryCodeScreen onBack={() => setMode("link")} />
  );
}
