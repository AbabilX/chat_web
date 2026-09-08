"use client";

import { useCallback } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMessageVaultStore } from "@/store/message-vault-store";
import { useDeviceLink } from "./use-device-link";
import LinkStatusNote from "./link-status-note";

/**
 * The first thing a browser without the message key is offered: scan from a
 * phone that already has it.
 *
 * It leads because nothing has to be typed: the key is sealed against a public
 * key read off this screen with a camera, so the server only ever relays
 * ciphertext it cannot open. `onNeedCode` switches to the recovery code, which
 * is the way in for somebody with no phone to scan from.
 */
export default function DeviceLinkScreen({
  onNeedCode,
}: {
  onNeedCode: () => void;
}) {
  const check = useMessageVaultStore((s) => s.check);
  const onLinked = useCallback(() => void check(), [check]);
  const link = useDeviceLink(true, onLinked);

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center bg-[var(--bg)] px-4 lg:h-dvh">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <ShieldCheck className="size-6" />
        </div>
        <h1 className="mt-4 text-center text-lg font-semibold text-[var(--text)]">
          Link this device
        </h1>
        <p className="mt-2 text-center text-sm leading-6 text-[var(--text-muted)]">
          On a phone where your messages already work, open{" "}
          <span className="text-[var(--text)]">
            Settings → Link a device to your messages
          </span>{" "}
          and scan this code to move your message key across.
        </p>

        {link.imageUrl ? (
          <div className="mt-5 flex justify-center">
            <div className="rounded-xl bg-white p-3">
              <Image
                alt="Device linking code"
                className="size-52"
                height={208}
                src={link.imageUrl}
                unoptimized
                width={208}
              />
            </div>
          </div>
        ) : null}

        {link.verificationCode ? (
          <div className="mt-4 text-center">
            <p className="text-xs text-[var(--text-muted)]">
              Check this matches on both screens
            </p>
            <p className="mt-1 font-mono text-2xl tracking-[0.3em] text-[var(--text)]">
              {link.verificationCode}
            </p>
          </div>
        ) : null}

        <LinkStatusNote error={link.error} status={link.status} />

        {link.status === "expired" ||
        link.status === "denied" ||
        link.status === "error" ? (
          <Button className="mt-4 h-11 w-full" type="button" onClick={link.restart}>
            Show a new code
          </Button>
        ) : null}

        <div className="mt-5 border-t border-[var(--border)] pt-4">
          <p className="text-center text-xs text-[var(--text-muted)]">
            Do not have your phone?
          </p>
          <Button
            className="mt-2 h-11 w-full"
            type="button"
            variant="outline"
            onClick={onNeedCode}
          >
            Use my recovery code
          </Button>
          <p className="mt-2 text-center text-xs leading-5 text-[var(--text-muted)]">
            The code you saved when you set up messages. It unlocks everything
            here, history included.
          </p>
        </div>

        <p className="mt-4 text-center text-xs leading-5 text-[var(--text-muted)]">
          AbabilX never holds your message key or your recovery code, so it
          cannot read what you send.
        </p>
      </div>
    </div>
  );
}
