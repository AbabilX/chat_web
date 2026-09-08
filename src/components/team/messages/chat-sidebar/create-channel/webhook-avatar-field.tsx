"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link01Icon } from "hugeicons-react";
import { Camera, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { compressWebhookAvatar } from "@/lib/messages/webhook/compress-avatar";

export default function WebhookAvatarField({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  async function choose(source?: File) {
    if (!source) return;
    setBusy(true);
    setError("");
    try {
      onChange(await compressWebhookAvatar(source));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not process image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3">
      <Avatar className="h-12 w-12 rounded-md">
        {preview ? <AvatarImage src={preview} alt="Webhook avatar preview" /> : null}
        <AvatarFallback className="rounded-md bg-[color-mix(in_srgb,var(--indigo)_15%,transparent)] text-[var(--indigo)]">
          <Link01Icon size={18} />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Webhook avatar</p>
        <p className={`text-xs ${error ? "text-red-400" : "text-muted-foreground"}`}>
          {error || "Optional · cropped and compressed to 128×128 WebP"}
        </p>
        <div className="mt-2 flex gap-2">
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
            <Camera size={14} /> {busy ? "Compressing…" : file ? "Change" : "Upload"}
          </Button>
          {file ? (
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)}>
              <Trash2 size={14} /> Remove
            </Button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          void choose(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
