"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

/**
 * A button that toggles between light and dark mode.
 * Reads the current theme from the `dark` class on `<html>` (set by the
 * no-flash init script in the root layout) and persists changes to
 * `localStorage` under the key `"theme"`.
 */
export default function ThemeToggle() {
  // Start as `null` to avoid a hydration mismatch — the server can't know
  // which theme the client preferred. We resolve the real value after mount.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  // Keep in sync with system preference changes when the user hasn't made
  // an explicit choice yet (i.e. nothing in localStorage).
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem("theme")) return;
      } catch {
        return;
      }
      const next: Theme = e.matches ? "dark" : "light";
      applyTheme(next);
      setTheme(next);
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  }

  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="size-8"
    >
      {/* Render both icons and crossfade — keeps layout stable and avoids
          a flash before the theme state is resolved on first mount. */}
      <Sun
        className={
          "size-4 transition-all " +
          (isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100")
        }
      />
      <Moon
        className={
          "absolute size-4 transition-all " +
          (isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0")
        }
      />
    </Button>
  );
}
