"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useTeamContext } from "./team-provider";
import LeaveTeamDialog from "./leave-team-dialog";

export default function LeaveTeamSection({
  teamName,
  size = "default",
  className = "",
}: {
  teamName: string;
  size?: "default" | "sm";
  className?: string;
}) {
  const router = useRouter();
  const { reload } = useTeamContext();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleLeave() {
    setBusy(true);
    try {
      await api.leaveTeam();
      toast.success("You left the team");
      setOpen(false);
      await reload();
      router.push("/user/workspace/teamMembers");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to leave team");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="destructive" size={size} className={className} onClick={() => setOpen(true)}>
        Leave team
      </Button>
      <LeaveTeamDialog
        open={open}
        onOpenChange={setOpen}
        teamName={teamName}
        busy={busy}
        onConfirm={() => void handleLeave()}
      />
    </>
  );
}
