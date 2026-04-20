"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { InstitutionResult } from "@physics/backend/src/lib/rankings";
import { ALL_AREA_IDS } from "@physics/backend/src/lib/areas";
import AreaSelector from "./AreaSelector";
import CountryFilter from "./CountryFilter";
import RankingsTable from "./RankingsTable";

interface RankingsClientProps {
  countries: string[];
}

export default function RankingsClient({ countries }: RankingsClientProps) {
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set(ALL_AREA_IDS));
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [yearFrom, setYearFrom] = useState(1970);
  const [yearTo, setYearTo] = useState(2025);
  const [institutions, setInstitutions] = useState<InstitutionResult[]>([]);
  const [loading, setLoading] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedAreas.size > 0) params.set("areas", Array.from(selectedAreas).join(","));
    if (selectedRegion) params.set("region", selectedRegion);
    if (selectedCountry) params.set("country", selectedCountry);
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
  }, [selectedAreas, selectedRegion, selectedCountry, yearFrom, yearTo]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchRankings, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchRankings]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-baseline gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">PhysicsRankings</h1>
          <p className="text-sm text-gray-500">
            Metrics-based ranking of physics departments by research output in selective journals
          </p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 p-6">
        <aside className="w-56 shrink-0">
          <div className="mb-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Year range</p>
            <div className="flex items-center gap-1.5">
              <input
                type="number" value={yearFrom} min={1990} max={yearTo}
                onChange={(e) => setYearFrom(Number(e.target.value))}
                className="w-20 rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <span className="text-gray-400">–</span>
              <input
                type="number" value={yearTo} min={yearFrom} max={2025}
                onChange={(e) => setYearTo(Number(e.target.value))}
                className="w-20 rounded border border-gray-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Areas</p>
            <AreaSelector selected={selectedAreas} onChange={setSelectedAreas} />
          </div>
        </aside>

        <main className="flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
            <CountryFilter
              countries={countries}
              selectedRegion={selectedRegion}
              selectedCountry={selectedCountry}
              onRegionChange={setSelectedRegion}
              onCountryChange={setSelectedCountry}
            />
          </div>
          {!loading && institutions.length > 0 && (
            <div className="border-b border-gray-100 px-4 py-2 text-xs text-gray-500">
              Showing {institutions.length} institutions ·{" "}
              {institutions.reduce((s, i) => s + i.numFaculty, 0)} active faculty
            </div>
          )}
          <RankingsTable institutions={institutions} loading={loading} />
        </main>
      </div>

      <footer className="border-t border-gray-100 bg-gray-50 py-4 text-center text-xs text-gray-400">
        Publication data from{" "}
        <a href="https://inspirehep.net" target="_blank" rel="noopener noreferrer" className="hover:underline">
          INSPIRE-HEP
        </a>{" "}
        · Inspired by{" "}
        <a href="https://csrankings.org" target="_blank" rel="noopener noreferrer" className="hover:underline">
          CSRankings
        </a>
      </footer>
    </div>
  );
}
