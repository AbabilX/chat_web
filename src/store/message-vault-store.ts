import { create } from "zustand";
import {
  ensureMessageIdentity,
  lockMessageVault,
  startFreshIdentity,
  takePendingRecoveryCode,
  unlockWithRecoveryCode,
} from "@/lib/chat-e2ee/crypto";

/**
 * "unlocked" is the resting state and, on a browser that has been here before,
 * the only one anybody sees.
 *
 * "setup" shows a freshly generated recovery code once — the only moment it can
 * be shown, because nothing anywhere keeps a copy. "unlock" is a browser that
 * does not hold the key: it comes from a phone over QR, or from that code.
 */
type MessageVaultState = "checking" | "setup" | "unlock" | "unlocked" | "error";

type MessageVaultStore = {
  state: MessageVaultState;
  busy: boolean;
  error: string;
  /** The code to show on the setup screen; read once, never stored. */
  recoveryCode: string;
  check: () => Promise<void>;
  unlockWithCode: (code: string) => Promise<void>;
  startFresh: (emailCode: string) => Promise<void>;
  /** Confirms the user has saved the code and lets the chat through. */
  confirmRecoverySaved: () => void;
  lock: () => void;
};

function message(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export const useMessageVaultStore = create<MessageVaultStore>((set) => ({
  state: "checking",
  busy: false,
  error: "",
  recoveryCode: "",

  check: async () => {
    set({ state: "checking", error: "" });
    try {
      const outcome = await ensureMessageIdentity();
      if (outcome === "setup") {
        // Nothing keeps a copy of this, so a missing code here means the chat
        // opens and the user makes a new one from settings later — better than
        // blocking on a screen with nothing to show.
        const code = takePendingRecoveryCode();
        set(code ? { state: "setup", recoveryCode: code } : { state: "unlocked" });
        return;
      }
      set({ state: outcome === "ready" ? "unlocked" : "unlock" });
    } catch (error) {
      set({
        state: "error",
        error: message(error, "Could not check secure messages"),
      });
    }
  },

  unlockWithCode: async (code) => {
    set({ busy: true, error: "" });
    try {
      await unlockWithRecoveryCode(code);
      set({ state: "unlocked", busy: false });
    } catch (error) {
      set({ busy: false, error: message(error, "Could not unlock messages") });
      throw error;
    }
  },

  startFresh: async (emailCode) => {
    set({ busy: true, error: "" });
    try {
      await startFreshIdentity(emailCode);
      const code = takePendingRecoveryCode();
      set(
        code
          ? { state: "setup", recoveryCode: code, busy: false }
          : { state: "unlocked", busy: false },
      );
    } catch (error) {
      set({
        busy: false,
        error: message(error, "Could not start a new message identity"),
      });
      throw error;
    }
  },

  confirmRecoverySaved: () => set({ state: "unlocked", recoveryCode: "" }),

  lock: () => {
    lockMessageVault();
    set({ state: "unlock", busy: false, error: "", recoveryCode: "" });
  },
}));
