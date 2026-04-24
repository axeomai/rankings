"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { InstitutionResult } from "@rankings/backend/src/lib/rankings";
import { DISCIPLINES, getAllAreaIds } from "@rankings/backend/src/lib/disciplines";
import type { AreaGroup } from "@rankings/backend/src/lib/disciplines";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import AreaSelector from "./AreaSelector";
import { RegionSelect, CountrySelect, type CountryInfo } from "./CountryFilter";
import RankingsTable from "./RankingsTable";
import ThemeToggle from "./ThemeToggle";
import { displayCountryName, countryCodeFor } from "@/lib/flags";

type SortBy = "score" | "faculty" | "name";

interface RankingsClientProps {
  countries: CountryInfo[];
  disciplineId: string;
  title: string;
  subtitle: string;
}

const DEFAULT_YEAR_FROM = 2010;
const DEFAULT_YEAR_TO = 2025;



export default function RankingsClient({ countries, disciplineId, title, subtitle }: RankingsClientProps) {
  const discipline = DISCIPLINES[disciplineId];
  const areaGroups: AreaGroup[] = discipline.areaGroups;
  const allAreaIds = getAllAreaIds(discipline);

  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(
    new Set(allAreaIds)
  );
  const [yearFrom, setYearFrom] = useState(DEFAULT_YEAR_FROM);
  const [yearTo, setYearTo] = useState(DEFAULT_YEAR_TO);

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("score");

  const [institutions, setInstitutions] = useState<InstitutionResult[]>([]);
  const [loading, setLoading] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedAreas.size > 0)
      params.set("areas", Array.from(selectedAreas).join(","));
    params.set("yearFrom", String(yearFrom));
    params.set("yearTo", String(yearTo));

    try {
      const res = await fetch(`/api/rankings?${params.toString()}`);
      const data: InstitutionResult[] = await res.json();
      setInstitutions(Array.isArray(data) ? data : []);
    } catch {
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAreas, yearFrom, yearTo]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchRankings, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchRankings]);

  const filteredSorted = useMemo(() => {
    let list = institutions.filter(
      (i) => i.country !== "Unknown" && i.region !== "Other"
    );
    if (selectedCountry) {
      // Compare by ISO code so that "Israel / Occupied Palestine" matches
      // institutions stored as "Israel" or "IL" in the DB.
      const targetCode = countryCodeFor(selectedCountry);
      const targetName = displayCountryName(selectedCountry).toLowerCase();
      list = list.filter((i) => {
        const instCode = countryCodeFor(i.country, i.countryCode);
        if (targetCode && instCode) return instCode === targetCode;
        return displayCountryName(i.country).toLowerCase() === targetName;
      });
    } else if (selectedRegion) {
      list = list.filter((i) => i.region === selectedRegion);
    }
    list = [...list].sort((a, b) => {
      if (sortBy === "faculty") return b.numFaculty - a.numFaculty;
      if (sortBy === "name") return a.displayName.localeCompare(b.displayName);
      return b.score - a.score;
    });
    return list;
  }, [institutions, selectedCountry, selectedRegion, sortBy]);

  const totalFaculty = filteredSorted.reduce((s, i) => s + i.numFaculty, 0);
  const totalAreas = allAreaIds.length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-base font-semibold tracking-tight">
              Rankings
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              [v0.1]
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Page heading */}
      <div className="mx-auto w-full max-w-6xl px-6 pt-10 pb-6">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          {title} Department Rankings
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {subtitle}
        </p>
      </div>

      {/* Filter strip */}
      <div className="mx-auto w-full max-w-6xl border-y border-border px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search institutions..."
              className="h-8 w-48 pl-8 text-sm"
            />
          </div>

          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm">
                  <span className="font-mono tabular-nums">
                    {yearFrom} – {yearTo}
                  </span>
                </Button>
              }
            />
            <PopoverContent align="start" className="w-72">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                Publication years
              </div>
              <div className="mb-3 flex items-center justify-between font-mono text-sm tabular-nums">
                <span>{yearFrom}</span>
                <span className="text-muted-foreground">to</span>
                <span>{yearTo}</span>
              </div>
              <Slider
                value={[yearFrom, yearTo]}
                onValueChange={(vals) => {
                  if (Array.isArray(vals)) {
                    setYearFrom(vals[0]);
                    setYearTo(vals[1]);
                  }
                }}
                min={1990}
                max={2025}
                step={1}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline" size="sm" className="h-8 text-sm">
                  Areas ({selectedAreas.size}/{totalAreas})
                </Button>
              }
            />
            <PopoverContent align="start" className="w-72 p-0">
              <AreaSelector selected={selectedAreas} onChange={setSelectedAreas} areaGroups={areaGroups} />
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6" />

          <RegionSelect
            value={selectedRegion}
            onChange={(v) => {
              setSelectedRegion(v);
              setSelectedCountry("");
            }}
          />
          <CountrySelect
            value={selectedCountry}
            countries={countries}
            onChange={(v) => {
              setSelectedCountry(v);
              setSelectedRegion("");
            }}
          />

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Sort
            </span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
              <SelectTrigger size="sm" className="h-8 w-28 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats line */}
      <div className="mx-auto w-full max-w-6xl px-6 pt-3 pb-2 text-xs text-muted-foreground">
        {loading ? (
          <span>Loading…</span>
        ) : (
          <span className="tabular-nums">
            Showing {filteredSorted.length.toLocaleString()} institutions ·{" "}
            {totalFaculty.toLocaleString()} active faculty · {yearFrom}–{yearTo}
          </span>
        )}
      </div>

      {/* Rankings list */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-20">
        <div className="flex items-center gap-4 border-b border-border py-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <span className="w-10 text-right">Rank</span>
          <span className="w-3" />
          <span className="flex-1">Institution</span>
          <span className="w-20 text-right">Score</span>
          <span className="w-16 text-right">Faculty</span>
        </div>
        <RankingsTable
          institutions={filteredSorted}
          loading={loading}
          searchQuery={search}
        />
      </main>

      <footer className="mx-auto w-full max-w-6xl border-t border-border px-6 py-6 text-xs text-muted-foreground">
        Data: OpenAlex · Profiles: zbMATH · Source on GitHub
      </footer>
    </div>
  );
}
