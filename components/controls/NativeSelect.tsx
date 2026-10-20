import { ChevronDown } from "lucide-react";
import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

/**
 * The platform's own select drawn as a Thry field. Used inside the mobile
 * drawer, where the phone's picker is the better control and a portalled list
 * would land behind the modal sheet.
 */
export function NativeSelect({ className, children, ...props }: ComponentPropsWithRef<"select">) {
  return (
    <span className={cn("relative inline-flex min-w-0", className)}>
      <select className="control native-select h-9 w-full min-w-0 pl-2.5 pr-8 type-base" {...props}>
        {children}
      </select>
      <ChevronDown aria-hidden className="muted pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
    </span>
  );
}
