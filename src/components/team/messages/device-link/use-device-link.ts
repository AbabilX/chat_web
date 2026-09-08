"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { api } from "@/lib/api";
import { createLinkOffer, type LinkOffer } from "@/lib/chat-e2ee/device-link";
import { adoptLinkedIdentity } from "@/lib/chat-e2ee/crypto";

type Status = "loading" | "waiting" | "linked" | "denied" | "expired" | "error";

type State = {
  status: Status;
  imageUrl: string;
  verificationCode: string;
  error: string;
};

const INITIAL: State = {
  status: "loading",
  imageUrl: "",
  verificationCode: "",
  error: "",
};

/**
 * Drives one device-link handshake from the new device's side.
 *
 * The ephemeral private key stays in this closure for the life of the
 * handshake and is never stored: if the page reloads the link simply has to be
 * started again, which is cheaper than keeping a key that can open an identity
 * lying around. Restarting mints a new pair, so an abandoned QR goes dead.
 */
export function useDeviceLink(active: boolean, onLinked: () => void) {
  const [state, setState] = useState<State>(INITIAL);
  const [nonce, setNonce] = useState(0);

  const restart = useCallback(() => {
    setState(INITIAL);
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let offer: LinkOffer | null = null;

    const run = async () => {
      try {
        offer = await createLinkOffer();
        const session = await api.createChatE2EELink(deviceLabel());
        const payload = `${session.scheme}${session.token}&k=${offer.publicKeyParam}`;
        const imageUrl = await QRCode.toDataURL(payload, {
          margin: 1,
          width: 320,
          errorCorrectionLevel: "M",
        });
        if (cancelled) return;
        setState({
          status: "waiting",
          imageUrl,
          verificationCode: offer.verificationCode,
          error: "",
        });

        const expiresAt = new Date(session.expires_at).getTime();
        while (!cancelled) {
          await new Promise((r) => setTimeout(r, session.poll_interval * 1000));
          if (cancelled || !offer) return;
          if (Date.now() > expiresAt) {
            setState((prev) => ({ ...prev, status: "expired" }));
            return;
          }
          const result = await api.pollChatE2EELink(session.token);
          if (cancelled) return;
          if (result.status === "pending") continue;
          if (result.status !== "approved") {
            // Bound to a const so the narrowing survives into the updater.
            const finished = result.status;
            setState((prev) => ({ ...prev, status: finished }));
            return;
          }
          await adoptLinkedIdentity(result.identity_envelope, offer.privateKey);
          if (cancelled) return;
          setState((prev) => ({ ...prev, status: "linked" }));
          onLinked();
          return;
        }
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          imageUrl: "",
          verificationCode: "",
          error: err instanceof Error ? err.message : "Could not link this device",
        });
      }
    };

    void run();
    return () => {
      cancelled = true;
      offer = null;
    };
  }, [active, nonce, onLinked]);

  return { ...state, restart };
}

function deviceLabel() {
  if (typeof navigator === "undefined") return "AbabilX Web";
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Safari\//.test(ua)
        ? "Safari"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : "Browser";
  return `AbabilX Web · ${browser}`;
}
