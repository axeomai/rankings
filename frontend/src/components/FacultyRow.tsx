"use client";

import type { FacultyResult } from "@rankings/backend/src/lib/rankings";

interface FacultyRowProps {
  faculty: FacultyResult;
  rank: number;
}

export default function FacultyRow({ faculty, rank }: FacultyRowProps) {
  const openalexUrl = `https://openalex.org/${faculty.openalexId}`;
  const orcidUrl = faculty.orcid ? `https://orcid.org/${faculty.orcid}` : null;

  const areaParts = Object.entries(faculty.areas)
    .sort((a, b) => b[1] - a[1])
    .map(([area, score]) => `${area} ${score.toFixed(2)}`);

  return (
    <div className="flex items-start gap-4 border-b border-border/50 py-2 pl-4 text-sm last:border-0">
      <span className="w-8 text-right font-mono text-xs tabular-nums text-muted-foreground/60">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <a
            href={openalexUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            {faculty.name}
          </a>
          {orcidUrl && (
            <a
              href={orcidUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-wider text-muted-foreground/60 hover:text-foreground"
            >
              ORCID
            </a>
          )}
        </div>
        {areaParts.length > 0 && (
          <div className="mt-0.5 font-mono text-xs text-muted-foreground">
            {areaParts.join(" · ")}
          </div>
        )}
      </div>
      <span className="w-20 text-right font-mono text-sm tabular-nums">
        {faculty.score.toFixed(2)}
      </span>
      <span className="w-16 text-right font-mono text-xs tabular-nums text-muted-foreground">
        {faculty.numPapers}
      </span>
    </div>
  );
}
