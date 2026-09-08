import {
  ACCENT_PRESETS,
  DEFAULT_ACCENT,
  getAccentById,
  type AccentId,
  type AccentPreset,
} from "@/constant/accents";

export const ACCENT_KEY = "lbot_accent";
const LEGACY_ACCENT_KEY = "lbot_enterprise_accent";

function applyAccentTokens(preset: AccentPreset) {
  const root = document.documentElement;
  root.style.setProperty("--indigo", preset.indigo);
  root.style.setProperty("--indigo-light", preset.indigoLight);
  root.style.setProperty("--indigo-glow", preset.indigoGlow);
  root.setAttribute("data-accent", preset.id);
}

export function getStoredAccent(): AccentId {
  if (typeof window === "undefined") return DEFAULT_ACCENT;
  const stored =
    localStorage.getItem(ACCENT_KEY) ?? localStorage.getItem(LEGACY_ACCENT_KEY);
  if (stored && getAccentById(stored)) return stored as AccentId;
  return DEFAULT_ACCENT;
}

export function setStoredAccent(accentId: AccentId) {
  localStorage.setItem(ACCENT_KEY, accentId);
}

export function applyAccent(accentId: AccentId) {
  const preset = getAccentById(accentId);
  if (!preset) return;
  applyAccentTokens(preset);
  window.dispatchEvent(new CustomEvent("ababilx:accent-changed", { detail: preset.id }));
}

export function initAccent() {
  applyAccent(getStoredAccent());
}

/** Build inline script map for beforeInteractive */
export function buildAccentInitMap(): Record<string, string[]> {
  return Object.fromEntries(
    ACCENT_PRESETS.map((a) => [a.id, [a.indigo, a.indigoLight, a.indigoGlow]]),
  );
}
