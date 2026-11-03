"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { IMG } from "@/data/content";
import { IconClose } from "./icons";

/* INTEGRATION: render the member's real entry QR (signed, per member). */
export function QrCode({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21" shapeRendering="crispEdges" aria-hidden="true">
      <path
        fill="#0A0A0A"
        d="M0 0h7v7H0zM1 1v5h5V1zM2 2h3v3H2zM14 0h7v7h-7zM15 1v5h5V1zM16 2h3v3h-3zM0 14h7v7H0zM1 15v5h5v-5zM2 16h3v3H2zM8 0h2v2H8zM11 1h2v3h-2zM8 3h2v3H8zM9 8h3v2H9zM14 8h2v2h-2zM17 8h4v2h-4zM8 11h2v2H8zM12 11h4v2h-4zM18 11h2v3h-2zM0 8h2v2H0zM3 8h3v2H3zM8 14h3v2H8zM12 14h2v3h-2zM15 15h2v2h-2zM18 15h3v2h-3zM8 18h2v3H8zM11 19h3v2h-3zM15 18h3v3h-3z"
      />
    </svg>
  );
}

type RawCardProps = {
  name: string;
  no: string;
  validTo: string;
  label: string;
  onClick?: () => void;
  preview?: boolean; // guest page: "your card" sample
};

/* The RAW member card as an object: tilts toward the pointer (or the phone's
   tilt where the browser allows it), with a holographic foil and glare that
   follow. Sways gently on its own when nobody is touching it. */
export function RawCard({ name, no, validTo, label, onClick, preview }: RawCardProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const set = (x: number, y: number) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", `${(0.5 - y) * 18}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 24}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.classList.add("is-tilting");
    set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  };
  const onLeave = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.classList.remove("is-tilting");
    set(0.5, 0.5);
  };

  // Phone tilt, where it needs no permission prompt (Android Chrome).
  useEffect(() => {
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      ref.current?.classList.add("is-tilting");
      set(Math.min(1, Math.max(0, 0.5 + e.gamma / 60)), Math.min(1, Math.max(0, 0.5 + (e.beta - 45) / 60)));
    };
    window.addEventListener("deviceorientation", onTilt);
    return () => window.removeEventListener("deviceorientation", onTilt);
  }, []);

  return (
    <div className="rawcard-stage">
      <button
        ref={ref}
        type="button"
        className={preview ? "rawcard is-preview" : "rawcard"}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onClick={onClick}
        aria-label={label}
      >
        <span className="rawcard__foil" aria-hidden="true" />
        <span className="rawcard__glare" aria-hidden="true" />
        <span className="rawcard__top">
          <span className="rawcard__raw">RAW</span>
          <img className="rawcard__logo" src={IMG.logoWhite} alt="" width={65} height={28} />
        </span>
        <span className="rawcard__chip" aria-hidden="true" />
        <span className="rawcard__bottom">
          <span>
            <span className="rawcard__name">{name}</span>
            <span className="rawcard__no">
              NO. {no} · VALID TO {validTo}
            </span>
          </span>
          <span className="rawcard__qr">
            <QrCode />
          </span>
        </span>
      </button>
    </div>
  );
}

/* Door mode: the entry QR big on white, for the scanner at the venue. */
export function QrFullscreen({
  open,
  onClose,
  name,
  no,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  no: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="qrfull" aria-label="Entry QR code" onClose={onClose}>
      <button type="button" className="qrfull__close" onClick={onClose} aria-label="Close">
        <IconClose size={22} />
      </button>
      <span className="qrfull__raw">RAW</span>
      <QrCode className="qrfull__qr" />
      <span className="qrfull__name">{name}</span>
      <span className="qrfull__no">NO. {no}</span>
      <span className="qrfull__hint">Show this at the door · turn your brightness up</span>
    </dialog>
  );
}
