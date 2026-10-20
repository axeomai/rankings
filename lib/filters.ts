import { FIRST_YEAR, getAllAreaIds } from "@/lib/disciplines";
import type { Discipline } from "@/lib/disciplines";
import { REGIONS } from "@/lib/countries";

export const SORTS = ["score", "faculty", "name"] as const;
export type SortBy = (typeof SORTS)[number];

/** The years shown before anyone picks a range: from here to the latest year. */
export const DEFAULT_YEAR_FROM = 2010;

/** Everything the rankings view can be filtered by, as kept in the URL. */
export interface Filters {
  areas: string[];
  yearFrom: number;
  yearTo: number;
  region: string;
  country: string;
  search: string;
  sort: SortBy;
}

type ParamSource = { get(name: string): string | null };

function year(value: string | null, fallback: number, latest: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? Math.min(latest, Math.max(FIRST_YEAR, n)) : fallback;
}

/** Filters from URL parameters, keeping only values that mean something for this discipline. */
export function parseFilters(params: ParamSource, discipline: Discipline, latest: number): Filters {
  const allAreas = getAllAreaIds(discipline);
  const areasParam = params.get("areas");
  const areas =
    areasParam === null
      ? allAreas
      : areasParam.split(",").filter((a) => allAreas.includes(a));
  let yearFrom = year(params.get("from"), DEFAULT_YEAR_FROM, latest);
  let yearTo = year(params.get("to"), latest, latest);
  if (yearFrom > yearTo) [yearFrom, yearTo] = [yearTo, yearFrom];
  const region = params.get("region") ?? "";
  const sort = params.get("sort") ?? "";
  return {
    areas,
    yearFrom,
    yearTo,
    region: (REGIONS as readonly string[]).includes(region) ? region : "",
    country: params.get("country") ?? "",
    search: params.get("q") ?? "",
    sort: (SORTS as readonly string[]).includes(sort) ? (sort as SortBy) : "score",
  };
}

/** URL parameters for the filters, leaving out every value that is the default. */
export function filtersToParams(f: Filters, discipline: Discipline, latest: number): URLSearchParams {
  const params = new URLSearchParams();
  const allAreas = getAllAreaIds(discipline);
  if (f.areas.length !== allAreas.length) params.set("areas", f.areas.join(","));
  if (f.yearFrom !== DEFAULT_YEAR_FROM) params.set("from", String(f.yearFrom));
  if (f.yearTo !== latest) params.set("to", String(f.yearTo));
  if (f.region) params.set("region", f.region);
  if (f.country) params.set("country", f.country);
  if (f.search.trim()) params.set("q", f.search.trim());
  if (f.sort !== "score") params.set("sort", f.sort);
  return params;
}
