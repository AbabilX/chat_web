"use client";

import { useState } from "react";
import { Copy01Icon, RefreshIcon } from "hugeicons-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WebhookSettingsSection({
  conversationId,
}: {
  conversationId: string;
}) {
  const [url, setURL] = useState("");
  const [busy, setBusy] = useState(false);

  async function regenerate() {
    setBusy(true);
    try {
      const result = await api.regenerateChatWebhook(conversationId);
      setURL(result.url);
      toast.success("New webhook URL generated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not regenerate URL",
      );
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(url);
    toast.success("Webhook URL copied");
  }

  return (
    <section className="space-y-2 rounded-lg border border-[var(--border)] p-3">
      <div>
        <p className="text-sm font-semibold">Webhook URL</p>
        <p className="text-xs text-muted-foreground">
          Generating a new URL immediately disables the previous one.
        </p>
      </div>
      {url ? (
        <div className="flex gap-2">
          <Input value={url} readOnly className="font-mono text-xs" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => void copy()}
          >
            <Copy01Icon size={15} />
          </Button>
        </div>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() => void regenerate()}
      >
        <RefreshIcon size={14} /> {busy ? "Generating…" : "Generate new URL"}
      </Button>
    </section>
  );
}
