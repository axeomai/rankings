"use client";

import { useState } from "react";
import type { Area, AreaGroup } from "@/lib/disciplines";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/controls/Button";
import { Checkbox } from "@/components/controls/Checkbox";
import { cn } from "@/lib/utils";

interface AreaPanelProps {
  areaGroups: AreaGroup[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

/**
 * The research areas that count toward a score, CSRankings style. A group with
 * several areas (computer science's AI, Systems, ...) is a heading with its own
 * checkbox over its areas; a group of one is just that area's row. Each row can
 * reveal the venues it counts.
 */
export default function AreaPanel({ areaGroups, selected, onChange }: AreaPanelProps) {
  const allAreaIds = areaGroups.flatMap((g) => g.areas.map((a) => a.id));

  function setAreas(ids: string[], on: boolean) {
    const next = new Set(selected);
    for (const id of ids) {
      if (on) next.add(id);
      else next.delete(id);
    }
    onChange(next);
  }

  return (
    <section aria-labelledby="areas-heading" className="area-panel">
      <div className="area-panel-header flex items-center gap-2 px-3 py-2">
        <h2 id="areas-heading" className="area-panel-title flex-1">
          Areas
          <span className="muted type-tiny ml-2 tabular-nums">
            {selected.size} of {allAreaIds.length}
          </span>
        </h2>
        <Button variant="quiet" size="sm" className="h-7 px-2" onClick={() => onChange(new Set(allAreaIds))}>
          All
        </Button>
        <Button variant="quiet" size="sm" className="h-7 px-2" onClick={() => onChange(new Set())}>
          None
        </Button>
      </div>
      <div className="p-1.5">
        {areaGroups.map((group) =>
          group.areas.length === 1 ? (
            <AreaRow key={group.id} area={group.areas[0]} label={group.displayName} selected={selected} setAreas={setAreas} />
          ) : (
            <AreaGroupSection key={group.id} group={group} selected={selected} setAreas={setAreas} />
          )
        )}
      </div>
    </section>
  );
}

type SetAreas = (ids: string[], on: boolean) => void;

function AreaGroupSection({ group, selected, setAreas }: { group: AreaGroup; selected: Set<string>; setAreas: SetAreas }) {
  const ids = group.areas.map((a) => a.id);
  const count = ids.filter((id) => selected.has(id)).length;
  const all = count === ids.length;
  return (
    <div role="group" aria-labelledby={`area-group-${group.id}`} className="area-group">
      <div className="flex items-center gap-2.5 px-2 pt-2.5 pb-1">
        <Checkbox
          label={`All of ${group.displayName}`}
          checked={all}
          indeterminate={count > 0 && !all}
          onChange={() => setAreas(ids, !all)}
        />
        <span id={`area-group-${group.id}`} className="section-label">
          {group.displayName}
        </span>
      </div>
      <div className="area-group-items">
        {group.areas.map((area) => (
          <AreaRow key={area.id} area={area} label={area.displayName} selected={selected} setAreas={setAreas} />
        ))}
      </div>
    </div>
  );
}

function AreaRow({ area, label, selected, setAreas }: { area: Area; label: string; selected: Set<string>; setAreas: SetAreas }) {
  const [open, setOpen] = useState(false);
  const on = selected.has(area.id);
  const venuesId = `venues-${area.id}`;
  return (
    <div className="area-row">
      <div className="flex items-center gap-2.5 px-2">
        <Checkbox id={`area-${area.id}`} checked={on} onChange={() => setAreas([area.id], !on)} />
        <label htmlFor={`area-${area.id}`} className={cn("area-row-label flex-1 py-1.5 type-small", !on && "muted")}>
          {label}
        </label>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={venuesId}
          aria-label={`${open ? "Hide" : "Show"} venues for ${label}`}
          onClick={() => setOpen((o) => !o)}
          className="area-row-toggle inline-flex size-6 items-center justify-center"
        >
          <ChevronDown className={cn("unit-chevron size-3.5", !open && "unit-chevron-closed")} />
        </button>
      </div>
      <div id={venuesId} className="disclosure-body" data-open={open}>
        <ul className="area-venues min-h-0 overflow-hidden">
          {area.journals.map((j) => (
            <li key={j.displayName}>
              {j.url ? (
                <a href={j.url} target="_blank" rel="noopener noreferrer" className="site-link type-micro">
                  {j.displayName}
                </a>
              ) : (
                <span className="muted type-micro">{j.displayName}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
