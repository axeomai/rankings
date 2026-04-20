"use client";

import { useState } from "react";
import type { InstitutionResult } from "@physics/backend/src/lib/rankings";
import FacultyRow from "./FacultyRow";

interface InstitutionRowProps {
  institution: InstitutionResult;
  rank: number;
  maxScore: number;
}

export default function InstitutionRow({ institution, rank, maxScore }: InstitutionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const barWidth = maxScore > 0 ? (institution.score / maxScore) * 100 : 0;

  return (
    <>
      <tr
        className="cursor-pointer border-b border-gray-200 hover:bg-violet-50/40 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="w-10 py-2.5 pl-4 pr-2 text-right text-sm font-semibold tabular-nums text-gray-500">
          {rank}
        </td>
        <td className="py-2.5 pr-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{institution.displayName}</span>
            <span className="text-xs text-gray-400">{institution.country}</span>
            <span className="ml-auto text-xs text-gray-400">{expanded ? "▲" : "▼"}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </td>
        <td className="py-2.5 pr-4 text-right text-sm font-semibold tabular-nums text-gray-800">
          {institution.score.toFixed(1)}
        </td>
        <td className="py-2.5 pr-4 text-right text-sm tabular-nums text-gray-500">
          {institution.numFaculty}
        </td>
      </tr>
      {expanded && institution.faculty.map((f, i) => (
        <FacultyRow key={f.id} faculty={f} rank={i + 1} />
      ))}
    </>
  );
}
