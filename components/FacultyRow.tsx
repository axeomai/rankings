import type { FacultyResult } from "@/lib/rankings";

interface FacultyRowProps {
  faculty: FacultyResult;
  /** Area ID -> display name, for the breakdown under the name. */
  areaNames: Record<string, string>;
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** One of eight avatar hues, chosen by the name, so a person keeps one color. */
function avatarTone(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % 8;
}

export default function FacultyRow({ faculty, areaNames }: FacultyRowProps) {
  const areas = Object.entries(faculty.areas).sort((a, b) => b[1] - a[1]);

  return (
    <li className="faculty-row grid items-start gap-3 py-2">
      <span
        aria-hidden
        data-tone={avatarTone(faculty.name)}
        className="avatar type-micro mt-0.5 inline-flex size-7 items-center justify-center font-semibold"
      >
        {initials(faculty.name)}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <a
            href={`https://openalex.org/${faculty.openalexId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="person-link type-small font-medium"
          >
            {faculty.name}
          </a>
          {faculty.orcid && (
            <a
              href={`https://orcid.org/${faculty.orcid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="badge px-1.5 py-1"
              data-tone="success"
              aria-label={`${faculty.name} on ORCID`}
            >
              ORCID
            </a>
          )}
        </div>
        {areas.length > 0 && (
          <ul className="mt-1 flex flex-wrap gap-1" aria-label="Score by area">
            {areas.map(([area, score]) => (
              <li key={area} className="badge inline-flex items-center gap-1 px-1.5 py-1">
                {areaNames[area] ?? area}
                <span className="badge-mono faculty-area-score">{score.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <span className="align-right badge-mono type-small pt-1">{faculty.score.toFixed(2)}</span>
      <span className="align-right badge-mono type-small muted pt-1">{faculty.numPapers}</span>
    </li>
  );
}
