"use client";

import { useState } from "react";
import { CheckmarkCircle02Icon, Copy01Icon } from "hugeicons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";

export default function WebhookCreatedStep({
  url,
  onDone,
}: {
  url: string;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Webhook URL copied");
  }

  return (
    <>
      <div className="min-w-0 max-w-full space-y-4 overflow-hidden py-2">
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <CheckmarkCircle02Icon
            className="mt-0.5 shrink-0 text-emerald-400"
            size={18}
          />
          <div>
            <p className="text-sm font-semibold">Webhook feed created</p>
            <p className="text-xs text-muted-foreground">
              Users can only view incoming messages in this group.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium">Copy this URL now</p>
          <div className="flex min-w-0 max-w-full gap-2">
            <Input
              value={url}
              readOnly
              className="min-w-0 flex-1 font-mono text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => void copy()}
            >
              <Copy01Icon size={16} />
            </Button>
          </div>
          <p className="text-xs text-amber-400">
            The secret URL is shown once. Regenerating it disables the old URL.
          </p>
        </div>
        <pre className="w-full min-w-0 max-w-full overflow-x-auto whitespace-pre rounded-lg bg-black/25 p-3 text-xs text-muted-foreground">
          {`curl -X POST '${url}' \\
  -H 'Content-Type: application/json' \\
  -d '{"message":"Deployment completed"}'`}
        </pre>
      </div>
      <DialogFooter>
        <Button type="button" onClick={onDone}>
          {copied ? "Done" : "Close"}
        </Button>
      </DialogFooter>
    </>
  );
}
