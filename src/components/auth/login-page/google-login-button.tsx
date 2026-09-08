"use client";

import { loginWithGoogle } from "@/lib/api";
import { Button } from "@/components/ui/button";
import GoogleIcon from "./google-icon";

export default function GoogleLoginButton() {
  return (
    <Button
      type="button"
      size="lg"
      className="w-full gap-2"
      onClick={loginWithGoogle}
    >
      <GoogleIcon size={16} />
      <span>Continue with Google</span>
    </Button>
  );
}
