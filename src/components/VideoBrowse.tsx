"use client";

import { useRef, useState } from "react";
import { videoBrowse, videos, type Video } from "@/data/content";
import { useMember } from "@/lib/member";
import { IconLock, IconPlay } from "./icons";
import { NetflixPlayer, SpeakerIcon } from "./NetflixPlayer";
import { MEDIA_TABS, Segmented } from "./Segmented";
import { useMemberGate } from "./useMemberGate";

const byId = (id: string) => videos.find((v) => v.id === id);

/* Netflix-style browse: a featured billboard that previews itself muted,
   then horizontally scrolling rows. Any title opens the full-screen player;
   RAW-only titles send guests to membership instead. */
export function VideoBrowse() {
  const member = useMember();
  const gate = useMemberGate();
  const [playing, setPlaying] = useState<Video | null>(null);
  const featured = byId(videoBrowse.featured) ?? videos[0];

  const watch = (v: Video) => {
    if (v.locked && !member) gate();
    else setPlaying(v);
  };

  return (
    <>
      <Billboard video={featured} onPlay={() => watch(featured)} />
      <div className="nrows">
        <div className="nrows__tabs">
          <Segmented label="Media" items={MEDIA_TABS} current="/videos/" />
        </div>
        {videoBrowse.rows.map((row) => (
          <Row
            key={row.title}
            title={row.title}
            items={row.ids.map(byId).filter((v): v is Video => !!v)}
            member={member}
            onPick={watch}
          />
        ))}
      </div>
      <NetflixPlayer video={playing} onClose={() => setPlaying(null)} />
    </>
  );
}

function Billboard({ video, onPlay }: { video: Video; onPlay: () => void }) {
  const [muted, setMuted] = useState(true);
  return (
    <section className="billboard" aria-labelledby="billboard-title">
      {video.src ? (
        <video className="billboard__media" src={video.src} poster={video.poster} autoPlay muted={muted} loop playsInline aria-hidden="true" />
      ) : (
        <img className="billboard__media" src={video.poster} alt="" />
      )}
      <div className="billboard__shade" />
      <div className="billboard__body">
        <span className="billboard__kicker">
          <b>RVC</b> Film
        </span>
        <h1 className="billboard__title" id="billboard-title">
          {video.title}
        </h1>
        <span className="billboard__meta">
          {video.meta} · {video.length}
        </span>
        <p className="billboard__desc">{video.desc}</p>
        <div className="billboard__actions">
          <button type="button" className="nbtn nbtn--play" onClick={onPlay}>
            <IconPlay size={18} />
            Play
          </button>
          {video.src && (
            <button
              type="button"
              className="nbtn nbtn--round"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute preview" : "Mute preview"}
            >
              <SpeakerIcon off={muted} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function Row({ title, items, member, onPick }: { title: string; items: Video[]; member: boolean; onPick: (v: Video) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };
  return (
    <section className="nrow" aria-label={title}>
      <h2 className="nrow__title">{title}</h2>
      <div className="nrow__wrap">
        <button type="button" className="nrow__arrow nrow__arrow--prev" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`}>
          ‹
        </button>
        <div className="nrow__track" ref={track}>
          {items.map((v) => {
            const locked = !!v.locked && !member;
            return (
              <button
                key={v.id}
                type="button"
                className={locked ? "ncard is-locked" : "ncard"}
                onClick={() => onPick(v)}
                aria-label={locked ? `Locked — RAW members only. ${v.title}` : `Play ${v.title}`}
              >
                <img src={v.poster} alt="" loading="lazy" />
                <span className="ncard__shade" />
                {v.locked && (
                  <span className="ncard__badge">
                    <IconLock size={12} /> RAW
                  </span>
                )}
                {!v.src && !locked && <span className="ncard__soon">Coming soon</span>}
                <span className="ncard__info">
                  <span className="ncard__title">{v.title}</span>
                  <span className="ncard__meta">
                    {v.length} · {v.meta}
                  </span>
                </span>
                <span className="ncard__play" aria-hidden="true">
                  <IconPlay size={14} />
                </span>
              </button>
            );
          })}
        </div>
        <button type="button" className="nrow__arrow nrow__arrow--next" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`}>
          ›
        </button>
      </div>
    </section>
  );
}
