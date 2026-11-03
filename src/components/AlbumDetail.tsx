"use client";

import Link from "next/link";
import { useState } from "react";
import { albums, type Album } from "@/data/content";
import { useMember } from "@/lib/member";
import { AlbumGrid } from "./PhotoAlbums";
import { IconDownload, IconLock, IconPlay } from "./icons";
import { StoryViewer } from "./StoryViewer";
import { useMemberGate } from "./useMemberGate";

/* One show's album: hero, story + facts, every photo (play as a slideshow,
   download, member-locked shots), then related albums. */
export function AlbumDetail({ album }: { album: Album }) {
  const member = useMember();
  const gate = useMemberGate();
  const [at, setAt] = useState<number | null>(null);
  const open = album.photos.filter((p) => member || !p.locked);
  const locked = album.photos.length - open.length;
  const related = albums.filter((a) => a.id !== album.id);

  return (
    <>
      <section className="ahero" aria-labelledby="album-title">
        <img className="ahero__img" src={album.cover} alt="" />
        <div className="ahero__shade" />
        <div className="ahero__body">
          <Link className="ahero__back" href="/photos/">
            <span aria-hidden="true">←</span> All albums
          </Link>
          <div className="ahero__row">
            <h1 className="ahero__title" id="album-title">
              {album.name}
            </h1>
            {open.length > 0 && (
              <button type="button" className="apill" onClick={() => setAt(0)}>
                Play album <span aria-hidden="true">→</span>
              </button>
            )}
          </div>
          <span className="ahero__meta">
            <span>{album.photos.length} photos</span>
            <span>{album.no}</span>
            <span>{album.year}</span>
          </span>
        </div>
      </section>

      <div className="container">
        <div className="ainfo">
          <p className="ainfo__desc">{album.desc}</p>
          <dl className="ainfo__facts">
            <div>
              <dt>Venue</dt>
              <dd>{album.venue}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{album.date}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{album.category}</dd>
            </div>
            <div>
              <dt>Shot by</dt>
              <dd>The RVC crew</dd>
            </div>
          </dl>
        </div>

        <div className="section-label">
          <span>Photos</span>
          <span>{locked > 0 ? `${locked} RAW-only` : "All open"}</span>
        </div>
        {album.photos.length ? (
          <ul className="aphotos">
            {album.photos.map((p, i) => {
              const isLocked = !!p.locked && !member;
              return (
                <li key={p.src + i} className={i % 5 === 0 ? "is-wide" : undefined}>
                  <button
                    type="button"
                    className={isLocked ? "aphoto is-locked" : "aphoto"}
                    onClick={() => (isLocked ? gate() : setAt(open.indexOf(p)))}
                    aria-label={isLocked ? `Locked — RAW members only. ${p.label}` : `View ${p.label}`}
                  >
                    <img src={p.src} alt="" loading="lazy" style={{ objectPosition: p.position }} />
                    {isLocked ? (
                      <span className="aphoto__lock">
                        <IconLock size={16} /> RAW
                      </span>
                    ) : (
                      <span className="aphoto__play" aria-hidden="true">
                        <IconPlay size={12} />
                      </span>
                    )}
                  </button>
                  {!isLocked && (
                    <a className="aphoto__dl" href={p.src} download aria-label={`Download ${p.label}`}>
                      <IconDownload size={16} />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty">Photos from this show are coming soon.</p>
        )}
        {locked > 0 && (
          <Link className="btn btn--outline-accent btn--block" style={{ marginTop: 20 }} href="/membership/" data-guest-only="">
            Unlock every backstage shot with RAW
          </Link>
        )}

        <div className="arel__head">
          <h2>More albums</h2>
          <Link className="arel__all" href="/photos/">
            All albums <span aria-hidden="true">→</span>
          </Link>
        </div>
        <AlbumGrid items={related} />
      </div>

      <StoryViewer
        slides={open.map((p) => ({ src: p.src, label: p.label }))}
        title={album.name}
        meta={album.no}
        start={at}
        onClose={() => setAt(null)}
      />
    </>
  );
}
