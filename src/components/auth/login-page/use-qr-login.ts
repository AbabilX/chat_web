"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  createQrLoginSession,
  pollQrLogin,
  type QrLoginStatus,
} from "@/lib/api/qr-login";

type QrLoginState = {
  status: QrLoginStatus | "loading" | "error";
  imageUrl: string;
  error: string;
  secondsLeft: number;
};

const INITIAL: QrLoginState = {
  status: "loading",
  imageUrl: "",
  error: "",
  secondsLeft: 0,
};

export function useQrLogin(active: boolean, onApproved: () => void) {
  const [state, setState] = useState<QrLoginState>(INITIAL);
  const [nonce, setNonce] = useState(0);

  const restart = useCallback(() => {
    setState(INITIAL);
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const run = async () => {
      try {
        const session = await createQrLoginSession("AbabilX Chat Web");
        const imageUrl = await QRCode.toDataURL(session.qrPayload, {
          margin: 1,
          width: 320,
          errorCorrectionLevel: "M",
        });
        if (cancelled) return;
        setState({
          status: "pending",
          imageUrl,
          error: "",
          secondsLeft: Math.max(
            0,
            Math.round((session.expiresAt - Date.now()) / 1000),
          ),
        });

        while (!cancelled) {
          await new Promise((r) => setTimeout(r, session.pollIntervalMs));
          if (cancelled) return;

          const left = Math.max(
            0,
            Math.round((session.expiresAt - Date.now()) / 1000),
          );
          setState((prev) => ({ ...prev, secondsLeft: left }));
          if (left <= 0) {
            setState((prev) => ({ ...prev, status: "expired" }));
            return;
          }

          const status = await pollQrLogin(session.token);
          if (cancelled) return;
          if (status === "pending") continue;
          setState((prev) => ({ ...prev, status }));
          if (status === "approved") onApproved();
          return;
        }
      } catch (err) {
        if (cancelled) return;
        setState({
          status: "error",
          imageUrl: "",
          error: err instanceof Error ? err.message : "QR login failed",
          secondsLeft: 0,
        });
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [active, nonce, onApproved]);

  return { ...state, restart };
}
