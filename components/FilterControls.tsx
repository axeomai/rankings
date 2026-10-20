"use client";

import { useMemo, type ReactNode } from "react";
import type { AreaGroup } from "@/lib/disciplines";
import { FIRST_YEAR } from "@/lib/disciplines";
import { REGIONS } from "@/lib/countries";
import { Button } from "@/components/controls/Button";
import { Drawer } from "@/components/controls/Drawer";
import { NativeSelect } from "@/components/controls/NativeSelect";
import { Select, SelectItem } from "@/components/controls/Select";
import { DEFAULT_YEAR_FROM, type SortBy } from "@/lib/filters";
import AreaPanel from "./AreaPanel";
import { buildOptions, type CountryInfo } from "./CountryFilter";

/** Each sort with its short label (the drawer's pills) and its long one (the desktop select, which has no visible label). */
export const SORT_OPTIONS: { value: SortBy; short: string; long: string }[] = [
  { value: "score", short: "Score", long: "By score" },
  { value: "faculty", short: "Faculty", long: "By faculty" },
  { value: "name", short: "Name A–Z", long: "By name A–Z" },
];

interface YearRangeProps {
  yearFrom: number;
  yearTo: number;
  latestYear: number;
  onChange: (from: number, to: number) => void;
  /** Native selects (inside the drawer) or Thry's popover selects. */
  native?: boolean;
}

/** Presets over a from/to pair; the pair never crosses (moving one past the other drags it along). */
export function YearRange({ yearFrom, yearTo, latestYear, onChange, native = false }: YearRangeProps) {
  const years = useMemo(
    () => Array.from({ length: latestYear - FIRST_YEAR + 1 }, (_, i) => latestYear - i),
    [latestYear]
  );
  const presets = [
    { label: "5 years", from: latestYear - 4 },
    { label: "10 years", from: latestYear - 9 },
    { label: `Since ${DEFAULT_YEAR_FROM}`, from: DEFAULT_YEAR_FROM },
    { label: "All", from: FIRST_YEAR },
  ];
  const setFrom = (y: number) => onChange(y, Math.max(y, yearTo));
  const setTo = (y: number) => onChange(Math.min(y, yearFrom), y);

  return (
    <div>
      <Segmented
        label="Year presets"
        value={presets.find((p) => p.from === yearFrom && yearTo === latestYear)?.label ?? ""}
        options={presets.map((p) => ({ value: p.label, label: p.label }))}
        onChange={(label) => {
          const p = presets.find((x) => x.label === label);
          if (p) onChange(p.from, latestYear);
        }}
      />
      <div className="mt-3 flex items-center gap-2">
        {native ? (
          <>
            <NativeSelect aria-label="From year" value={yearFrom} onChange={(e) => setFrom(Number(e.target.value))} className="badge-mono flex-1">
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </NativeSelect>
            <span className="muted type-small">to</span>
            <NativeSelect aria-label="To year" value={yearTo} onChange={(e) => setTo(Number(e.target.value))} className="badge-mono flex-1">
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </NativeSelect>
          </>
        ) : (
          <>
            <Select label="From year" value={String(yearFrom)} onValueChange={(v) => setFrom(Number(v))} className="badge-mono flex-1">
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </Select>
            <span className="muted type-small">to</span>
            <Select label="To year" value={String(yearTo)} onValueChange={(v) => setTo(Number(v))} className="badge-mono flex-1">
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </Select>
          </>
        )}
      </div>
    </div>
  );
}

/** Thry's segmented pills: a recessed tray with the chosen option lifted. */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | "";
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="segmented-tray grid gap-0.5 p-0.5"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className="segmented-pill h-8 px-1 type-tiny"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="section-label">{label}</h3>
      {children}
    </section>
  );
}

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areaGroups: AreaGroup[];
  selectedAreas: Set<string>;
  onAreasChange: (areas: Set<string>) => void;
  yearFrom: number;
  yearTo: number;
  latestYear: number;
  onYearsChange: (from: number, to: number) => void;
  region: string;
  onRegionChange: (region: string) => void;
  country: string;
  onCountryChange: (country: string) => void;
  countries: CountryInfo[];
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
  /** How many institutions the current filters show, for the footer's button. */
  resultCount: number | null;
  onReset: () => void;
}

/**
 * The filters on a phone: everything the desktop toolbar and the areas sidebar
 * hold, in a bottom drawer opened from the button beside the search field.
 * Changes apply as they are made; the footer closes the sheet.
 */
export function FilterDrawer(props: FilterDrawerProps) {
  const countryOptions = useMemo(() => buildOptions(props.countries), [props.countries]);
  const count = props.resultCount;
  return (
    <Drawer
      open={props.open}
      onOpenChange={props.onOpenChange}
      title="Filters"
      footer={
        <div className="flex items-center gap-2">
          <Button variant="quiet" onClick={props.onReset}>
            Reset
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => props.onOpenChange(false)}>
            {count === null ? "Done" : `Show ${count.toLocaleString()} institution${count === 1 ? "" : "s"}`}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <Field label="Sort by">
          <Segmented
            label="Sort by"
            value={props.sortBy}
            options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.short }))}
            onChange={props.onSortChange}
          />
        </Field>
        <Field label="Publication years">
          <YearRange
            native
            yearFrom={props.yearFrom}
            yearTo={props.yearTo}
            latestYear={props.latestYear}
            onChange={props.onYearsChange}
          />
        </Field>
        <Field label="Place">
          <div className="grid grid-cols-2 gap-2">
            <NativeSelect
              aria-label="Region"
              value={props.region}
              onChange={(e) => props.onRegionChange(e.target.value)}
            >
              <option value="">Worldwide</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label="Country"
              value={countryOptions.some((c) => c.name === props.country) ? props.country : ""}
              onChange={(e) => props.onCountryChange(e.target.value)}
            >
              <option value="">All countries</option>
              {countryOptions.map((c) => (
                <option key={c.code ?? c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          </div>
        </Field>
        <AreaPanel areaGroups={props.areaGroups} selected={props.selectedAreas} onChange={props.onAreasChange} />
      </div>
    </Drawer>
  );
}
