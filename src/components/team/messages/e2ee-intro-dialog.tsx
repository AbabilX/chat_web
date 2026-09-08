"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const E2EE_INTRO_SEEN_KEY = "ababilx_e2ee_intro_seen_v1";

export function hasSeenE2EEIntro() {
  return typeof window !== "undefined" && localStorage.getItem(E2EE_INTRO_SEEN_KEY) === "1";
}

export default function E2EEIntroDialog({
  open,
  onDone,
}: {
  open: boolean;
  onDone: () => void;
}) {
  function finish() {
    localStorage.setItem(E2EE_INTRO_SEEN_KEY, "1");
    onDone();
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && finish()}>
      <DialogContent className="w-[min(92vw,980px)] max-w-[980px] overflow-hidden p-0">
        <DialogTitle className="sr-only">Faster boards and private messages</DialogTitle>
        <div className="relative aspect-video w-full overflow-hidden bg-emerald-50">
          <Image
            alt="Two devices connected through end-to-end encryption"
            fill
            priority
            sizes="(max-width: 640px) 100vw, 448px"
            src="/images/messages/e2ee-intro-v2.png"
            className="object-cover"
          />
        </div>
        <div className="px-5 pb-5">
          <Button className="w-full" onClick={finish} type="button">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
