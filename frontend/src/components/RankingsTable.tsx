"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import type { InstitutionSummary } from "@rankings/backend/src/lib/rankings";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import InstitutionRow from "./InstitutionRow";
import { cn } from "@/lib/utils";

interface RankingsTableProps {
  institutions: InstitutionSummary[];
  loading: boolean;
  searchQuery?: string;
  fetchParams?: string;
}

const PAGE_SIZE = 50;

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-border py-3">
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-3 w-3" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

/**
 * Compute which page numbers to show in the pagination bar.
 * Always shows first, last, current, and a window of ±1 around current.
 * Gaps are represented as `null`.
 */
function PageJumper({
  current,
  total,
  onGo,
}: {
  current: number;
  total: number;
  onGo: (p: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(current));
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep draft in sync when the page changes externally.
  useEffect(() => {
    if (!editing) setDraft(String(current));
  }, [current, editing]);

  // Auto-focus & select all when entering edit mode.
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    const n = parseInt(draft, 10);
    if (!Number.isNaN(n) && n >= 1 && n <= total && n !== current) {
      onGo(n);
    } else {
      setDraft(String(current));
    }
  }

  if (editing) {
    return (
      <span className="text-xs tabular-nums text-muted-foreground">
        Page{" "}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(String(current));
              setEditing(false);
            }
          }}
          className="inline-block w-10 rounded border border-input bg-background px-1 py-0 text-center font-mono text-xs tabular-nums text-foreground outline-none focus:border-ring"
          aria-label="Go to page"
        />{" "}
        of {total}
      </span>
    );
  }

  return (
    <span className="text-xs tabular-nums text-muted-foreground">
      Page{" "}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="rounded px-1 font-mono text-foreground underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:decoration-foreground"
        title="Click to jump to a page"
      >
        {current}
      </button>{" "}
      of {total}
    </span>
  );
}

function getPageNumbers(current: number, total: number): Array<number | null> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: Array<number | null> = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push(null); // gap
    }
    result.push(sorted[i]);
  }
  return result;
}

export default function RankingsTable({
  institutions,
  loading,
  searchQuery = "",
  fetchParams = "",
}: RankingsTableProps) {
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return institutions;
    return institutions.filter((i) => i.displayName.toLowerCase().includes(q));
  }, [institutions, searchQuery]);

  const [page, setPage] = useState(1);

  // Reset to page 1 whenever the underlying list changes.
  useEffect(() => {
    setPage(1);
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(startIdx, startIdx + PAGE_SIZE);

  const pageNumbers = useMemo(
    () => getPageNumbers(safePage, totalPages),
    [safePage, totalPages],
  );

  function goTo(p: number) {
    const clamped = Math.max(1, Math.min(p, totalPages));
    setPage(clamped);
    // Scroll to top of the table smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div>
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        No results match your filters.
      </div>
    );
  }

  return (
    <div>
      {/* Rows */}
      {visible.map((inst, i) => (
        <InstitutionRow
          key={inst.id}
          institution={inst}
          rank={startIdx + i + 1}
          fetchParams={fetchParams}
        />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-1 py-4">
          {/* Left: showing X–Y of Z */}
          <span className="text-xs tabular-nums text-muted-foreground">
            {(startIdx + 1).toLocaleString()}–
            {Math.min(startIdx + PAGE_SIZE, filtered.length).toLocaleString()}{" "}
            of {filtered.length.toLocaleString()}
          </span>

          {/* Center: page buttons */}
          <div className="flex items-center gap-1">
            {/* First */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={safePage === 1}
              onClick={() => goTo(1)}
              aria-label="First page"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>

            {/* Prev */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={safePage === 1}
              onClick={() => goTo(safePage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>

            {/* Page numbers */}
            {pageNumbers.map((p, idx) =>
              p === null ? (
                <span
                  key={`gap-${idx}`}
                  className="px-1 text-xs text-muted-foreground/50"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => goTo(p)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md font-mono text-xs tabular-nums transition-colors",
                    p === safePage
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  aria-label={`Page ${p}`}
                  aria-current={p === safePage ? "page" : undefined}
                >
                  {p}
                </button>
              ),
            )}

            {/* Next */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={safePage === totalPages}
              onClick={() => goTo(safePage + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" />
            </Button>

            {/* Last */}
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              disabled={safePage === totalPages}
              onClick={() => goTo(totalPages)}
              aria-label="Last page"
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>

          {/* Right: page N of M (editable) */}
          <PageJumper current={safePage} total={totalPages} onGo={goTo} />
        </div>
      )}
    </div>
  );
}
