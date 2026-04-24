"use client";

import { useState } from "react";
import type { AreaGroup } from "@rankings/backend/src/lib/disciplines";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AreaSelectorProps {
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
  areaGroups: AreaGroup[];
}

export default function AreaSelector({ selected, onChange, areaGroups }: AreaSelectorProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const allAreaIds = areaGroups.flatMap((g) => g.areas.map((a) => a.id));

  function toggleArea(areaId: string) {
    const next = new Set(selected);
    if (next.has(areaId)) next.delete(areaId);
    else next.add(areaId);
    onChange(next);
  }

  function toggleGroup(groupId: string) {
    const group = areaGroups.find((g) => g.id === groupId);
    if (!group) return;
    const groupAreaIds = group.areas.map((a) => a.id);
    const allGroupSelected = groupAreaIds.every((id) => selected.has(id));
    const next = new Set(selected);
    if (allGroupSelected) {
      groupAreaIds.forEach((id) => next.delete(id));
    } else {
      groupAreaIds.forEach((id) => next.add(id));
    }
    onChange(next);
  }

  function toggleGroupOpen(groupId: string) {
    const next = new Set(openGroups);
    if (next.has(groupId)) next.delete(groupId);
    else next.add(groupId);
    setOpenGroups(next);
  }

  return (
    <div className="flex max-h-[60vh] flex-col">
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="text-xs font-medium">Research Areas</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="xs"
            className="h-6 text-xs"
            onClick={() => onChange(new Set(allAreaIds))}
          >
            All
          </Button>
          <Button
            variant="ghost"
            size="xs"
            className="h-6 text-xs"
            onClick={() => onChange(new Set())}
          >
            None
          </Button>
        </div>
      </div>
      <Separator />
      <div className="overflow-y-auto py-1 text-sm">
        {areaGroups.map((group) => {
          const groupAreaIds = group.areas.map((a) => a.id);
          const allGroupSelected = groupAreaIds.every((id) => selected.has(id));
          const someGroupSelected =
            !allGroupSelected && groupAreaIds.some((id) => selected.has(id));
          const isOpen = openGroups.has(group.id);
          const isSingleArea = group.areas.length === 1;

          if (isSingleArea) {
            const area = group.areas[0];
            return (
              <Collapsible
                key={group.id}
                open={isOpen}
                onOpenChange={() => toggleGroupOpen(group.id)}
              >
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <Checkbox
                    checked={allGroupSelected}
                    onCheckedChange={() => toggleGroup(group.id)}
                  />
                  <CollapsibleTrigger className="flex flex-1 items-center gap-1 text-left text-sm font-medium hover:text-foreground">
                    <ChevronRight
                      className={cn(
                        "size-3 text-muted-foreground transition-transform",
                        isOpen && "rotate-90"
                      )}
                    />
                    {group.displayName}
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  <div className="mt-0.5 mb-1 ml-12 font-mono text-[10px] text-muted-foreground/70">
                    {area.journals.map((j) => j.displayName).join(" · ")}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <Collapsible
              key={group.id}
              open={isOpen}
              onOpenChange={() => toggleGroupOpen(group.id)}
            >
              <div className="flex items-center gap-2 px-3 py-1.5">
                <Checkbox
                  checked={allGroupSelected}
                  indeterminate={someGroupSelected}
                  onCheckedChange={() => toggleGroup(group.id)}
                />
                <CollapsibleTrigger className="flex flex-1 items-center gap-1 text-left text-sm font-medium hover:text-foreground">
                  <ChevronRight
                    className={cn(
                      "size-3 text-muted-foreground transition-transform",
                      isOpen && "rotate-90"
                    )}
                  />
                  {group.displayName}
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent>
                <div className="pb-1">
                  {group.areas.map((area) => (
                    <div key={area.id} className="px-3 py-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3" />
                        <Checkbox
                          checked={selected.has(area.id)}
                          onCheckedChange={() => toggleArea(area.id)}
                        />
                        <button
                          type="button"
                          onClick={() => toggleArea(area.id)}
                          className="flex-1 text-left text-sm text-foreground/90 hover:text-foreground"
                        >
                          {area.displayName}
                        </button>
                      </div>
                      <div className="mt-0.5 ml-7 font-mono text-[10px] text-muted-foreground/70">
                        {area.journals.map((j) => j.displayName).join(" · ")}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
