"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { flagUrlFor } from "@/lib/flags";

interface FlagProps {
  country?: string | null;
  code?: string | null;
  /** Width in pixels. Height is derived from the 4:3 aspect ratio. */
  width?: number;
  className?: string;
}

/**
 * A country flag as an SVG image (from flagcdn.com), or a small neutral
 * placeholder when the country can't be resolved or the image fails to load.
 * Decorative: the country's name is always written beside it.
 */
export default function Flag({ country, code, width = 18, className }: FlagProps) {
  const [errored, setErrored] = useState(false);
  const url = flagUrlFor(country ?? null, code ?? null);
  const height = Math.round((width * 3) / 4);
  const classes = cn("flag inline-block shrink-0 object-cover", className);

  if (!url || errored) {
    return <span aria-hidden className={classes} style={{ width, height }} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onError={() => setErrored(true)}
      className={classes}
      style={{ width, height }}
    />
  );
}
