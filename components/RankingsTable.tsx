"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/controls/Button";
import InstitutionRow, { type RankedInstitution } from "./InstitutionRow";

interface RankingsTableProps {
  institutions: RankedInstitution[];
  /** The rankings request the list came from; each row extends it for its faculty. */
  rankingsUrl: string;
  areaNames: Record<string, string>;
}

const PAGE_SIZE = 50;

/**
 * Which page numbers to show in the pagination bar: first, last, and a window
 * of ±1 around the current page. Gaps are `null`.
 */
function getPageNumbers(current: number, total: number): Array<number | null> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: Array<number | null> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push(null);
    result.push(p);
  });
  return result;
}

/** "Page N of M", where N is a button that turns into a field for jumping to a page. */
function PageJumper({ current, total, onGo }: { current: number; total: number; onGo: (p: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function commit() {
    setEditing(false);
    const n = Number.parseInt(draft, 10);
    if (Number.isFinite(n) && n >= 1 && n <= total && n !== current) onGo(n);
  }

  return (
    <span className="muted type-tiny inline-flex items-center gap-1 tabular-nums">
      Page
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="control badge-mono align-center h-6 w-12 px-1 type-tiny"
          aria-label="Go to page"
        />
      ) : (
        <Button
          variant="quiet"
          size="sm"
          className="badge-mono h-6 px-1.5"
          title="Jump to a page"
          onClick={() => {
            setDraft(String(current));
            setEditing(true);
          }}
        >
          {current}
        </Button>
      )}
      of {total}
    </span>
  );
}

export default function RankingsTable({ institutions, rankingsUrl, areaNames }: RankingsTableProps) {
  // The page belongs to the list it was chosen in, so a new list (other filters, a refetch) starts on page one.
  const [paging, setPaging] = useState({ list: institutions, page: 1 });
  const page = paging.list === institutions ? paging.page : 1;
  const topRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(institutions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const visible = institutions.slice(startIdx, startIdx + PAGE_SIZE);
  const pageNumbers = useMemo(() => getPageNumbers(safePage, totalPages), [safePage, totalPages]);

  function goTo(p: number) {
    setPaging({ list: institutions, page: Math.max(1, Math.min(p, totalPages)) });
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div ref={topRef} className="scroll-mt-4">
      <div className="leaderboard-card">
        <div className="leaderboard-grid leaderboard-head type-micro px-3 py-2" aria-hidden>
          <span className="align-right">Rank</span>
          <span>Institution</span>
          <span className="align-right">Score</span>
          <span className="align-right">Faculty</span>
        </div>
        <ol className="leaderboard-list" aria-label="Institutions">
          {visible.map((inst) => (
            <InstitutionRow key={inst.id} institution={inst} rankingsUrl={rankingsUrl} areaNames={areaNames} />
          ))}
        </ol>
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pages" className="leaderboard-pager flex flex-wrap items-center justify-between gap-3 px-1 py-4">
          <span className="muted type-tiny tabular-nums">
            {(startIdx + 1).toLocaleString()}–{Math.min(startIdx + PAGE_SIZE, institutions.length).toLocaleString()} of{" "}
            {institutions.length.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="quiet" size="icon-sm" disabled={safePage === 1} onClick={() => goTo(1)} aria-label="First page">
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button variant="quiet" size="icon-sm" disabled={safePage === 1} onClick={() => goTo(safePage - 1)} aria-label="Previous page">
              <ChevronLeft className="size-3.5" />
            </Button>
            {pageNumbers.map((p, idx) =>
              p === null ? (
                <span key={`gap-${idx}`} className="muted type-tiny px-1">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === safePage ? "raised" : "quiet"}
                  size="icon-sm"
                  className="badge-mono type-tiny"
                  onClick={() => goTo(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === safePage ? "page" : undefined}
                >
                  {p}
                </Button>
              )
            )}
            <Button variant="quiet" size="icon-sm" disabled={safePage === totalPages} onClick={() => goTo(safePage + 1)} aria-label="Next page">
              <ChevronRight className="size-3.5" />
            </Button>
            <Button variant="quiet" size="icon-sm" disabled={safePage === totalPages} onClick={() => goTo(totalPages)} aria-label="Last page">
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
          <PageJumper current={safePage} total={totalPages} onGo={goTo} />
        </nav>
      )}
    </div>
  );
}
