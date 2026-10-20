"use client";

import { useEffect, useState } from "react";
import type { FacultyResult, InstitutionSummary } from "@/lib/rankings";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/controls/Button";
import { cn } from "@/lib/utils";
import { displayCountryName } from "@/lib/flags";
import Flag from "./Flag";
import FacultyRow from "./FacultyRow";

export interface RankedInstitution extends InstitutionSummary {
  /** Competition rank by score within the current region or country: ties share a rank. */
  rank: number;
}

interface InstitutionRowProps {
  institution: RankedInstitution;
  /** The rankings request (areas, years) this row's list came from; the faculty breakdown extends it so the two match. */
  rankingsUrl: string;
  areaNames: Record<string, string>;
}

const FACULTY_PREVIEW = 25;

/** Faculty as fetched for one query; while the query differs from the current one, they are loading. */
type FacultyState = { query: string; status: "error" } | { query: string; status: "ready"; faculty: FacultyResult[] };

export default function InstitutionRow({ institution, rankingsUrl, areaNames }: InstitutionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [fetched, setFetched] = useState<FacultyState | null>(null);
  const [showAll, setShowAll] = useState(false);
  const query = `${rankingsUrl}&faculty=${institution.id}`;

  // Fetch while open, again whenever the filters change; a superseded request is cancelled so it cannot land late.
  useEffect(() => {
    if (!expanded) return;
    const controller = new AbortController();
    fetch(query, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .then((data: unknown) => setFetched({ query, status: "ready", faculty: Array.isArray(data) ? data : [] }))
      .catch(() => {
        if (!controller.signal.aborted) setFetched({ query, status: "error" });
      });
    return () => controller.abort();
  }, [expanded, query]);

  const state = fetched?.query === query ? fetched : { status: "loading" as const };
  const panelId = `faculty-${institution.id}`;
  const top = institution.rank <= 3 ? institution.rank : undefined;
  const faculty = state.status === "ready" ? state.faculty : [];
  const visible = showAll ? faculty : faculty.slice(0, FACULTY_PREVIEW);

  return (
    <li className="leaderboard-row" data-rank={top}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((e) => !e)}
        className="leaderboard-grid institution-toggle w-full items-center px-3 py-2.5 align-start"
      >
        <span className="leaderboard-rank badge-mono align-right type-small">{institution.rank}</span>
        <span className="flex min-w-0 items-center gap-2.5">
          <ChevronRight aria-hidden className={cn("institution-chevron size-3.5 shrink-0 muted", expanded && "rotate-90")} />
          <span className="min-w-0">
            <span className="leaderboard-name block type-base font-medium">
              {institution.displayName}
            </span>
            <span className="muted type-tiny mt-0.5 flex items-center gap-1.5">
              <Flag country={institution.country} code={institution.countryCode} width={14} />
              <span className="clamp" data-lines="1">
                {displayCountryName(institution.country)} · {institution.region}
              </span>
            </span>
          </span>
        </span>
        <span className="leaderboard-score badge-mono align-right type-base">{institution.score.toFixed(1)}</span>
        <span className="leaderboard-stat badge-mono align-right type-small">{institution.numFaculty}</span>
      </button>

      {expanded && (
        <div id={panelId} className="faculty-panel pb-3 pr-3">
          {state.status === "loading" && (
            <p className="muted type-tiny flex items-center gap-2 py-2">
              <LoaderCircle aria-hidden className="spinner size-3.5" /> Loading faculty…
            </p>
          )}
          {state.status === "error" && <p className="muted type-tiny py-2">Couldn&rsquo;t load faculty. Try again in a moment.</p>}
          {state.status === "ready" && faculty.length === 0 && <p className="muted type-tiny py-2">No faculty with papers in these areas and years.</p>}
          {visible.length > 0 && (
            <>
              <div className="faculty-row faculty-head leaderboard-head type-micro grid gap-3 pt-1 pb-1.5" aria-hidden>
                <span />
                <span>Faculty</span>
                <span className="align-right">Score</span>
                <span className="align-right">Papers</span>
              </div>
              <ul className="faculty-list" aria-label={`Faculty at ${institution.displayName}`}>
                {visible.map((f) => (
                  <FacultyRow key={f.id} faculty={f} areaNames={areaNames} />
                ))}
              </ul>
              {faculty.length > FACULTY_PREVIEW && (
                <Button variant="quiet" size="sm" className="mt-1" onClick={() => setShowAll((s) => !s)}>
                  {showAll ? "Show fewer" : `Show all ${faculty.length} faculty`}
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </li>
  );
}
