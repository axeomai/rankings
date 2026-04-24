"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { flagUrlFor, flagEmojiOverrideFor } from "@/lib/flags";

interface FlagProps {
  country?: string | null;
  code?: string | null;
  /** Width in pixels. Height is derived from the 4:3 aspect ratio. */
  width?: number;
  className?: string;
  title?: string;
}

/**
 * Renders a country flag as an SVG image (from flagcdn.com).
 * Falls back to a small neutral placeholder when the country can't
 * be resolved or when the image fails to load.
 *
 * If `flagEmojiOverrideFor` returns a value for the given country,
 * renders that emoji instead of the SVG flag.
 */
export default function Flag({
  country,
  code,
  width = 18,
  className,
  title,
}: FlagProps) {
  const [errored, setErrored] = useState(false);
  const emojiOverride = flagEmojiOverrideFor(country ?? null, code ?? null);
  const url = emojiOverride ? null : flagUrlFor(country ?? null, code ?? null);
  const height = Math.round((width * 3) / 4);

  const baseClass = cn(
    "inline-block shrink-0 rounded-[2px] border border-black/10 bg-muted object-cover dark:border-white/10",
    className
  );

  if (emojiOverride) {
    return (
      <span
        role="img"
        aria-label={title ?? country ?? "flag"}
        title={title ?? country ?? undefined}
        className={cn(
          "inline-flex shrink-0 items-center justify-center leading-none",
          className
        )}
        style={{ width, height, fontSize: Math.round(height * 0.95) }}
      >
        {emojiOverride}
      </span>
    );
  }

  if (!url || errored) {
    return (
      <span
        aria-hidden
        className={baseClass}
        style={{ width, height }}
        title={title ?? country ?? undefined}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={title ?? country ?? ""}
      title={title ?? country ?? undefined}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      className={baseClass}
      style={{ width, height }}
    />
  );
}
