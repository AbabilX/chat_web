"use client";

import { useState } from "react";
import { QrCodeIcon } from "hugeicons-react";
import QrLoginDialog from "./qr-login-dialog";
import { LOGIN_BUTTON_CLASS, LOGIN_COPY } from "./login-copy";

export default function QrLoginButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={LOGIN_BUTTON_CLASS}>
        <QrCodeIcon size={20} />
        {LOGIN_COPY.signInQr}
      </button>
      <QrLoginDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
