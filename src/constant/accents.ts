export type AccentId =
  | "indigo"
  | "aubergine"
  | "blue"
  | "jade"
  | "sunrise"
  | "crimson"
  | "lagoon";

export type AccentPreset = {
  id: AccentId;
  label: string;
  swatch: string;
  indigo: string;
  indigoLight: string;
  indigoGlow: string;
};

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: "indigo",
    label: "Indigo",
    swatch: "#6366f1",
    indigo: "#6366f1",
    indigoLight: "#818cf8",
    indigoGlow: "rgba(99, 102, 241, 0.25)",
  },
  {
    id: "aubergine",
    label: "Aubergine",
    swatch: "#611f69",
    indigo: "#611f69",
    indigoLight: "#c084fc",
    indigoGlow: "rgba(97, 31, 105, 0.35)",
  },
  {
    id: "blue",
    label: "Blue",
    swatch: "#1d4ed8",
    indigo: "#2563eb",
    indigoLight: "#60a5fa",
    indigoGlow: "rgba(37, 99, 235, 0.28)",
  },
  {
    id: "jade",
    label: "Jade",
    swatch: "#047857",
    indigo: "#059669",
    indigoLight: "#34d399",
    indigoGlow: "rgba(5, 150, 105, 0.28)",
  },
  {
    id: "lagoon",
    label: "Lagoon",
    swatch: "#0e7490",
    indigo: "#0891b2",
    indigoLight: "#22d3ee",
    indigoGlow: "rgba(8, 145, 178, 0.28)",
  },
  {
    id: "sunrise",
    label: "Sunrise",
    swatch: "#c2410c",
    indigo: "#ea580c",
    indigoLight: "#fb923c",
    indigoGlow: "rgba(234, 88, 12, 0.28)",
  },
  {
    id: "crimson",
    label: "Crimson",
    swatch: "#be123c",
    indigo: "#e11d48",
    indigoLight: "#fb7185",
    indigoGlow: "rgba(225, 29, 72, 0.28)",
  },
];

export const DEFAULT_ACCENT: AccentId = "crimson";

export function getAccentById(id: string): AccentPreset | undefined {
  return ACCENT_PRESETS.find((a) => a.id === id);
}
