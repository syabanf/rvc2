"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { events, eventsAbout, pastMedia, photos, type RvcEvent } from "@/data/content";
import { useMember } from "@/lib/member";
import { Countdown } from "./Countdown";
import { IconArrowLong, IconClose, IconLock, IconPlay } from "./icons";
import { NetflixPlayer } from "./NetflixPlayer";
import { StoryViewer } from "./StoryViewer";
import { useMemberGate } from "./useMemberGate";

/* Events, upcoming and past in one place.
   1. Tall poster cards in a horizontal row (upcoming first): date figure,
      Upcoming / Past badge, vertical title. Hover lifts a card and plays its
      preview; click morphs it into a wide banner (View Transitions) with the
      description and the event's photos and videos below.
   2. About Raw Vision nights.
   3. Photos and videos from past shows in a self-moving mosaic marquee
      (3 rows, mixed tile sizes) that pauses on hover and can be dragged,
      wheeled or stepped. Photos open the album, videos the player. */

const SPEED = 28; // px per second of auto-scroll
const DRAG_SLOP = 6;

// Tile placements repeat every 6 cells: [colStart, colSpan, rowStart, rowSpan].
const PATTERN: [number, number, number, number][] = [
  [0, 2, 1, 2], [0, 2, 3, 1], // 2×2 then 2×1 under it
  [2, 1, 1, 1], [2, 1, 2, 2], // 1×1 then 1×2
  [3, 2, 1, 1], [3, 2, 2, 2], // 2×1 then 2×2
  [5, 1, 1, 2], [5, 1, 3, 1], // 1×2 then 1×1
];
const PATTERN_COLS = 6;

// Two passes over the media make one seamless set.
const SET = [...pastMedia, ...pastMedia];
const SET_COLS = Math.ceil(SET.length / PATTERN.length) * PATTERN_COLS;

function placement(n: number, copy: number) {
  const [c, cs, r, rs] = PATTERN[n % PATTERN.length];
  const col = copy * SET_COLS + Math.floor(n / PATTERN.length) * PATTERN_COLS + c + 1;
  return { gridColumn: `${col} / span ${cs}`, gridRow: `${r} / span ${rs}` };
}

const photosFor = (e: RvcEvent) => [
  ...photos.filter((p) => p.show === e.show).map((p) => ({ src: p.src, label: p.label, locked: !!p.locked })),
  ...(e.extraPhotos ?? []).map((src, i) => ({ src, label: `${e.name} — ${i + 1}`, locked: false })),
];

type Media = { src: string; label: string; locked: boolean; video?: string };

// Everything we have for one event: its photos, then any videos/posters from past shows.
const mediaFor = (e: RvcEvent): Media[] => [
  ...pastMedia.filter((m) => m.event === e.id && m.video).map((m) => ({ src: m.src, label: m.label, locked: false, video: m.video })),
  ...photosFor(e),
  ...pastMedia
    .filter((m) => m.event === e.id && !m.video && !photos.some((p) => p.src === m.src && p.show === e.show))
    .map((m) => ({ src: m.src, label: m.label, locked: false })),
];

const HERO = "event-hero"; // view-transition-name shared by a card and the open banner

/* Card ⇄ banner morph via the View Transitions API (instant where unsupported). */
function morph(update: () => void) {
  type Transition = { ready: Promise<void>; finished: Promise<void>; updateCallbackDone: Promise<void> };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => Transition };
  if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const t = doc.startViewTransition(() => flushSync(update));
    // A newer transition (fast clicks, back button) skips this one; that's fine.
    const ignore = () => {};
    t.ready.catch(ignore);
    t.finished.catch(ignore);
    t.updateCallbackDone.catch(ignore);
  } else update();
}

export function EventGallery() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | null>(null); // card the banner shrinks back into
  const [album, setAlbum] = useState<{ slides: Media[]; start: number; title: string } | null>(null);
  const [film, setFilm] = useState<Media | null>(null);
  const pushed = useRef(false);
  const ev = events.find((e) => e.id === openId) ?? null;

  // Deep links (/events/?e=<id>) and the browser back button.
  useEffect(() => {
    const sync = () => {
      const id = new URLSearchParams(location.search).get("e");
      const next = id && events.some((e) => e.id === id) ? id : null;
      morph(() => {
        setOpenId(next);
        if (next) setLastId(next);
      });
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const open = (id: string) => {
    history.pushState(null, "", `?e=${id}`);
    pushed.current = true;
    morph(() => {
      setLastId(id);
      setOpenId(id);
      window.scrollTo(0, 0);
    });
  };
  const close = () => {
    if (pushed.current) {
      pushed.current = false;
      history.back(); // popstate morphs the banner back into its card
    } else {
      history.replaceState(null, "", location.pathname);
      morph(() => setOpenId(null));
    }
  };

  const openMedia = (list: Media[], i: number, title: string) => {
    const m = list[i];
    if (m.video) setFilm(m);
    else {
      const stills = list.filter((x) => !x.video);
      setAlbum({ slides: stills, start: stills.indexOf(m), title });
    }
  };

  return (
    <>
      {ev ? (
        <EventDetail ev={ev} onClose={close} onMedia={openMedia} />
      ) : (
        <>
          <EventCards onOpen={open} morphId={lastId} />
          <div className="container">
            <section className="events-about" aria-labelledby="events-about-title">
              <h2 id="events-about-title">{eventsAbout.title}</h2>
              {eventsAbout.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </section>
            <div className="section-label">
              <span>From past shows</span>
              <span>Photos & videos</span>
            </div>
          </div>
          <Marquee
            onPick={(i) => {
              const all = pastMedia.map((m) => ({ src: m.src, label: m.label, locked: false, video: m.video }));
              openMedia(all, i, "From past shows");
            }}
          />
        </>
      )}
      <StoryViewer
        slides={(album?.slides ?? []).map((s) => ({ src: s.src, label: s.label }))}
        title={album?.title ?? ""}
        start={album ? album.start : null}
        onClose={() => setAlbum(null)}
      />
      <NetflixPlayer
        video={
          film && {
            id: film.video ?? film.src,
            title: film.label,
            meta: ev?.date ?? "",
            desc: "",
            poster: film.src,
            src: film.video ?? "",
            length: "",
          }
        }
        onClose={() => setFilm(null)}
      />
    </>
  );
}

/* The card face, shared by the row of cards and the open banner. */
function Face({ ev }: { ev: RvcEvent }) {
  const upcoming = ev.status === "upcoming";
  return (
    <>
      <span className="ecard__shade" />
      <span className="ecard__top">
        <span className="ecard__badge">{upcoming ? "Upcoming" : "Past event"}</span>
        <span className="ecard__when">{ev.when}</span>
        <span className={ev.big.length > 3 ? "ecard__big is-long" : "ecard__big"}>{ev.big}</span>
      </span>
      <span className="ecard__foot">
        <span className="ecard__date">{ev.date}</span>
        <span className="ecard__venue">{ev.venue}</span>
      </span>
    </>
  );
}

/* Tall poster cards, one per event, scrolled sideways (native scroll + ‹ ›).
   Hover lifts a card and plays its preview; click morphs it into the banner. */
function EventCards({ onOpen, morphId }: { onOpen: (id: string) => void; morphId: string | null }) {
  const track = useRef<HTMLDivElement>(null);

  // Coming back from an event: make sure its card is in view for the morph.
  useEffect(() => {
    if (!morphId) return;
    const card = track.current?.querySelector<HTMLElement>(`[data-event-card="${morphId}"]`);
    if (card && track.current) track.current.scrollLeft = card.offsetLeft - 16;
  }, [morphId]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (el && card) el.scrollBy({ left: dir * card.offsetWidth, behavior: "smooth" });
  };
  const preview = (card: HTMLElement, on: boolean) => {
    const v = card.querySelector("video");
    if (!v) return;
    if (on) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <section className="ecards" aria-label="Events">
      <div className="ecards__track" ref={track}>
        {events.map((ev) => {
          const upcoming = ev.status === "upcoming";
          return (
            <button
              key={ev.id}
              type="button"
              className={upcoming ? "ecard is-upcoming" : "ecard"}
              data-event-card={ev.id}
              style={ev.id === morphId ? { viewTransitionName: HERO } : undefined}
              onClick={() => onOpen(ev.id)}
              onPointerEnter={(e) => e.pointerType === "mouse" && preview(e.currentTarget, true)}
              onPointerLeave={(e) => preview(e.currentTarget, false)}
              aria-label={`${ev.name}, ${ev.date} — ${upcoming ? "upcoming" : "past event"}`}
            >
              <img src={ev.cover} alt="" loading="eager" draggable={false} />
              {ev.heroVideo && <video src={ev.heroVideo} poster={ev.cover} muted loop playsInline preload="none" />}
              <Face ev={ev} />
              <span className="ecard__name">{ev.name}</span>
            </button>
          );
        })}
      </div>
      <button type="button" className="egal__arrow egal__arrow--prev" onClick={() => step(-1)} aria-label="Previous events">
        <IconArrowLong dir={-1} />
      </button>
      <button type="button" className="egal__arrow egal__arrow--next" onClick={() => step(1)} aria-label="Next events">
        <IconArrowLong />
      </button>
    </section>
  );
}

/* The open event: the card grown into a wide banner, then the story and media. */
function EventDetail({
  ev,
  onClose,
  onMedia,
}: {
  ev: RvcEvent;
  onClose: () => void;
  onMedia: (list: Media[], i: number, title: string) => void;
}) {
  const member = useMember();
  const gate = useMemberGate();
  const media = mediaFor(ev);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("dialog[open], .nplayer")) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <article className="edetail" aria-labelledby="edetail-title">
      <div className={ev.status === "upcoming" ? "edetail__hero ecard is-upcoming" : "edetail__hero ecard"} style={{ viewTransitionName: HERO }}>
        <img src={ev.cover} alt="" />
        {ev.heroVideo && <video src={ev.heroVideo} poster={ev.cover} muted loop playsInline autoPlay />}
        <Face ev={ev} />
        <button type="button" className="edetail__close" onClick={onClose} aria-label="Close event">
          <IconClose size={18} />
        </button>
      </div>

      <div className="container edetail__body">
        <h1 className="edetail__title" id="edetail-title">
          {ev.name}
        </h1>
        <p className="edetail__desc">{ev.desc}</p>
        {ev.status === "upcoming" && ev.startsAt && <Countdown to={ev.startsAt} label="Time until doors open" />}
        {ev.cta && (
          <div className="elb__actions">
            <Link className="btn btn--primary" href={ev.cta.href}>
              {ev.cta.label}
            </Link>
          </div>
        )}

        <div className="section-label">
          <span>Photos & videos</span>
          <span>{media.length ? `${media.length} from this night` : "After the show"}</span>
        </div>
        {media.length ? (
          <div className="elb__photos">
            {media.map((m, i) => {
              const locked = m.locked && !member;
              return (
                <button
                  key={m.src + i}
                  type="button"
                  className={locked ? "elb__photo is-locked" : m.video ? "elb__photo is-video" : "elb__photo"}
                  onClick={() => (locked ? gate() : onMedia(media.filter((x) => member || !x.locked), media.filter((x) => member || !x.locked).indexOf(m), ev.name))}
                  aria-label={locked ? `Locked — RAW members only. ${m.label}` : `${m.video ? "Play video" : "View photo"}: ${m.label}`}
                >
                  {m.video ? <video src={m.video} poster={m.src} muted loop playsInline autoPlay /> : <img src={m.src} alt="" loading="lazy" />}
                  {m.video && (
                    <span className="egal__play" aria-hidden="true">
                      <IconPlay size={12} />
                    </span>
                  )}
                  {locked && (
                    <span className="elb__lock">
                      <IconLock size={14} /> RAW
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="empty" style={{ padding: "24px 0" }}>
            Photos and videos from this night land here after the show.
          </p>
        )}

        <button type="button" className="edetail__next" onClick={onClose}>
          <span className="eyebrow">Back to all events</span>
        </button>
      </div>
    </article>
  );
}

function Marquee({ onPick }: { onPick: (i: number) => void }) {
  const viewRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const vel = useRef(0);
  const target = useRef<number | null>(null); // arrow-button tween target
  const hover = useRef(false);
  const drag = useRef<{ id: number; sx: number; lx: number; lt: number; moved: boolean } | null>(null);

  useEffect(() => {
    const strip = stripRef.current;
    const view = viewRef.current;
    if (!strip || !view) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let setW = strip.scrollWidth / 2;
    const measure = () => {
      setW = strip.scrollWidth / 2;
    };
    window.addEventListener("resize", measure);
    let last = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      if (!drag.current) {
        if (target.current !== null) {
          const d = target.current - x.current;
          x.current += d * 0.14;
          if (Math.abs(d) < 0.5) target.current = null;
        } else {
          x.current += vel.current;
          vel.current *= 0.92;
          if (!hover.current && !still && Math.abs(vel.current) < 0.5) x.current -= SPEED * dt;
        }
      }
      const wrapped = ((x.current % setW) + setW) % setW;
      strip.style.transform = `translate3d(${wrapped - setW}px, 0, 0)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Horizontal wheel / trackpad only, so vertical page scrolling still works.
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      target.current = null;
      x.current -= e.deltaX;
    };
    view.addEventListener("wheel", onWheel, { passive: false });

    // Only decode the video tiles that are actually on screen.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting && !still) v.play().catch(() => {});
          else v.pause();
        }
      },
      { root: view, threshold: 0.1 },
    );
    strip.querySelectorAll("video").forEach((v) => io.observe(v));
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      view.removeEventListener("wheel", onWheel);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const cell = (stripRef.current?.firstElementChild as HTMLElement | null)?.offsetHeight ?? 160;
    target.current = (target.current ?? x.current) - dir * cell * 3;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    target.current = null;
    vel.current = 0;
    drag.current = { id: e.pointerId, sx: e.clientX, lx: e.clientX, lt: performance.now(), moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved && Math.abs(e.clientX - d.sx) > DRAG_SLOP) {
      d.moved = true;
      viewRef.current?.setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    const now = performance.now();
    const dx = e.clientX - d.lx;
    x.current += dx;
    vel.current = (dx / Math.max(1, now - d.lt)) * 16;
    d.lx = e.clientX;
    d.lt = now;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved) return;
    const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-media]");
    if (tile) onPick(Number(tile.dataset.media));
  };

  return (
    <div className="egal">
      <div
        ref={viewRef}
        className="egal__view"
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") hover.current = true;
        }}
        onPointerLeave={() => (hover.current = false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
      >
        <div ref={stripRef} className="egal__strip" >
          {[0, 1].map((copy) =>
            SET.map((m, n) => {
              const i = n % pastMedia.length;
              const first = copy === 0 && n < pastMedia.length;
              const ev = events.find((e) => e.id === m.event);
              return (
                <button
                  key={`${copy}-${n}`}
                  type="button"
                  className={m.video ? "egal__tile is-video" : "egal__tile"}
                  data-media={i}
                  style={placement(n, copy)}
                  tabIndex={first ? 0 : -1}
                  aria-hidden={first ? undefined : true}
                  aria-label={`${m.video ? "Play video" : "View photo"}: ${m.label}`}
                  onKeyDown={(k) => {
                    if (k.key === "Enter" || k.key === " ") {
                      k.preventDefault();
                      onPick(i);
                    }
                  }}
                >
                  {m.video ? (
                    <video src={m.video} poster={m.src} muted loop playsInline preload="metadata" />
                  ) : (
                    <img src={m.src} alt="" loading="lazy" draggable={false} />
                  )}
                  <span className="egal__shade" />
                  {ev && <span className="egal__tag">{ev.tag}</span>}
                  {m.video && (
                    <span className="egal__play" aria-hidden="true">
                      <IconPlay size={12} />
                    </span>
                  )}
                  <span className="egal__info">
                    <span className="egal__name">{m.label}</span>
                  </span>
                </button>
              );
            }),
          )}
        </div>
      </div>
      <button type="button" className="egal__arrow egal__arrow--prev" onClick={() => step(-1)} aria-label="Previous events">
        <IconArrowLong dir={-1} />
      </button>
      <button type="button" className="egal__arrow egal__arrow--next" onClick={() => step(1)} aria-label="Next events">
        <IconArrowLong />
      </button>
    </div>
  );
}
