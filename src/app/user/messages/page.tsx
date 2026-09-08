import { Suspense } from "react";
import TeamMessages from "@/components/team/messages";
import MessagesLoading from "@/components/team/messages/messages-loading";

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <TeamMessages />
    </Suspense>
  );
}
