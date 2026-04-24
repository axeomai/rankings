"use client";

import { useState } from "react";
import type { InstitutionResult } from "@rankings/backend/src/lib/rankings";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Flag from "./Flag";
import { displayCountryName } from "@/lib/flags";
import FacultyRow from "./FacultyRow";

interface InstitutionRowProps {
  institution: InstitutionResult;
  rank: number;
}

export default function InstitutionRow({
  institution,
  rank,
}: InstitutionRowProps) {
  const [expanded, setExpanded] = useState(false);

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

      {expanded && institution.faculty.length > 0 && (
        <div className="ml-10 border-l border-border">
          {institution.faculty.map((f, i) => (
            <FacultyRow key={f.id} faculty={f} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
