// Thry's dark and light palettes. Each is a full token set in globals.css; html carries
// data-theme (the palette) and data-mode (light or dark) so mode-specific rules
// can key on the mode without naming a palette.

export type ThemeMode = "light" | "dark";

export interface Theme {
  id: string;
  label: string;
  mode: ThemeMode;
}

export const THEMES: readonly Theme[] = [
  { id: "dark", label: "Dark", mode: "dark" },
  { id: "light", label: "Light", mode: "light" },
];

/** localStorage key; the previous light/dark toggle wrote "light" or "dark" here, which are still palette IDs. */
export const THEME_STORAGE_KEY = "theme";

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme.id;
  root.dataset.mode = theme.mode;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme.id);
  } catch {
    // Private mode or blocked storage: the choice lasts for this page only.
  }
}

/** Runs before paint: the saved palette, else dark or light from the system (also for a palette that no longer exists). */
export const themeInitScript = `
(function() {
  var modes = ${JSON.stringify(Object.fromEntries(THEMES.map((t) => [t.id, t.mode])))};
  var id;
  try { id = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}); } catch (e) {}
  if (!id || !modes[id]) {
    id = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.documentElement.dataset.theme = id;
  document.documentElement.dataset.mode = modes[id];
})();
`;
