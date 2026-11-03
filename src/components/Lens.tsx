"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

/* A circular "lens" that follows the pointer and shows the alternate
   version of its content underneath (same layout, different words).
   Touch: the lens follows the finger while pressed; at rest it sits still
   so the effect is still visible. */
export function RevealLens({ children, alt, className }: { children: ReactNode; alt: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const place = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--lx", `${e.clientX - r.left}px`);
    el.style.setProperty("--ly", `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      className={className ? `lens ${className}` : "lens"}
      onPointerMove={place}
      onPointerEnter={(e) => {
        place(e);
        e.currentTarget.classList.add("is-on");
      }}
      onPointerDown={(e) => {
        place(e);
        e.currentTarget.classList.add("is-on");
      }}
      onPointerLeave={(e) => e.currentTarget.classList.remove("is-on")}
      onPointerUp={(e) => {
        if (e.pointerType !== "mouse") e.currentTarget.classList.remove("is-on");
      }}
      onPointerCancel={(e) => e.currentTarget.classList.remove("is-on")}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="lens__base">{children}</div>
      <div className="lens__alt" aria-hidden="true">
        {alt}
      </div>
    </div>
  );
}

export type WordPart = { text: string; hot?: boolean };

/* A sentence whose words light up one by one as it scrolls through the view. */
export function ScrollWords({ parts, className }: { parts: WordPart[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = parts.flatMap((p) =>
    p.text
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => ({ w, hot: !!p.hot })),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-w]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spans.forEach((s) => s.classList.add("is-lit"));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.55)));
      const lit = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle("is-lit", i < lit));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [words.length]);

  return (
    <p ref={ref} className={className ? `swords ${className}` : "swords"}>
      {words.map((x, i) => (
        <span key={i} data-w="" className={x.hot ? "is-hot" : undefined}>
          {x.w}{" "}
        </span>
      ))}
    </p>
  );
}

/* Small dot that trails the mouse (desktop only), like the reference. */
export function CursorDot() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const dot = ref.current;
    if (!dot || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;
    const onMove = (e: globalThis.PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.classList.add("is-on");
    };
    const frame = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(frame);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return <span ref={ref} className="cursordot" aria-hidden="true" />;
}
