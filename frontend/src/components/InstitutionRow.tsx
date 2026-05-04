"use client";

import { useCallback, useEffect, useState } from "react";
import type { InstitutionSummary, FacultyResult } from "@rankings/backend/src/lib/rankings";
import { ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "./Flag";
import { displayCountryName } from "@/lib/flags";
import FacultyRow from "./FacultyRow";

interface InstitutionRowProps {
  institution: InstitutionSummary;
  rank: number;
  /** Current filter params so faculty fetch matches the rankings view. */
  fetchParams?: string;
}

export default function InstitutionRow({
  institution,
  rank,
  fetchParams = "",
}: InstitutionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [faculty, setFaculty] = useState<FacultyResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFaculty = useCallback(async () => {
    if (faculty !== null) return; // already loaded
    setLoading(true);
    try {
      const sep = fetchParams ? "&" : "?";
      const url = `/api/rankings?${fetchParams}${sep}faculty=${institution.id}`;
      const res = await fetch(url);
      const data = await res.json();
      setFaculty(Array.isArray(data) ? data : []);
    } catch {
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  }, [faculty, fetchParams, institution.id]);

  useEffect(() => {
    if (expanded && faculty === null && !loading) {
      fetchFaculty();
    }
  }, [expanded, faculty, loading, fetchFaculty]);

  // Reset cached faculty when filters change so re-expand fetches fresh data.
  useEffect(() => {
    setFaculty(null);
  }, [fetchParams]);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="group flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-accent/50"
      >
        <span className="w-10 text-right font-mono text-sm tabular-nums text-muted-foreground">
          {String(rank).padStart(3, "0")}
        </span>
        <ChevronRight
          className={cn(
            "size-3 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-90",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-foreground">
            {institution.displayName}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flag
              country={institution.country}
              code={institution.countryCode}
              width={14}
            />
            <span>
              {displayCountryName(institution.country)} · {institution.region}
            </span>
          </div>
        </div>
        <span className="w-20 text-right font-mono text-sm tabular-nums">
          {institution.score.toFixed(1)}
        </span>
        <span className="w-16 text-right font-mono text-sm tabular-nums text-muted-foreground">
          {institution.numFaculty}
        </span>
      </button>

      {expanded && (
        <div className="ml-10 border-l border-border">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Loading faculty…
            </div>
          )}
          {faculty && faculty.length > 0 && faculty.map((f, i) => (
            <FacultyRow key={f.id} faculty={f} rank={i + 1} />
          ))}
          {faculty && faculty.length === 0 && !loading && (
            <div className="px-4 py-3 text-xs text-muted-foreground">
              No faculty data available.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
