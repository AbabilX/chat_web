"use client";

import type { ComponentType } from "react";
import GoogleLoginButton from "./google-login-button";
import QrLoginButton from "./qr-login-button";

const LOGIN_METHODS: { id: string; Panel: ComponentType }[] = [
  { id: "google", Panel: GoogleLoginButton },
  { id: "qr", Panel: QrLoginButton },
];

export default function LoginActions() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      {LOGIN_METHODS.map(({ id, Panel }) => (
        <Panel key={id} />
      ))}
    </div>
  );
}
