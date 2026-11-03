"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { usePlatform } from "@/lib/platform";
import { IconClose } from "./icons";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  /* Accessible name when the sheet has no visible title. */
  label?: string;
  children: ReactNode;
};

/* Bottom sheet on a native <dialog>: modal, focus-trapped, Esc to close.
   iOS gets a "Cancel" text button; Android and the web get a close icon. */
export function Sheet({ open, onClose, title, label, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const platform = usePlatform();

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    else if (!open && dlg.open) dlg.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : label}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet__handle" aria-hidden="true" />
      {title &&
        (platform === "ios" ? (
          <div className="sheet__head">
            <button type="button" className="text-btn" onClick={onClose}>
              Cancel
            </button>
            <h2 className="sheet__title" id={titleId}>
              {title}
            </h2>
            <span style={{ width: 56 }} />
          </div>
        ) : (
          <div className="sheet__head">
            <h2 className="sheet__title" id={titleId}>
              {title}
            </h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <IconClose size={20} />
            </button>
          </div>
        ))}
      <div className="sheet__body">{children}</div>
    </dialog>
  );
}
