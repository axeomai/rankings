"use client";

import { useState } from "react";
import { AREA_GROUPS } from "@physics/backend/src/lib/areas";

interface AreaSelectorProps {
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

export default function AreaSelector({ selected, onChange }: AreaSelectorProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const allAreaIds = AREA_GROUPS.flatMap((g) => g.areas.map((a) => a.id));
  const allSelected = allAreaIds.every((id) => selected.has(id));

  function toggleArea(areaId: string) {
    const next = new Set(selected);
    if (next.has(areaId)) next.delete(areaId); else next.add(areaId);
    onChange(next);
  }

  function toggleGroup(groupId: string) {
    const group = AREA_GROUPS.find((g) => g.id === groupId);
    if (!group) return;
    const ids = group.areas.map((a) => a.id);
    const allGroupSelected = ids.every((id) => selected.has(id));
    const next = new Set(selected);
    if (allGroupSelected) ids.forEach((id) => next.delete(id));
    else ids.forEach((id) => next.add(id));
    onChange(next);
  }

  function toggleAll() {
    onChange(allSelected ? new Set() : new Set(allAreaIds));
  }

  function toggleCollapse(groupId: string) {
    const next = new Set(collapsed);
    if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
    setCollapsed(next);
  }

  return (
    <div className="text-sm">
      <div className="mb-3 flex gap-2">
        <button onClick={toggleAll}
          className="rounded bg-violet-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-violet-700">
          {allSelected ? "None" : "All"}
        </button>
      </div>

      {AREA_GROUPS.map((group) => {
        const ids = group.areas.map((a) => a.id);
        const allGroupSelected = ids.every((id) => selected.has(id));
        const someGroupSelected = ids.some((id) => selected.has(id));
        const isCollapsed = collapsed.has(group.id);

        return (
          <div key={group.id} className="mb-2">
            <div className="flex items-center gap-1.5">
              <input type="checkbox" checked={allGroupSelected}
                ref={(el) => { if (el) el.indeterminate = !allGroupSelected && someGroupSelected; }}
                onChange={() => toggleGroup(group.id)}
                className="h-3.5 w-3.5 rounded accent-violet-600"
              />
              <button onClick={() => toggleCollapse(group.id)}
                className="flex items-center gap-1 font-semibold text-gray-800 hover:text-violet-700">
                <span className="text-xs text-gray-400">{isCollapsed ? "▶" : "▼"}</span>
                <span className="text-xs uppercase tracking-wide">{group.displayName}</span>
              </button>
            </div>
            {!isCollapsed && (
              <div className="ml-5 mt-1 space-y-0.5">
                {group.areas.map((area) => (
                  <div key={area.id} className="space-y-0.5">
                    <label className="flex cursor-pointer items-start gap-1.5">
                      <input type="checkbox" checked={selected.has(area.id)}
                        onChange={() => toggleArea(area.id)}
                        className="mt-0.5 h-3.5 w-3.5 rounded accent-violet-600"
                      />
                      <span className="text-gray-700">{area.displayName}</span>
                    </label>
                    <div className="ml-5 space-y-0.5">
                      {area.journals.map((j) => (
                        <div key={j.openalexId} className="text-xs text-gray-400">
                          {j.url ? (
                            <a href={j.url} target="_blank" rel="noopener noreferrer"
                              className="hover:text-violet-600 hover:underline">{j.displayName}</a>
                          ) : j.displayName}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
