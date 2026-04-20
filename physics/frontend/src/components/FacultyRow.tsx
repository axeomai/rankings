import type { FacultyResult } from "@physics/backend/src/lib/rankings";

interface FacultyRowProps {
  faculty: FacultyResult;
  rank: number;
}

export default function FacultyRow({ faculty, rank }: FacultyRowProps) {
  const openalexUrl = `https://openalex.org/${faculty.openalexId}`;
  const orcidUrl = faculty.orcid ? `https://orcid.org/${faculty.orcid}` : null;

  return (
    <tr className="border-b border-gray-100 bg-gray-50 text-xs">
      <td className="py-1.5 pl-12 pr-2 text-gray-400">{rank}</td>
      <td className="py-1.5 pr-4">
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={openalexUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-violet-700 hover:underline"
          >
            {faculty.name}
          </a>
          {orcidUrl && (
            <a
              href={orcidUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700 hover:bg-emerald-100"
              title="ORCID"
            >
              ORCID
            </a>
          )}
        </div>
        {Object.keys(faculty.areas).length > 0 && (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {Object.entries(faculty.areas)
              .sort((a, b) => b[1] - a[1])
              .map(([area, score]) => (
                <span key={area} className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">
                  {area}: {score.toFixed(2)}
                </span>
              ))}
          </div>
        )}
      </td>
      <td className="py-1.5 pr-4 text-right tabular-nums text-gray-600">{faculty.score.toFixed(2)}</td>
      <td className="py-1.5 pr-4 text-right tabular-nums text-gray-500">{faculty.numPapers}</td>
    </tr>
  );
}
