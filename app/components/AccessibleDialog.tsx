"use client";

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";

interface AccessibleDialogProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function AccessibleDialog({
  open,
  title,
  description,
  children,
  onClose,
}: AccessibleDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      requestAnimationFrame(() => {
        dialog.querySelector<HTMLElement>("[data-dialog-initial]")?.focus();
      });
    } else if (!open && dialog.open) {
      dialog.close();
      returnFocusRef.current?.focus();
    }
  }, [open]);

  function trapFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>(focusableSelector)];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="app-dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={trapFocus}
    >
      <div className="dialog-paper">
        <div className="dialog-heading">
          <h2 id={titleId}>{title}</h2>
          <button data-dialog-initial className="icon-button" type="button" onClick={onClose} aria-label="닫기">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        {description ? <p id={descriptionId} className="dialog-description">{description}</p> : null}
        {children}
      </div>
    </dialog>
  );
}
