"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export default function LeaveTeamDialog({
  open,
  onOpenChange,
  teamName,
  busy,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  busy?: boolean;
  onConfirm: () => void;
}) {
  const [value, setValue] = useState("");

  const matches = teamName.trim() !== "" && value.trim() === teamName.trim();

  function handleOpenChange(next: boolean) {
    if (!next) setValue("");
    onOpenChange(next);
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave {teamName}?</AlertDialogTitle>
          <AlertDialogDescription>
            You will lose access to this team&apos;s board, chat, and attendance history.
            Your wall posts and chat messages stay, still attributed to you. This cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <label className="text-xs text-muted-foreground" htmlFor="leave-team-confirm">
            Type <span className="font-medium text-foreground">{teamName}</span> to confirm
          </label>
          <Input
            id="leave-team-confirm"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={teamName}
            autoComplete="off"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy || !matches}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {busy ? "Leaving..." : "Leave team"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
