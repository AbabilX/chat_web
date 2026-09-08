"use client";

import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQrLogin } from "./use-qr-login";

const QR_COPY = {
  title: "Scan with your phone",
  hint: "Open AbabilX on a signed-in phone and scan this code to sign in here.",
  expired: "This code expired. Generate a new one.",
  denied: "Sign-in was denied on the phone.",
  approved: "Signed in. Opening chat…",
  expiresIn: "Expires in",
  refresh: "New code",
} as const;

export default function QrLoginDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const onApproved = useCallback(() => {
    window.location.assign("/user/messages");
  }, []);

  const { status, imageUrl, error, secondsLeft, restart } = useQrLogin(
    open,
    onApproved,
  );

  const dead = status === "expired" || status === "denied" || status === "error";
  const message =
    status === "expired"
      ? QR_COPY.expired
      : status === "denied"
        ? QR_COPY.denied
        : status === "error"
          ? error
          : status === "approved"
            ? QR_COPY.approved
            : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{QR_COPY.title}</DialogTitle>
          <DialogDescription>{QR_COPY.hint}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex h-[280px] w-[280px] items-center justify-center rounded-2xl bg-white p-3">
            {imageUrl && !dead ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URI QR
              <img src={imageUrl} alt={QR_COPY.title} className="h-full w-full" />
            ) : (
              <span className="px-6 text-center text-sm text-neutral-600">
                {message || "…"}
              </span>
            )}
          </div>

          {status === "pending" && secondsLeft > 0 ? (
            <p className="text-xs text-[var(--text-muted)]">
              {QR_COPY.expiresIn} {Math.floor(secondsLeft / 60)}:
              {String(secondsLeft % 60).padStart(2, "0")}
            </p>
          ) : null}

          {dead ? (
            <Button size="sm" type="button" onClick={() => void restart()}>
              {QR_COPY.refresh}
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
