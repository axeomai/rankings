"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Flag from "./Flag";
import { ALL_COUNTRIES, countryCodeFor, displayCountryName } from "@/lib/flags";

const REGIONS = [
  "North America",
  "South America",
  "Europe",
  "Asia",
  "Africa",
  "Australasia",
];

interface RegionSelectProps {
  value: string;
  onChange: (v: string) => void;
}

export function RegionSelect({ value, onChange }: RegionSelectProps) {
  return (
    <Select
      value={value || "__all__"}
      onValueChange={(v) => onChange(!v || v === "__all__" ? "" : v)}
    >
      <SelectTrigger size="sm" className="h-8 w-36 text-sm">
        <SelectValue>{value || "Worldwide"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">Worldwide</SelectItem>
        {REGIONS.map((r) => (
          <SelectItem key={r} value={r}>
            {r}
          </SelectItem>
        ))}
      </SelectContent>
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
  /** Countries returned by the backend (i.e. those with ≥1 institution). */
  countries: CountryInfo[];
}

/**
 * Merges the backend's country list with the canonical `ALL_COUNTRIES`
 * table so that:
 *
 *   - Raw ISO codes coming back from the DB ("XK", "PS", "CO") are
 *     replaced with their canonical display names.
 *   - Countries known to the frontend but missing from the DB (notably
 *     Palestine) are still selectable.
 *   - Each option is keyed by its ISO code where possible so duplicates
 *     are collapsed.
 *
 * The `value` passed in/out remains the *display name* — that's what the
 * rankings filter compares against `institution.country`.
 */
function buildOptions(countries: CountryInfo[]): CountryInfo[] {
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

  const selected = value
    ? options.find(
        (c) =>
          c.name === value ||
          c.name.toLowerCase() === value.toLowerCase() ||
          (c.code && c.code.toLowerCase() === value.toLowerCase())
      ) ?? {
        code: countryCodeFor(value) ?? null,
        name: displayCountryName(value) || value,
      }
    : null;

  return (
    <Select
      value={value || "__all__"}
      onValueChange={(v) => onChange(!v || v === "__all__" ? "" : v)}
    >
      <SelectTrigger size="sm" className="h-8 w-56 text-sm">
        <SelectValue placeholder="All countries">
          {selected ? (
            <span className="flex items-center gap-2">
              <Flag country={selected.name} code={selected.code} width={16} className="shrink-0" />
              <span className="truncate">{selected.name}</span>
            </span>
          ) : (
            "All countries"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All countries</SelectItem>
        {options.map((c) => (
          <SelectItem key={c.code ?? `name:${c.name}`} value={c.name}>
            <span className="flex items-center gap-2">
              <Flag country={c.name} code={c.code} width={16} className="shrink-0" />
              <span>{c.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
