"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type PointerEvent, type ReactNode } from "react";
import { Button } from "./Button";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** How far (px) or how fast (px/ms) a drag down the grip has to go to dismiss the sheet. */
const DISMISS_DISTANCE = 80;
const DISMISS_SPEED = 0.5;

/**
 * Thry's bottom drawer: a modal sheet on a native <dialog> (so focus is held
 * inside, Escape closes it, and the page behind is dimmed and inert). It slides
 * up from the bottom edge; dragging its grip down follows the pointer and
 * dismisses it past a threshold, and a tap on the backdrop closes it.
 */
export function Drawer({ open, onOpenChange, title, children, footer }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ startY: number; startT: number; dy: number } | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function onGripDown(e: PointerEvent<HTMLDivElement>) {
    drag.current = { startY: e.clientY, startT: e.timeStamp, dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    ref.current?.setAttribute("data-dragging", "");
  }
  function onGripMove(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.startY);
    ref.current?.style.setProperty("--drawer-drag-y", `${drag.current.dy}px`);
  }
  function onGripUp(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    drag.current = null;
    ref.current?.removeAttribute("data-dragging");
    ref.current?.style.removeProperty("--drawer-drag-y");
    if (!d) return;
    const speed = d.dy / Math.max(1, e.timeStamp - d.startT);
    if (d.dy > DISMISS_DISTANCE || speed > DISMISS_SPEED) onOpenChange(false);
  }

  return (
    <dialog
      ref={ref}
      data-side="bottom"
      aria-labelledby={titleId}
      onClose={() => onOpenChange(false)}
      // The dialog box is covered by its content, so a click that lands on the dialog itself is on the backdrop.
      onClick={(e) => e.target === e.currentTarget && onOpenChange(false)}
      className="drawer m-0 mt-auto w-full max-w-none p-0"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div
          className="drawer-grip flex shrink-0 touch-none justify-center pt-2.5 pb-1.5"
          onPointerDown={onGripDown}
          onPointerMove={onGripMove}
          onPointerUp={onGripUp}
          onPointerCancel={onGripUp}
        >
          <span aria-hidden className="drawer-handle h-1 w-10" />
        </div>
        <header className="drawer-header flex shrink-0 items-center justify-between gap-3 px-4 pb-2.5">
          <h2 id={titleId} className="dialog-title">
            {title}
          </h2>
          <Button variant="quiet" size="icon-sm" aria-label="Close" onClick={() => onOpenChange(false)}>
            <X className="size-4" />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">{children}</div>
        {footer && <footer className="drawer-footer shrink-0 px-4 py-3">{footer}</footer>}
      </div>
    </dialog>
  );
}
