import { Suspense } from "react";
import TeamMessages from "@/components/team/messages";
import MessagesLoading from "@/components/team/messages/messages-loading";
import TeamNavGate from "@/components/team/shared/team-nav-gate";

export default function WorkspaceMessagesPage() {
  return (
    <TeamNavGate navKey="messages">
      <Suspense fallback={<MessagesLoading />}>
        <TeamMessages />
      </Suspense>
    </TeamNavGate>
  );
}
