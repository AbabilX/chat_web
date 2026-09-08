"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { TeamNavKey } from "./team-provider";
import { useTeamContext } from "./team-provider";
import SeatPendingScreen from "./seat-pending-screen";

export default function TeamNavGate({
  navKey,
  children,
}: {
  navKey: TeamNavKey;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { loading, isNavEnabled, viewerFrozen } = useTeamContext();

  useEffect(() => {
    if (loading) return;
    if (viewerFrozen) return;
    if (!isNavEnabled(navKey)) {
      router.replace("/user/messages");
    }
  }, [loading, isNavEnabled, navKey, router, viewerFrozen]);

  if (loading && navKey === "overview") {
    return <>{children}</>;
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading...</p>;
  }

  if (viewerFrozen) {
    return <SeatPendingScreen />;
  }

  if (!isNavEnabled(navKey)) {
    return null;
  }

  return <>{children}</>;
}
