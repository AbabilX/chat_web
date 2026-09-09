"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useQrLogin } from "./use-qr-login";
import { LOGIN_COPY } from "./login-copy";

export default function LoginQrPanel() {
  const onApproved = useCallback(() => {
    window.location.assign("/user/messages");
  }, []);

  const { status, imageUrl, error, secondsLeft, restart } = useQrLogin(
    true,
    onApproved,
  );

  const dead = status === "expired" || status === "denied" || status === "error";
  const message =
    status === "expired"
      ? LOGIN_COPY.qrExpired
      : status === "denied"
        ? LOGIN_COPY.qrDenied
        : status === "error"
          ? error
          : status === "approved"
            ? LOGIN_COPY.qrApproved
            : "";

  return (
    <div className="flex w-full max-w-[320px] flex-col items-start gap-4">
      <div className="flex h-[280px] w-[280px] items-center justify-center rounded-2xl bg-white p-3 shadow-[0_8px_32px_rgba(15,23,42,0.08)]">
        {imageUrl && !dead ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URI QR
          <img src={imageUrl} alt={LOGIN_COPY.qrTitle} className="h-full w-full" />
        ) : (
          <span className="px-6 text-center text-sm text-neutral-600">
            {message || "…"}
          </span>
        )}
      </div>
      <p className="text-left text-sm text-[#475569]">{LOGIN_COPY.qrHint}</p>
      {status === "pending" && secondsLeft > 0 ? (
        <p className="text-xs text-[#64748b]">
          {LOGIN_COPY.qrExpiresIn} {Math.floor(secondsLeft / 60)}:
          {String(secondsLeft % 60).padStart(2, "0")}
        </p>
      ) : null}
      {dead ? (
        <Button size="sm" type="button" onClick={() => void restart()}>
          {LOGIN_COPY.qrRefresh}
        </Button>
      ) : null}
    </div>
  );
}
