"use client";

import { useEffect, useState } from "react";
import { Moon02Icon, Sun03Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";
import { applyTheme, getStoredTheme, setStoredTheme, type Theme } from "@/lib/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const resolved = getStoredTheme();
    applyTheme(resolved);
    const frame = requestAnimationFrame(() => setTheme(resolved));
    return () => cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setStoredTheme(next);
    applyTheme(next);
  }

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "flex items-center justify-center w-7 h-7 rounded-lg transition-all",
        "text-slate-500 hover:text-slate-300 [data-theme=light]:text-slate-600 [data-theme=light]:hover:text-slate-900",
        "hover:bg-white/[0.06] [data-theme=light]:hover:bg-black/[0.05]",
        className,
      )}>
      {theme === "dark" ? <Sun03Icon size={14} /> : <Moon02Icon size={14} />}
    </button>
  );
}
