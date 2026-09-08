"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getIdentityPublicKey } from "@/lib/chat-e2ee/identity-state";
import {
  identityFingerprint,
  safetyNumber,
} from "@/lib/chat-e2ee/safety-number";
import {
  checkPeerFingerprint,
  rememberPeerFingerprint,
  type PeerTrust,
} from "@/lib/chat-e2ee/safety-number-store";
import { useChatStore } from "@/store/chat-store";

type Resolved = {
  peerUserId: string;
  ok: boolean;
  digits: string;
  peerFingerprint: string;
  trust: PeerTrust;
  reason: string;
};

export type SafetyNumberState = {
  status: "idle" | "loading" | "ready" | "unavailable";
  digits: string;
  trust: PeerTrust;
  reason: string;
  acknowledge: () => void;
};

/**
 * Computes the safety number for a DM and reports whether the peer's key is the
 * one this device saw last time.
 *
 * The peer's key is fetched fresh whenever the conversation changes rather than
 * read from any cache — a stale copy would hide exactly the substitution this
 * exists to catch. Only the hashing is memoised, and it is keyed on the key
 * material itself, so a swapped key is always a miss.
 */
export function useSafetyNumber(
  peerUserId: string | undefined,
  enabled: boolean,
): SafetyNumberState {
  const currentUserId = useChatStore((s) => s.currentUserId);
  const [resolved, setResolved] = useState<Resolved | null>(null);

  const active = enabled && !!peerUserId && !!currentUserId;

  useEffect(() => {
    if (!active || !peerUserId || !currentUserId) return;
    let cancelled = false;
    const settle = (next: Omit<Resolved, "peerUserId">) => {
      if (!cancelled) setResolved({ peerUserId, ...next });
    };
    const fail = (reason: string) =>
      settle({
        ok: false, digits: "", peerFingerprint: "", trust: "first-seen", reason,
      });

    void (async () => {
      const mineKey = getIdentityPublicKey();
      if (!mineKey) {
        fail("Secure messages are not open on this device yet.");
        return;
      }
      let peerKey;
      try {
        peerKey = (await api.getChatE2EEPublicKey(peerUserId)).public_key;
      } catch {
        fail("This person has not set up secure messages yet.");
        return;
      }
      try {
        const [digits, peerFingerprint] = await Promise.all([
          safetyNumber(
            { userId: currentUserId, publicKey: mineKey },
            { userId: peerUserId, publicKey: peerKey },
          ),
          identityFingerprint({ userId: peerUserId, publicKey: peerKey }),
        ]);
        settle({
          ok: true,
          digits,
          peerFingerprint,
          trust: checkPeerFingerprint(currentUserId, peerUserId, peerFingerprint),
          reason: "",
        });
      } catch {
        fail("This key cannot produce a safety number.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, peerUserId, currentUserId]);

  const acknowledge = useCallback(() => {
    setResolved((prev) => {
      if (!prev || !currentUserId || !prev.peerFingerprint) return prev;
      rememberPeerFingerprint(currentUserId, prev.peerUserId, prev.peerFingerprint);
      return { ...prev, trust: "unchanged" };
    });
  }, [currentUserId]);

  // Derived rather than stored, so switching conversations cannot show the
  // previous peer's digits for a frame while the new ones are being computed.
  const current = resolved?.peerUserId === peerUserId ? resolved : null;
  const status: SafetyNumberState["status"] = !active
    ? "idle"
    : !current
      ? "loading"
      : current.ok
        ? "ready"
        : "unavailable";

  return {
    status,
    digits: current?.digits ?? "",
    trust: current?.trust ?? "first-seen",
    reason: current?.reason ?? "",
    acknowledge,
  };
}
