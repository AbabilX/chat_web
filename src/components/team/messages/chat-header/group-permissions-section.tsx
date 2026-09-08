"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { ChatConversation } from "@/lib/api/types/chat";

type Permission = "admin" | "member";

/**
 * Signal's Permissions screen, inlined: who may edit the group info, and who
 * may add members.
 *
 * Only admins see this at all, and the server enforces the same rule so a
 * stale tab cannot set it either. There is deliberately no switch for "who may
 * change these switches" — a permission that can unset the permissions is not
 * a permission model.
 */
export default function GroupPermissionsSection({
  conv,
  onUpdated,
}: {
  conv: ChatConversation;
  onUpdated: (conv: ChatConversation) => void;
}) {
  const [saving, setSaving] = useState(false);
  const editInfo: Permission = conv.edit_info_role ?? "admin";
  const addMembers: Permission = conv.add_members_role ?? "admin";

  // Both switches go up together — the endpoint takes the pair, and the
  // unchanged one is read straight off the conversation being rendered.
  async function save(next: { edit?: Permission; add?: Permission }) {
    setSaving(true);
    try {
      onUpdated(
        await api.updateChatGroupPermissions(
          conv.id,
          next.edit ?? editInfo,
          next.add ?? addMembers,
        ),
      );
    } catch {
      // The selects re-render from `conv`, so a failure simply snaps back.
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Permissions
      </p>
      <PermissionRow
        label="Edit group info"
        hint="Name, description and photo"
        value={editInfo}
        disabled={saving}
        onChange={(v) => void save({ edit: v })}
      />
      <PermissionRow
        label="Add members"
        hint="Bring new people into this group"
        value={addMembers}
        disabled={saving}
        onChange={(v) => void save({ add: v })}
      />
    </div>
  );
}

function PermissionRow({
  label,
  hint,
  value,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  value: Permission;
  disabled: boolean;
  onChange: (value: Permission) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-1.5 py-1.5">
      <div className="min-w-0">
        <p className="truncate text-sm text-[var(--text)]">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      </div>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as Permission)}
        className="shrink-0 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs text-[var(--text)]"
      >
        <option value="member">All members</option>
        <option value="admin">Only admins</option>
      </select>
    </div>
  );
}
