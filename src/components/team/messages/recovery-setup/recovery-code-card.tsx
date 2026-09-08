"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shows a recovery code and the two ways to keep it.
 *
 * Nothing anywhere stores this string — not the server, not this browser — so
 * the screen it appears on is the only chance to save it. Copy and download are
 * both offered because a password manager and a printed page fail differently,
 * and people who care about the second one tend to care a lot.
 */
export default function RecoveryCodeCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked in some browsers and contexts. The code is on
      // screen and selectable, so this is a convenience, not the only route.
    }
  }

  function download() {
    const body =
      `AbabilX message recovery code\n\n${code}\n\n` +
      `Keep this somewhere safe and private.\n` +
      `It is the only way to read your messages on a new device.\n` +
      `AbabilX does not have a copy and cannot recover it for you.\n`;
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ababilx-recovery-code.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <p className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 text-center font-mono text-sm leading-7 tracking-wider break-all text-[var(--text)] select-all">
        {code}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button className="h-10" type="button" variant="outline" onClick={copy}>
          {copied ? (
            <Check className="mr-1.5 size-4" />
          ) : (
            <Copy className="mr-1.5 size-4" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button className="h-10" type="button" variant="outline" onClick={download}>
          <Download className="mr-1.5 size-4" />
          Download
        </Button>
      </div>
    </div>
  );
}
