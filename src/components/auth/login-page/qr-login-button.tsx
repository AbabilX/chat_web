"use client";

import { useState } from "react";
import { QrCodeIcon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import QrLoginDialog from "./qr-login-dialog";

export default function QrLoginButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size="lg"
        variant="outline"
        className="w-full gap-2"
        onClick={() => setOpen(true)}
      >
        <QrCodeIcon size={18} />
        <span>Scan with phone</span>
      </Button>
      <QrLoginDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
