"use client";

import Link from "next/link";
import { useState } from "react";
import { events, membership, photos, videos, type Video } from "@/data/content";
import { firstName, useProfile } from "@/lib/profile";
import { Countdown, useNow } from "./Countdown";
import { IconBell, IconLock, IconPin, IconPlay, IconTicket } from "./icons";
import { LeaveButton, PrefSwitch, WalletButtons } from "./Membership";
import { NetflixPlayer } from "./NetflixPlayer";
import { QrFullscreen, RawCard } from "./RawCard";
import { StoryViewer } from "./StoryViewer";
import { useToast } from "./toast";

/* The member's RAW: the card (tap → door QR), what's next, the shows they
   were at, the vault, and settings. */
export function RawMember() {
  const [qr, setQr] = useState(false);
  const profile = useProfile();
  const name = profile.name.trim() || membership.memberName;
  return (
    <div className="container rawmember">
      <div className="page-head">
        <span className="eyebrow accent">
          RAW member · since {membership.memberSince} · <Link href="/profile/">Your profile →</Link>
        </span>
        <h1 className="page-title" id="member-title">
          Welcome back{firstName(profile) ? `, ${firstName(profile)}` : ""}.
        </h1>
      </div>

      <div className="rawmember__top">
        <div>
          <RawCard
            name={name}
            no={membership.memberNo}
            validTo={membership.validTo}
            label="Your RAW member card — tap to show the entry QR"
            onClick={() => setQr(true)}
          />
          <p className="wallet-note">Tap the card to show your entry QR at the door.</p>
          <WalletButtons />
        </div>
        <NextForYou />
      </div>

      <Stamps />
      <VaultRow />

      <section aria-labelledby="settings-title">
        <div className="section-label">
          <span id="settings-title">Settings</span>
          <span>Renews {membership.validTo}</span>
        </div>
        <nav className="menu" aria-label="Member settings">
          <Link className="menu__item" href="/events/?e=secret">
            <span className="menu__icon" style={{ display: "flex" }}>
              <IconPin size={22} />
            </span>
            <span className="menu__label">Secret shows</span>
            <span className="menu__meta">1 new</span>
            <span className="dim" aria-hidden="true">
              ›
            </span>
          </Link>
          <div className="menu__item">
            <span className="menu__icon" style={{ display: "flex" }}>
              <IconBell size={22} />
            </span>
            <label className="menu__label" htmlFor="pref-drops">
              Drop alerts
            </label>
            <PrefSwitch id="pref-drops" pref="drops" />
          </div>
        </nav>
        <LeaveButton />
      </section>

      <QrFullscreen open={qr} onClose={() => setQr(false)} name={name} no={membership.memberNo} />
    </div>
  );
}

function NextForYou() {
  const now = useNow();
  const toast = useToast();
  const { secretShow, presaleCode, presaleOpensAt } = membership;
  const revealed = now !== null && now >= Date.parse(secretShow.revealAt) / 1000;
  const copy = () =>
    navigator.clipboard?.writeText(presaleCode).then(
      () => toast("Presale code copied."),
      () => toast(presaleCode),
    );

  return (
    <section className="nextfor" aria-labelledby="next-title">
      <div className="section-label">
        <span id="next-title">Next for you</span>
      </div>
      <article className="nextcard nextcard--secret">
        <span className="eyebrow accent">
          <IconPin size={12} /> {secretShow.name}
        </span>
        {revealed ? (
          <>
            <h3>{secretShow.location}</h3>
            <p>The location is live. Doors soon — bring your card.</p>
          </>
        ) : (
          <>
            <h3>Location unlocks in</h3>
            <Countdown to={secretShow.revealAt} label="Time until the secret show location is revealed" />
            <p>We drop the address here a few hours before doors. Keep drop alerts on.</p>
          </>
        )}
      </article>
      <article className="nextcard">
        <span className="eyebrow accent">
          <IconTicket size={12} /> Presale code
        </span>
        <div className="nextcard__code">
          <code>{presaleCode}</code>
          <button type="button" className="btn btn--ghost" onClick={copy}>
            Copy
          </button>
        </div>
        <span className="eyebrow">Presale opens in</span>
        <Countdown to={presaleOpensAt} label="Time until the presale opens" />
        <Link className="btn btn--primary btn--block" href="/rsvp/">
          Use it on RSVP
        </Link>
      </article>
    </section>
  );
}

/* Past shows as passport stamps: attended in colour, missed ones faded. */
function Stamps() {
  const past = events.filter((e) => e.status === "past");
  const got = past.filter((e) => membership.attended.includes(e.id)).length;
  return (
    <section className="stamps" aria-labelledby="stamps-title">
      <div className="section-label">
        <span id="stamps-title">Your shows</span>
        <span>
          {got} of {past.length} stamps
        </span>
      </div>
      <ul className="stamps__list">
        {past.map((e, i) => {
          const was = membership.attended.includes(e.id);
          return (
            <li key={e.id}>
              <Link href={`/events/?e=${e.id}`} className={was ? "stamp is-got" : "stamp"} style={{ ["--tilt" as string]: `${(i % 2 ? 1 : -1) * (3 + i)}deg` }}>
                <img src={e.cover} alt="" loading="lazy" />
                <span className="stamp__ring" />
                <span className="stamp__text">
                  <b>{e.tag}</b>
                  <span>{e.name}</span>
                  <span>{e.date}</span>
                </span>
                <span className="stamp__mark">{was ? "Attended" : "Missed"}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* Member-only videos and photos, Netflix-row style. */
function VaultRow() {
  const [playing, setPlaying] = useState<Video | null>(null);
  const [albumAt, setAlbumAt] = useState<number | null>(null);
  const vids = videos.filter((v) => v.locked);
  const shots = photos.filter((p) => p.locked);
  return (
    <section className="nrow rawvault" aria-labelledby="vault-row-title">
      <div className="section-label">
        <span id="vault-row-title">The vault</span>
        <Link href="/videos/">All videos</Link>
      </div>
      <div className="nrow__track rawvault__track">
        {vids.map((v) => (
          <button key={v.id} type="button" className="ncard" onClick={() => setPlaying(v)} aria-label={`Play ${v.title}`}>
            <img src={v.poster} alt="" loading="lazy" />
            <span className="ncard__shade" />
            <span className="ncard__badge">
              <IconLock size={12} /> RAW
            </span>
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
        ))}
        {shots.map((p, i) => (
          <button key={p.label} type="button" className="ncard" onClick={() => setAlbumAt(i)} aria-label={`View ${p.label}`}>
            <img src={p.src} alt="" loading="lazy" style={{ objectPosition: p.position }} />
            <span className="ncard__shade" />
            <span className="ncard__badge">
              <IconLock size={12} /> Backstage
            </span>
            <span className="ncard__info">
              <span className="ncard__title">{p.label}</span>
              <span className="ncard__meta">Photo</span>
            </span>
          </button>
        ))}
      </div>
      <NetflixPlayer video={playing} onClose={() => setPlaying(null)} />
      <StoryViewer slides={shots.map((p) => ({ src: p.src, label: p.label }))} title="The vault" meta="Backstage" start={albumAt} onClose={() => setAlbumAt(null)} />
    </section>
  );
}
