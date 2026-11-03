"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { albums, type Album } from "@/data/content";
import { MEDIA_TABS, Segmented } from "./Segmented";

const SLIDE_MS = 6500;

/* Photos, one album per show: a hero slider of the albums, then a filterable
   grid of album cards. Each album opens /photos/<event>/. */
export function PhotoAlbums() {
  const categories = ["All", ...Array.from(new Set(albums.map((a) => a.category)))];
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? albums : albums.filter((a) => a.category === cat);

  return (
    <>
      <HeroSlider />
      <div className="container albums">
        <div className="albums__bar">
          <Segmented label="Media" items={MEDIA_TABS} current="/photos/" />
          <div className="albums__filters" role="group" aria-label="Filter albums">
            {categories.map((c) => (
              <button key={c} type="button" className="albums__filter" aria-pressed={c === cat} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <AlbumGrid items={shown} />
      </div>
    </>
  );
}

function HeroSlider() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (n: number) => setI((n + albums.length) % albums.length);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setI((n) => (n + 1) % albums.length), SLIDE_MS);
    return () => clearTimeout(t);
  }, [i, paused]);

  const a = albums[i];
  return (
    <section
      className="aslider"
      aria-roledescription="carousel"
      aria-label="Featured albums"
      onPointerEnter={(e) => e.pointerType === "mouse" && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {albums.map((al, n) => (
        <img key={al.id} className={n === i ? "aslider__img is-active" : "aslider__img"} src={al.cover} alt="" aria-hidden="true" />
      ))}
      <div className="aslider__shade" />
      <div className="aslider__body" key={a.id}>
        <div className="aslider__left">
          <span className="eyebrow">
            {a.no} · {a.category} · {a.photos.length} photos
          </span>
          <h1 className="aslider__title">{a.name}</h1>
        </div>
        <div className="aslider__right">
          <Link className="apill" href={`/photos/${a.id}/`}>
            View album <span aria-hidden="true">→</span>
          </Link>
          <p>{a.desc}</p>
        </div>
      </div>
      <div className="aslider__nav">
        <button type="button" onClick={() => go(i - 1)} aria-label="Previous album">
          ‹
        </button>
        <span className="aslider__dots">
          {albums.map((al, n) => (
            <button key={al.id} type="button" className={n === i ? "is-active" : undefined} onClick={() => go(n)} aria-label={`Show ${al.name}`} aria-current={n === i} />
          ))}
        </span>
        <button type="button" onClick={() => go(i + 1)} aria-label="Next album">
          ›
        </button>
      </div>
    </section>
  );
}

export function AlbumGrid({ items }: { items: Album[] }) {
  return (
    <ul className="agrid">
      {items.map((a) => (
        <li key={a.id}>
          <Link className="acard" href={`/photos/${a.id}/`}>
            <span className="acard__media">
              <img src={a.cover} alt="" loading="lazy" />
              <span className="acard__shade" />
              <span className="acard__tags">
                <span>
                  {a.category} · {a.no}
                </span>
                <span>
                  {a.photos.length} photos · {a.year}
                </span>
              </span>
              <span className="acard__title">
                {a.name}
                <span className="acard__plus" aria-hidden="true">
                  +
                </span>
              </span>
            </span>
            <span className="acard__desc">{a.desc}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
