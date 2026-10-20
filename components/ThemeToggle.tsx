"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/controls/Button";
import { THEMES, applyTheme } from "@/lib/themes";

// The mode lives on <html data-mode>, set before paint; watch it there rather than copying it into state.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
  return () => observer.disconnect();
}
const readMode = () => document.documentElement.dataset.mode ?? "dark";
const readServerMode = () => "";

/** Switches between Thry's dark and light palettes. */
export default function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, readMode, readServerMode);
  const next = mode === "light" ? "dark" : "light";
  const label = `Switch to ${next} theme`;
  return (
    <Button
      variant="quiet"
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={() => {
        const theme = THEMES.find((t) => t.id === next);
        if (theme) applyTheme(theme);
      }}
    >
      {/* Before hydration the mode is unknown, so neither icon shows and nothing flips. */}
      {mode === "light" && <Moon className="size-4" />}
      {mode === "dark" && <Sun className="size-4" />}
    </Button>
  );
}
