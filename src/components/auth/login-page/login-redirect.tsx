"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  getStoredTokenClientSnapshot,
  getStoredTokenServerSnapshot,
  subscribeStoredToken,
} from "@/lib/api";

const MESSAGES_PATH = "/user/messages";

export default function LoginRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isLoggedIn = useSyncExternalStore(
    subscribeStoredToken,
    getStoredTokenClientSnapshot,
    getStoredTokenServerSnapshot,
  );

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(MESSAGES_PATH);
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return null;
  }

  return children;
}
