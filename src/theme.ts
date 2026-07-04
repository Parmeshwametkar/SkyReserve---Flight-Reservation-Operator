export interface BrandTheme {
  id: string;
  name: string;
  color: string; // Primary swatch hex
  colors: {
    brand50: string;
    brand100: string;
    brand500: string;
    brand600: string;
    brand700: string;
    brand900: string;
    brand950: string;
    brandTo600: string;
    brandTo700: string;
  };
}

export const THEME_PRESETS: BrandTheme[] = [
  {
    id: "indigo",
    name: "Classic Indigo",
    color: "#4f46e5",
    colors: {
      brand50: "#f5f3ff",
      brand100: "#e0e7ff",
      brand500: "#6366f1",
      brand600: "#4f46e5",
      brand700: "#4338ca",
      brand900: "#312e81",
      brand950: "#1e1b4b",
      brandTo600: "#7c3aed",
      brandTo700: "#6d28d9",
    },
  },
  {
    id: "emerald",
    name: "Emerald Oasis",
    color: "#10b981",
    colors: {
      brand50: "#ecfdf5",
      brand100: "#d1fae5",
      brand500: "#10b981",
      brand600: "#059669",
      brand700: "#047857",
      brand900: "#064e3b",
      brand950: "#022c22",
      brandTo600: "#0d9488",
      brandTo700: "#0f766e",
    },
  },
  {
    id: "amber",
    name: "Sunset Horizon",
    color: "#f59e0b",
    colors: {
      brand50: "#fffbeb",
      brand100: "#fef3c7",
      brand500: "#f59e0b",
      brand600: "#d97706",
      brand700: "#b45309",
      brand900: "#78350f",
      brand950: "#451a03",
      brandTo600: "#ea580c",
      brandTo700: "#c2410c",
    },
  },
  {
    id: "rose",
    name: "Rose Crimson",
    color: "#f43f5e",
    colors: {
      brand50: "#fff1f2",
      brand100: "#ffe4e6",
      brand500: "#f43f5e",
      brand600: "#e11d48",
      brand700: "#be123c",
      brand900: "#881337",
      brand950: "#4c0519",
      brandTo600: "#db2777",
      brandTo700: "#be185d",
    },
  },
  {
    id: "violet",
    name: "Royal Violet",
    color: "#8b5cf6",
    colors: {
      brand50: "#faf5ff",
      brand100: "#f3e8ff",
      brand500: "#8b5cf6",
      brand600: "#7c3aed",
      brand700: "#6d28d9",
      brand900: "#4c1d95",
      brand950: "#2e1065",
      brandTo600: "#c026d3",
      brandTo700: "#a21caf",
    },
  },
];

export function applyThemeColors(theme: BrandTheme) {
  const root = document.documentElement;
  root.style.setProperty("--brand-50", theme.colors.brand50);
  root.style.setProperty("--brand-100", theme.colors.brand100);
  root.style.setProperty("--brand-500", theme.colors.brand500);
  root.style.setProperty("--brand-600", theme.colors.brand600);
  root.style.setProperty("--brand-700", theme.colors.brand700);
  root.style.setProperty("--brand-900", theme.colors.brand900);
  root.style.setProperty("--brand-950", theme.colors.brand950);
  root.style.setProperty("--brand-to-600", theme.colors.brandTo600);
  root.style.setProperty("--brand-to-700", theme.colors.brandTo700);
}
