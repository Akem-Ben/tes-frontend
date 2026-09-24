export interface ToneColors {
  bg: string;
  fg: string;
}

export interface AppTheme {
  name: "light" | "dark";
  color: {
    brand: string;
    brandDark: string;
    onBrand: string;
    /** page background */
    bg: string;
    /** sidebar / header / drawer surface */
    panel: string;
    /** card surface */
    card: string;
    /** inputs, subtle raised surfaces */
    input: string;
    /** muted fill (tab bars, progress track) */
    muted: string;
    mutedStrong: string;
    border: string;
    borderStrong: string;
    text: string;
    textBody: string;
    textMuted: string;
    textSoft: string;
    danger: string;
    dangerHover: string;
    dangerSoft: string;
    success: string;
    successHover: string;
    hover: string;
  };
  tone: {
    brand: ToneColors;
    green: ToneColors;
    red: ToneColors;
    amber: ToneColors;
    slate: ToneColors;
  };
  bar: {
    green: string;
    amber: string;
    red: string;
  };
  radius: {
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadow: {
    sm: string;
    md: string;
    xl: string;
  };
  bp: {
    sm: string;
    lg: string;
  };
}

const brand = "#1877f2";
const brandDark = "#145fc4";

const shared = {
  radius: { md: "0.375rem", lg: "0.5rem", xl: "0.75rem", full: "9999px" },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
  bp: { sm: "640px", lg: "1024px" },
} as const;

export const lightTheme: AppTheme = {
  name: "light",
  color: {
    brand,
    brandDark,
    onBrand: "#ffffff",
    bg: "#f1f5f9",
    panel: "#ffffff",
    card: "#ffffff",
    input: "#ffffff",
    muted: "#f1f5f9",
    mutedStrong: "#e2e8f0",
    border: "#e2e8f0",
    borderStrong: "#cbd5e1",
    text: "#0f172a",
    textBody: "#334155",
    textMuted: "#64748b",
    textSoft: "#94a3b8",
    danger: "#e11d48",
    dangerHover: "#be123c",
    dangerSoft: "#fff1f2",
    success: "#059669",
    successHover: "#047857",
    hover: "#f8fafc",
  },
  tone: {
    brand: { bg: "rgba(24, 119, 242, 0.1)", fg: brand },
    green: { bg: "#d1fae5", fg: "#047857" },
    red: { bg: "#ffe4e6", fg: "#be123c" },
    amber: { bg: "#fef3c7", fg: "#b45309" },
    slate: { bg: "#f1f5f9", fg: "#475569" },
  },
  bar: { green: "#10b981", amber: "#f59e0b", red: "#f43f5e" },
  ...shared,
};

export const darkTheme: AppTheme = {
  name: "dark",
  color: {
    brand,
    brandDark,
    onBrand: "#ffffff",
    bg: "#020617",
    panel: "#0f172a",
    card: "#1e293b",
    input: "#0f172a",
    muted: "#1e293b",
    mutedStrong: "#334155",
    border: "#334155",
    borderStrong: "#475569",
    text: "#f8fafc",
    textBody: "#e2e8f0",
    textMuted: "#94a3b8",
    textSoft: "#64748b",
    danger: "#fb7185",
    dangerHover: "#f43f5e",
    dangerSoft: "rgba(244, 63, 94, 0.1)",
    success: "#059669",
    successHover: "#047857",
    hover: "#1e293b",
  },
  tone: {
    brand: { bg: "rgba(24, 119, 242, 0.2)", fg: brand },
    green: { bg: "rgba(16, 185, 129, 0.15)", fg: "#6ee7b7" },
    red: { bg: "rgba(244, 63, 94, 0.15)", fg: "#fda4af" },
    amber: { bg: "rgba(245, 158, 11, 0.15)", fg: "#fcd34d" },
    slate: { bg: "#334155", fg: "#cbd5e1" },
  },
  bar: { green: "#10b981", amber: "#f59e0b", red: "#f43f5e" },
  ...shared,
};
