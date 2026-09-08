"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { exchangeAuthCode } from "@/lib/api";
import CallbackStatus from "@/components/auth/callback-status";

function GoogleCallbackInner() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = params.get("code");
    if (!code) {
      router.replace("/?error=auth_failed");
      return;
    }
    exchangeAuthCode(code).then((ok) => {
      router.replace(ok ? "/user/messages" : "/?error=auth_failed");
    });
  }, [params, router]);

  return null;
}

export default function GoogleCallback() {
  return (
    <CallbackStatus label="Authenticating with Google…">
      <Suspense fallback={null}>
        <GoogleCallbackInner />
      </Suspense>
    </CallbackStatus>
  );
}
