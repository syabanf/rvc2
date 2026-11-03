"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { heroReel } from "@/data/content";
import { firstName, useProfile } from "@/lib/profile";
import { IconPlay } from "./icons";

const pad = (n: number) => String(n).padStart(2, "0");

/* Full-bleed home hero: the background follows the active show.
   Mouse: hover/focus switches, click opens. Touch: first tap switches,
   second tap opens. Only the active video plays. */
export function HeroReel() {
  const { items, tagline } = heroReel;
  const [active, setActive] = useState(0);
  const name = firstName(useProfile());
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    videos.current.forEach((v, i) => {
      if (!v) return;
      if (i === active && !still) v.play().catch(() => {});
      else v.pause();
    });
  }, [active]);

  const open = (e: MouseEvent, i: number) => {
    if (i !== active) {
      e.preventDefault();
      setActive(i);
    }
  };

  return (
    <section className="reel" aria-label="Featured shows">
      <div className="reel__media" aria-hidden="true">
        {items.map((it, i) => (
          <div key={it.title} className={i === active ? "reel__layer is-active" : "reel__layer"}>
            {it.video ? (
              <video
                ref={(el) => {
                  videos.current[i] = el;
                }}
                src={it.video}
                poster={it.img}
                muted
                loop
                playsInline
                preload={i === 0 ? "auto" : "none"}
              />
            ) : (
              it.img && <img src={it.img} alt="" loading={i === 0 ? "eager" : "lazy"} />
            )}
          </div>
        ))}
      </div>
      <div className="reel__shade" />

      <ol className="reel__list">
        {items.map((it, i) => (
          <li key={it.title}>
            <Link
              href={it.href}
              className="reel__item"
              aria-current={i === active ? "true" : undefined}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setActive(i);
              }}
              onFocus={(e) => {
                if (e.currentTarget.matches(":focus-visible")) setActive(i);
              }}
              onClick={(e) => open(e, i)}
            >
              <span className="reel__num">{pad(i + 1)}</span>
              <span className="reel__title">{it.title}</span>
              <span className="reel__meta">{it.meta}</span>
            </Link>
          </li>
        ))}
      </ol>

      <div className="reel__foot">
        <p className="reel__tagline">
          {name && <span className="reel__hello">Welcome back, {name}.</span>}
          {tagline}
        </p>
        <Link className="btn btn--primary" href="/videos/">
          <IconPlay />
          Watch the aftermovie
        </Link>
      </div>
    </section>
  );
}
