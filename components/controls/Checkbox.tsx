"use client";

import { Check, Minus } from "lucide-react";
import { useEffect, useRef } from "react";

interface CheckboxProps {
  checked: boolean;
  /** Some but not all of what this box stands for is checked. */
  indeterminate?: boolean;
  onChange: () => void;
  /** With `id`, a visible <label htmlFor> names the box; without one, `label` does. */
  id?: string;
  label?: string;
}

/** Thry's checkbox: a native input (so it keeps keyboard and form behavior) drawn as a recessed well that fills with the ink when checked. */
export function Checkbox({ checked, indeterminate = false, onChange, id, label }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const on = checked || indeterminate;
  return (
    <span className="relative inline-flex size-4 shrink-0">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        aria-label={id ? undefined : label}
        checked={checked}
        onChange={onChange}
        className="checkbox-input absolute inset-0 m-0 cursor-pointer opacity-0"
      />
      <span aria-hidden data-checked={on ? "" : undefined} className="checkbox pointer-events-none inline-flex size-4 items-center justify-center">
        {checked ? <Check className="size-3" strokeWidth={3} /> : indeterminate ? <Minus className="size-3" strokeWidth={3} /> : null}
      </span>
    </span>
  );
}
