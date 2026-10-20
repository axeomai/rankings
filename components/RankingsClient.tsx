"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { InstitutionSummary } from "@/lib/rankings";
import { DISCIPLINES, getAllAreaIds } from "@/lib/disciplines";
import { CalendarRange, LoaderCircle, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/controls/Button";
import { Popover } from "@/components/controls/Popover";
import { Select, SelectItem } from "@/components/controls/Select";
import { cn } from "@/lib/utils";
import { countryCodeFor, displayCountryName } from "@/lib/flags";
import { DEFAULT_YEAR_FROM, filtersToParams, type Filters, type SortBy } from "@/lib/filters";
import AreaPanel from "./AreaPanel";
import { CountrySelect, RegionSelect, type CountryInfo } from "./CountryFilter";
import { FilterDrawer, SORT_OPTIONS, YearRange } from "./FilterControls";
import type { RankedInstitution } from "./InstitutionRow";
import RankingsTable from "./RankingsTable";

interface RankingsClientProps {
  disciplineId: string;
  countries: CountryInfo[];
  initialFilters: Filters;
  /** The latest publication year, from the server so both renders agree. */
  latestYear: number;
}

/** The answer to one rankings query; while the current query differs, the view shows these, dimmed. */
type Results = { query: string; ok: boolean; institutions: InstitutionSummary[] };

/** Case- and accent-insensitive text for search ("Zurich" finds "Zürich"). */
function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Competition ranks by score: equal scores share a rank and the next rank skips ("1, 2, 2, 4"). */
function rankByScore(list: InstitutionSummary[]): RankedInstitution[] {
  const sorted = [...list].sort((a, b) => b.score - a.score);
  let rank = 0;
  return sorted.map((inst, i) => {
    if (i === 0 || Math.abs(inst.score - sorted[i - 1].score) > 1e-9) rank = i + 1;
    return { ...inst, rank };
  });
}

export default function RankingsClient({
  disciplineId,
  countries,
  initialFilters,
  latestYear,
}: RankingsClientProps) {
  const discipline = DISCIPLINES[disciplineId];
  const allAreaIds = useMemo(() => getAllAreaIds(discipline), [discipline]);
  const areaNames = useMemo(
    () => Object.fromEntries(discipline.areaGroups.flatMap((g) => g.areas.map((a) => [a.id, a.displayName]))),
    [discipline]
  );

  const [selectedAreas, setSelectedAreas] = useState(() => new Set(initialFilters.areas));
  const [yearFrom, setYearFrom] = useState(initialFilters.yearFrom);
  const [yearTo, setYearTo] = useState(initialFilters.yearTo);
  const [region, setRegion] = useState(initialFilters.region);
  const [country, setCountry] = useState(initialFilters.country);
  const [search, setSearch] = useState(initialFilters.search);
  const [sortBy, setSortBy] = useState<SortBy>(initialFilters.sort);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [results, setResults] = useState<Results | null>(null);

  // What the server is asked for; the faculty breakdowns extend it, so they always match the list.
  const areaKey = allAreaIds.filter((id) => selectedAreas.has(id)).join(",");
  const rankingsUrl = useMemo(() => {
    const params = new URLSearchParams({ areas: areaKey, yearFrom: String(yearFrom), yearTo: String(yearTo) });
    return `/api/rankings/${disciplineId}?${params}`;
  }, [disciplineId, areaKey, yearFrom, yearTo]);

  // Debounced, and each new request cancels the last, so a slow response can never overwrite a newer one.
  useEffect(() => {
    if (!areaKey) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(rankingsUrl, { signal: controller.signal });
        if (!res.ok) throw new Error(res.statusText);
        const data: unknown = await res.json();
        setResults({ query: rankingsUrl, ok: true, institutions: Array.isArray(data) ? data : [] });
      } catch {
        if (!controller.signal.aborted) setResults({ query: rankingsUrl, ok: false, institutions: [] });
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [areaKey, rankingsUrl]);

  const hasLoaded = results !== null;
  const loading = !!areaKey && results?.query !== rankingsUrl;
  const failed = !loading && results?.ok === false;
  const institutions = useMemo(() => (areaKey ? (results?.institutions ?? []) : []), [areaKey, results]);

  // Keep the address shareable: every non-default filter is in the query string. The first run is skipped (the
  // address already holds these filters, and Next's router has not yet written its own entry state), and the entry's
  // existing state is kept, so the router's back and forward still work.
  const syncedOnce = useRef(false);
  useEffect(() => {
    if (!syncedOnce.current) {
      syncedOnce.current = true;
      return;
    }
    const qs = filtersToParams(
      { areas: areaKey ? areaKey.split(",") : [], yearFrom, yearTo, region, country, search, sort: sortBy },
      discipline,
      latestYear
    ).toString();
    if (qs === window.location.search.slice(1)) return;
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [areaKey, yearFrom, yearTo, region, country, search, sortBy, discipline, latestYear]);

  // Rank within the chosen region or country first, so searching or re-sorting never changes anyone's rank.
  const ranked = useMemo(() => {
    let list = institutions.filter((i) => i.country !== "Unknown" && i.region !== "Other");
    if (country) {
      // Compare by ISO code so a name, an alias, or a bare code in the data all match.
      const targetCode = countryCodeFor(country);
      const targetName = displayCountryName(country).toLowerCase();
      list = list.filter((i) => {
        const instCode = countryCodeFor(i.country, i.countryCode);
        if (targetCode && instCode) return instCode === targetCode;
        return displayCountryName(i.country).toLowerCase() === targetName;
      });
    } else if (region) {
      list = list.filter((i) => i.region === region);
    }
    return rankByScore(list);
  }, [institutions, country, region]);

  const shown = useMemo(() => {
    const q = fold(search.trim());
    const list = q ? ranked.filter((i) => fold(i.displayName).includes(q)) : [...ranked];
    if (sortBy === "faculty") list.sort((a, b) => b.numFaculty - a.numFaculty || a.rank - b.rank);
    if (sortBy === "name") list.sort((a, b) => a.displayName.localeCompare(b.displayName));
    return list;
  }, [ranked, search, sortBy]);

  const totalFaculty = ranked.reduce((s, i) => s + i.numFaculty, 0);
  // Filters that differ from the defaults, counted on the phone's filter button.
  const activeFilters =
    Number(selectedAreas.size !== allAreaIds.length) +
    Number(yearFrom !== DEFAULT_YEAR_FROM || yearTo !== latestYear) +
    Number(!!(region || country)) +
    Number(sortBy !== "score");

  function setYears(from: number, to: number) {
    setYearFrom(from);
    setYearTo(to);
  }

  function resetFilters() {
    setSelectedAreas(new Set(allAreaIds));
    setYears(DEFAULT_YEAR_FROM, latestYear);
    setRegion("");
    setCountry("");
    setSortBy("score");
  }

  function clearFilters() {
    setSearch("");
    setRegion("");
    setCountry("");
  }

  const areaPanel = <AreaPanel areaGroups={discipline.areaGroups} selected={selectedAreas} onChange={setSelectedAreas} />;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
      <div className="pt-8 pb-6">
        <h1 className="page-title">{discipline.title} department rankings</h1>
        <p className="page-lead muted type-base mt-1.5 max-w-2xl">{discipline.subtitle}</p>
      </div>

      <dl className="stat-strip leaderboard-stats grid grid-cols-2 sm:grid-cols-4">
        {[
          { label: "Institutions", value: hasLoaded ? ranked.length.toLocaleString() : "–" },
          { label: "Active faculty", value: hasLoaded ? totalFaculty.toLocaleString() : "–" },
          { label: "Years", value: yearFrom === yearTo ? String(yearFrom) : `${yearFrom}–${yearTo}` },
          { label: "Areas", value: `${selectedAreas.size} of ${allAreaIds.length}` },
        ].map((s) => (
          <div key={s.label} className="stat-strip-cell px-4 py-3">
            <dt className="section-label">{s.label}</dt>
            <dd className="stat-value mt-1 tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden lg:sticky lg:top-4 lg:block lg:self-start">{areaPanel}</aside>

        <section aria-label="Rankings" className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 pb-3">
            <label className="control search-field flex h-9 min-w-0 flex-1 items-center gap-2 px-2.5 lg:h-8 lg:w-48 lg:flex-none">
              <Search aria-hidden className="size-3.5 shrink-0 muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search institutions"
                aria-label="Search institutions"
                className="search-field-input min-w-0 flex-1 type-small"
              />
            </label>

            <Button
              className="lg:hidden"
              aria-haspopup="dialog"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilters > 0 && (
                <span className="badge badge-mono filter-count inline-flex h-[18px] min-w-[18px] items-center justify-center px-1">
                  {activeFilters}
                </span>
              )}
            </Button>

            {/* The desktop toolbar; on a phone these live in the filter drawer. */}
            <div className="hidden lg:contents">
              <Popover
                trigger={
                  <Button size="sm" aria-label={`Years ${yearFrom} to ${yearTo}`}>
                    <CalendarRange className="size-3.5 muted" />
                    <span className="badge-mono">
                      {yearFrom}–{yearTo}
                    </span>
                  </Button>
                }
                className="w-80"
              >
                <p className="section-label mb-2">Publication years</p>
                <YearRange yearFrom={yearFrom} yearTo={yearTo} latestYear={latestYear} onChange={setYears} />
              </Popover>

              <RegionSelect
                value={region}
                onChange={(v) => {
                  setRegion(v);
                  setCountry("");
                }}
              />
              <CountrySelect
                value={country}
                countries={countries}
                onChange={(v) => {
                  setCountry(v);
                  setRegion("");
                }}
              />

              <Select label="Sort by" value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)} className="w-32 ml-auto">
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.long}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>

          <FilterDrawer
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            areaGroups={discipline.areaGroups}
            selectedAreas={selectedAreas}
            onAreasChange={setSelectedAreas}
            yearFrom={yearFrom}
            yearTo={yearTo}
            latestYear={latestYear}
            onYearsChange={setYears}
            region={region}
            onRegionChange={(v) => {
              setRegion(v);
              setCountry("");
            }}
            country={country}
            onCountryChange={(v) => {
              setCountry(v);
              setRegion("");
            }}
            countries={countries}
            sortBy={sortBy}
            onSortChange={setSortBy}
            resultCount={hasLoaded && !loading && !failed ? (selectedAreas.size ? shown.length : 0) : null}
            onReset={resetFilters}
          />

          <p className="muted type-tiny flex min-h-5 items-center gap-2 pb-2" aria-live="polite">
            {loading && <LoaderCircle aria-hidden className="spinner size-3.5" />}
            {loading
              ? "Updating…"
              : hasLoaded && !failed && selectedAreas.size > 0
                ? shown.length === ranked.length
                  ? `${ranked.length.toLocaleString()} institutions · ${totalFaculty.toLocaleString()} active faculty`
                  : `${shown.length.toLocaleString()} of ${ranked.length.toLocaleString()} institutions match “${search.trim()}”`
                : null}
          </p>

          {selectedAreas.size === 0 ? (
            <EmptyState title="No areas selected" body="Pick at least one research area to rank departments by.">
              <Button size="sm" onClick={() => setSelectedAreas(new Set(allAreaIds))}>
                Select all areas
              </Button>
            </EmptyState>
          ) : failed ? (
            <EmptyState title="Couldn’t load the rankings" body="The rankings service didn’t answer. Try again in a moment." />
          ) : !hasLoaded ? (
            <LeaderboardSkeleton />
          ) : shown.length === 0 ? (
            <EmptyState title="No institutions match" body="Try a wider year range, more areas, or another place.">
              {(search || region || country) && (
                <Button size="sm" onClick={clearFilters}>
                  Clear search and place
                </Button>
              )}
            </EmptyState>
          ) : (
            <div className={cn("leaderboard-results", loading && "leaderboard-stale")} aria-busy={loading}>
              <RankingsTable institutions={shown} rankingsUrl={rankingsUrl} areaNames={areaNames} />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EmptyState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="empty-state align-center flex flex-col items-center gap-2 px-6 py-14">
      <p className="type-base font-semibold">{title}</p>
      <p className="muted type-small max-w-sm">{body}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div aria-hidden className="leaderboard-card">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="leaderboard-grid items-center px-3 py-3">
          <span className="skeleton ml-auto h-4 w-6" />
          <span className="flex flex-col gap-1.5">
            <span className="skeleton h-4 w-56 max-w-full" />
            <span className="skeleton h-3 w-28" />
          </span>
          <span className="skeleton ml-auto h-4 w-12" />
          <span className="skeleton ml-auto h-4 w-8" />
        </div>
      ))}
    </div>
  );
}
