import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "raised" | "quiet" | "primary";
type Size = "sm" | "md" | "icon" | "icon-sm";

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-2.5 type-small",
  md: "h-9 gap-2 px-3",
  icon: "size-9",
  "icon-sm": "size-8",
};

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: Variant;
  size?: Size;
}

/** Thry's button: a raised, lit plate by default; quiet has no plate until hovered; primary fills with the accent. */
export function Button({ variant = "raised", size = "md", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      className={cn("button inline-flex shrink-0 items-center justify-center whitespace-nowrap", SIZES[size], className)}
      {...props}
    />
  );
}
