"use client";

import { Button } from "@/components/ui/button";
import TiptapEditor from "../../tiptap/editor";
import { isTiptapEmpty } from "../../tiptap/utils";

export function CommentEditForm({
  draft,
  onDraftChange,
  busy,
  onSave,
  onCancel,
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  busy: boolean;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
}) {
  return (
    <div className="mt-1 space-y-2">
      <TiptapEditor value={draft} onChange={onDraftChange} variant="compact" />
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          className="h-7"
          disabled={busy || isTiptapEmpty(draft)}
          onClick={() => void onSave()}
        >
          {busy ? "Saving..." : "Save"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
