"use client";

import { useEffect } from "react";
import { applyTheme, getStoredTheme } from "@/lib/theme";

export default function LoginTheme({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme("light");
    return () => {
      applyTheme(getStoredTheme());
    };
  }, []);

  return children;
}
