// Country lookups for flags and display names, derived from the shared
// country table in lib/countries.ts:
//   - CODE_TO_NAME : ISO code (uppercase) -> canonical display name
//   - NAME_TO_CODE : display name & common aliases (case-insensitive) -> code

import { COUNTRIES } from "@/lib/countries";

/** ISO 3166-1 alpha-2 code (uppercase) -> canonical display name. */
const CODE_TO_NAME: Record<string, string> = {};
/** Lowercased name (canonical or alias) -> ISO code (lowercase). */
const NAME_TO_CODE: Record<string, string> = {};

for (const entry of COUNTRIES) {
  const upper = entry.code.toUpperCase();
  const lower = entry.code.toLowerCase();
  CODE_TO_NAME[upper] = entry.name;
  NAME_TO_CODE[entry.name.toLowerCase()] = lower;
  if (entry.aliases) {
    for (const alias of entry.aliases) {
      const key = alias.toLowerCase();
      if (!(key in NAME_TO_CODE)) NAME_TO_CODE[key] = lower;
    }
  }
}

const ISO_CODE_RE = /^[A-Za-z]{2}$/;

/**
 * If `country` looks like a raw ISO 3166-1 alpha-2 code (e.g. "PS", "XK"),
 * return the canonical display name. Otherwise return the input unchanged
 * (after trimming).
 *
 * This is a display-side patch for institutions whose country wasn't
 * mapped on ingest and got the bare ISO code stored as the display name.
 */
export function displayCountryName(
  country: string | null | undefined
): string {
  if (!country) return "";
  const trimmed = country.trim();
  if (ISO_CODE_RE.test(trimmed)) {
    const upper = trimmed.toUpperCase();
    return CODE_TO_NAME[upper] ?? trimmed;
  }
  return trimmed;
}

/**
 * Resolve an ISO 3166-1 alpha-2 code (lowercase) for a country.
 * Accepts an explicit code if available, otherwise falls back to a
 * lookup by display name (canonical or alias). Returns `null` if the
 * country can't be resolved.
 */
export function countryCodeFor(
  country: string | null | undefined,
  explicitCode?: string | null
): string | null {
  if (explicitCode) return explicitCode.toLowerCase();
  if (!country) return null;
  const trimmed = country.trim();
  if (!trimmed) return null;
  // Already an ISO code?
  if (ISO_CODE_RE.test(trimmed)) {
    const upper = trimmed.toUpperCase();
    if (upper in CODE_TO_NAME) return upper.toLowerCase();
  }
  return NAME_TO_CODE[trimmed.toLowerCase()] ?? null;
}

/**
 * Returns the URL for a flag image (SVG) hosted on flagcdn.com,
 * or `null` if the country can't be resolved.
 */
export function flagUrlFor(
  country: string | null | undefined,
  explicitCode?: string | null
): string | null {
  const code = countryCodeFor(country, explicitCode);
  if (!code) return null;

  return `https://flagcdn.com/${code}.svg`;
}

/**
 * Full list of known countries (canonical name + ISO code), sorted
 * alphabetically by display name. Useful for building selectors that
 * should include countries even when they have no rows in the DB.
 */
export const ALL_COUNTRIES: ReadonlyArray<{ code: string; name: string }> =
  COUNTRIES.map((c) => ({ code: c.code, name: c.name })).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
