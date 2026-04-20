"use client";

import type { InstitutionResult } from "@physics/backend/src/lib/rankings";
import InstitutionRow from "./InstitutionRow";

interface RankingsTableProps {
  institutions: InstitutionResult[];
  loading: boolean;
}

export default function RankingsTable({ institutions, loading }: RankingsTableProps) {
  const maxScore = institutions[0]?.score ?? 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Computing rankings…
      </div>
    );
  }

  if (institutions.length === 0) {
    return (
      <div className="py-24 text-center text-gray-400">
        No results. Try selecting more areas or adjusting the filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
            <th className="py-2 pl-4 pr-2 text-right">#</th>
            <th className="py-2 pr-4">Institution</th>
            <th className="py-2 pr-4 text-right">Score</th>
            <th className="py-2 pr-4 text-right">Faculty</th>
          </tr>
        </thead>
        <tbody>
          {institutions.map((inst, i) => (
            <InstitutionRow key={inst.id} institution={inst} rank={i + 1} maxScore={maxScore} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
