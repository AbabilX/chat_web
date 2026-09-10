"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
  /** Hide the left icon rail. The chat-list header grows the toggle back. */
  railCollapsed: boolean;
  toggleRail: () => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      railCollapsed: false,
      toggleRail: () => set((s) => ({ railCollapsed: !s.railCollapsed })),
    }),
    { name: "ababilx_ui_prefs" },
  ),
);
