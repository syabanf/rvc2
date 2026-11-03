"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { IconClose, IconDownload, IconPause, IconPlay } from "./icons";

export type Slide = { src: string; label: string };

type StoryViewerProps = {
  slides: Slide[];
  title: string;
  meta?: string;
  /* Index to open at; null = closed. */
  start: number | null;
  onClose: () => void;
};

const DURATION = 5000; // ms per photo
const HOLD_MS = 220; // press longer than this = pause, shorter = tap

/* Full-screen album that plays itself, Instagram-story style:
   segmented progress bar, tap left/right to step, hold to pause,
   swipe down / Esc to close, slow Ken Burns zoom on each photo. */
export function StoryViewer({ slides, title, meta, start, onClose }: StoryViewerProps) {
  const open = start !== null;
  const dlgRef = useRef<HTMLDialogElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const elapsed = useRef(0);
  const loaded = useRef(false);
  const press = useRef<{ x: number; y: number; t: number; timer?: ReturnType<typeof setTimeout> } | null>(null);
  const [openedAt, setOpenedAt] = useState<number | null>(null);

  // Sync the opening index during render (no effect needed).
  if (open && start !== openedAt) {
    setOpenedAt(start);
    setIndex(start);
    setPaused(false);
  }
  if (!open && openedAt !== null) setOpenedAt(null);

  const stopped = paused || held;
  const slide = slides[index];

  const go = useCallback(
    (to: number) => {
      if (to < 0) to = 0;
      if (to >= slides.length) {
        onClose();
        return;
      }
      setIndex(to);
    },
    [slides.length, onClose],
  );

  // Open / close the native dialog and lock page scroll behind it.
  useEffect(() => {
    const dlg = dlgRef.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // The timer reads pause state through a ref so pausing doesn't restart it.
  const stoppedRef = useRef(stopped);
  useEffect(() => {
    stoppedRef.current = stopped;
  }, [stopped]);

  // Progress timer for the current slide; waits for the image to load.
  useEffect(() => {
    if (!open) return;
    elapsed.current = 0;
    loaded.current = !!imgRef.current?.complete;
    fillRef.current?.style.setProperty("--p", "0");
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!stoppedRef.current && loaded.current && !document.hidden) elapsed.current += dt;
      const p = Math.min(1, elapsed.current / DURATION);
      fillRef.current?.style.setProperty("--p", String(p));
      if (p >= 1) {
        go(index + 1);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, index, go]);

  // Keyboard: ← → step, space pauses (Esc is handled by <dialog>).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, go]);

  // Preload the next photo so steps feel instant.
  useEffect(() => {
    const next = slides[index + 1];
    if (open && next) new Image().src = next.src;
  }, [open, index, slides]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const timer = setTimeout(() => setHeld(true), HOLD_MS);
    press.current = { x: e.clientX, y: e.clientY, t: performance.now(), timer };
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    press.current = null;
    if (!p) return;
    clearTimeout(p.timer);
    const wasHold = performance.now() - p.t >= HOLD_MS;
    setHeld(false);
    if (e.clientY - p.y > 80) return onClose(); // swipe down
    if (wasHold) return;
    const third = e.currentTarget.getBoundingClientRect().width / 3;
    go(e.clientX < third ? index - 1 : index + 1);
  };
  const onPointerCancel = () => {
    if (press.current) clearTimeout(press.current.timer);
    press.current = null;
    setHeld(false);
  };

  return (
    <dialog ref={dlgRef} className={stopped ? "story is-paused" : "story"} aria-label={`${title} — album`} onClose={onClose}>
      {open && slide && (
        <>
          <img className="story__backdrop" src={slide.src} alt="" aria-hidden="true" />

          <div
            className="story__stage"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onContextMenu={(e) => e.preventDefault()}
          >
            <img
              key={index}
              ref={imgRef}
              className="story__img"
              src={slide.src}
              alt={slide.label}
              draggable={false}
              onLoad={() => {
                loaded.current = true;
              }}
            />
          </div>

          <div className="story__top">
            <div className="story__bars" aria-hidden="true">
              {slides.map((s, i) => (
                <span key={s.src + i} className="story__bar">
                  <span
                    ref={i === index ? fillRef : undefined}
                    className="story__fill"
                    style={{ ["--p" as string]: i < index ? 1 : 0 }}
                  />
                </span>
              ))}
            </div>
            <div className="story__head">
              <div className="story__meta">
                <span className="story__title">{title}</span>
                <span className="story__sub">
                  {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                  {meta ? ` · ${meta}` : ""}
                </span>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              >
                {paused ? <IconPlay size={16} /> : <IconPause size={18} />}
              </button>
              <a className="icon-btn" href={slide.src} download aria-label="Download photo">
                <IconDownload size={20} />
              </a>
              <button type="button" className="icon-btn" onClick={onClose} aria-label="Close album">
                <IconClose size={22} />
              </button>
            </div>
          </div>

          <button type="button" className="story__nav story__nav--prev" onClick={() => go(index - 1)} aria-label="Previous photo" disabled={index === 0}>
            ‹
          </button>
          <button type="button" className="story__nav story__nav--next" onClick={() => go(index + 1)} aria-label="Next photo">
            ›
          </button>
          <p className="story__caption">{slide.label}</p>
        </>
      )}
    </dialog>
  );
}
