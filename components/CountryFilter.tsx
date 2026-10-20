"use client";

import { useMemo } from "react";
import { REGIONS } from "@/lib/countries";
import { Select, SelectItem, SelectSeparator } from "@/components/controls/Select";
import Flag from "./Flag";
import { ALL_COUNTRIES, countryCodeFor, displayCountryName } from "@/lib/flags";

const ALL = "__all__";

interface RegionSelectProps {
  value: string;
  onChange: (v: string) => void;
}

export function RegionSelect({ value, onChange }: RegionSelectProps) {
  return (
    <Select
      label="Region"
      value={value || ALL}
      onValueChange={(v) => onChange(v === ALL ? "" : v)}
      className="w-32"
    >
      <SelectItem value={ALL}>Worldwide</SelectItem>
      <SelectSeparator />
      {REGIONS.map((r) => (
        <SelectItem key={r} value={r}>
          {r}
        </SelectItem>
      ))}
    </Select>
  );
}

export interface CountryInfo {
  code: string | null;
  name: string;
}

interface CountrySelectProps {
  value: string;
  onChange: (v: string) => void;
  /** Countries in the database (those with at least one institution). */
  countries: CountryInfo[];
}

/**
 * Merges the database's country list with the canonical `ALL_COUNTRIES`
 * table so that:
 *
 *   - Raw ISO codes coming back from the DB ("XK", "PS", "CO") are
 *     replaced with their canonical display names.
 *   - Countries in the country table but missing from the DB (notably
 *     Palestine) are still selectable.
 *   - Each option is keyed by its ISO code where possible so duplicates
 *     are collapsed.
 *
 * The `value` passed in/out remains the *display name* — that's what the
 * rankings filter compares against `institution.country`.
 */
export function buildOptions(countries: CountryInfo[]): CountryInfo[] {
  const byKey = new Map<string, CountryInfo>();

  const add = (entry: CountryInfo) => {
    const trimmed = (entry.name ?? "").trim();
    if (!trimmed || trimmed === "Unknown") return;
    const code =
      entry.code?.toLowerCase() ?? countryCodeFor(trimmed) ?? null;
    const name = displayCountryName(trimmed) || trimmed;
    const key = code ? `code:${code}` : `name:${name.toLowerCase()}`;

    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { code, name });
      return;
    }
    // Prefer the entry that has a real code and a non-raw name.
    if (!existing.code && code) existing.code = code;
    if (existing.name !== name && name.length > existing.name.length) {
      existing.name = name;
    }
  };

  for (const c of countries) add(c);
  for (const c of ALL_COUNTRIES) add({ code: c.code, name: c.name });

  return Array.from(byKey.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export function CountrySelect({
  value,
  onChange,
  countries,
}: CountrySelectProps) {
  const options = useMemo(() => buildOptions(countries), [countries]);

  // The value in and out is a display name; match it to an option however it was spelled.
  const selected = value
    ? options.find(
        (c) =>
          c.name.toLowerCase() === value.toLowerCase() ||
          (c.code && c.code.toLowerCase() === value.toLowerCase())
      )?.name ?? displayCountryName(value)
    : ALL;

  return (
    <Select
      label="Country"
      value={selected}
      onValueChange={(v) => onChange(v === ALL ? "" : v)}
      className="w-44"
    >
      <SelectItem value={ALL}>All countries</SelectItem>
      <SelectSeparator />
      {options.map((c) => (
        <SelectItem key={c.code ?? `name:${c.name}`} value={c.name}>
          <Flag country={c.name} code={c.code} width={16} />
          <span className="clamp" data-lines="1">{c.name}</span>
        </SelectItem>
      ))}
    </Select>
  );
}
