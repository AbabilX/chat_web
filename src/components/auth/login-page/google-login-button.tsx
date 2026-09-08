"use client";

import { loginWithGoogle } from "@/lib/api";
import GoogleIcon from "./google-icon";
import { LOGIN_BUTTON_CLASS, LOGIN_COPY } from "./login-copy";

export default function GoogleLoginButton() {
  return (
    <button type="button" onClick={loginWithGoogle} className={LOGIN_BUTTON_CLASS}>
      <GoogleIcon size={20} />
      {LOGIN_COPY.signInGoogle}
    </button>
  );
}
