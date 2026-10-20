"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Names the field for assistive technology when no visible label sits beside it. */
  label: string;
  placeholder?: string;
  className?: string;
  children: ReactNode;
}

/** Thry's select: a recessed field that opens the shared popover surface. */
export function Select({ value, onValueChange, label, placeholder, className, children }: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
      <RadixSelect.Trigger
        aria-label={label}
        className={cn("control select-trigger inline-flex h-8 min-w-0 items-center justify-between gap-2 px-2.5 type-small", className)}
      >
        <span className="select-value flex min-w-0 items-center">
          <RadixSelect.Value placeholder={placeholder} />
        </span>
        <RadixSelect.Icon asChild>
          <ChevronDown aria-hidden className="select-chevron size-3.5 shrink-0 muted" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className="select-content z-50 max-h-[min(24rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden"
        >
          <RadixSelect.ScrollUpButton className="select-scroll flex h-6 items-center justify-center">
            <ChevronUp className="size-3.5" />
          </RadixSelect.ScrollUpButton>
          <RadixSelect.Viewport className="p-1">{children}</RadixSelect.Viewport>
          <RadixSelect.ScrollDownButton className="select-scroll flex h-6 items-center justify-center">
            <ChevronDown className="size-3.5" />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

export function SelectItem({ value, children }: { value: string; children: ReactNode }) {
  return (
    <RadixSelect.Item value={value} className="select-item relative flex h-8 cursor-pointer select-none items-center">
      <RadixSelect.ItemText asChild>
        <span className="select-item-label flex min-w-0 items-center gap-2">{children}</span>
      </RadixSelect.ItemText>
      <RadixSelect.ItemIndicator className="select-item-check absolute flex items-center">
        <Check className="size-3.5" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}

export function SelectSeparator() {
  return <RadixSelect.Separator className="select-separator my-1" />;
}
