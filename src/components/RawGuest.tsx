"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { membership, perks, photos, videos } from "@/data/content";
import { labItems } from "@/data/lab.generated";
import { setMember, useMember } from "@/lib/member";
import { Countdown } from "./Countdown";
import { IconLock, IconPlay } from "./icons";
import { JoinButton } from "./Membership";
import { QrCode, RawCard } from "./RawCard";
import { useToast } from "./toast";

/* The RAW pitch for guests: cinematic hero with the card, a peek at what is
   locked, perks as small visuals, then join (price or invite code). */
export function RawGuest() {
  const joinRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [showBar, setShowBar] = useState(false);
  const member = useMember(); // the guest half is hidden for members; don't run its video
  const toJoin = () => joinRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  // Sticky join bar (phones): visible once the hero is gone, until the join block shows.
  useEffect(() => {
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting));
      setShowBar(!seen.get(heroRef.current!) && !seen.get(joinRef.current!));
    });
    if (heroRef.current) io.observe(heroRef.current);
    if (joinRef.current) io.observe(joinRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <section className="rawhero" ref={heroRef} aria-labelledby="raw-title">
        {member ? (
          <img className="rawhero__bg" src="/assets/img/rvc-reel-poster.jpg" alt="" />
        ) : (
          <video className="rawhero__bg" src="/assets/video/rvc-reel.mp4" poster="/assets/img/rvc-reel-poster.jpg" muted loop playsInline autoPlay aria-hidden="true" />
        )}
        <div className="rawhero__shade" />
        <div className="rawhero__inner">
          <div className="rawhero__copy">
            <span className="eyebrow accent">Members only · by invitation</span>
            <h1 className="rawhero__word" id="raw-title">
              RAW
            </h1>
            <p>The part of Raw Vision we don&apos;t post. Secret shows, the vault, and first access to everything.</p>
            <div className="rawhero__actions">
              <button type="button" className="btn btn--accent" onClick={toJoin}>
                Join RAW — {membership.price} / year
              </button>
              <button type="button" className="btn btn--ghost" onClick={toJoin}>
                I have an invite code
              </button>
            </div>
          </div>
          <div className="rawhero__card">
            <RawCard name="[YOUR NAME]" no="0000" validTo="2027" label="Preview of the RAW member card" preview onClick={toJoin} />
            <span className="rawhero__cardnote">Your card · tilt it</span>
          </div>
        </div>
      </section>

      <div className="container">
        <VaultPeek onJoin={toJoin} />
        <PerkGrid />
        <section className="rawjoin" id="join" ref={joinRef} aria-labelledby="join-title">
          <div>
            <span className="eyebrow accent">Join</span>
            <h2 id="join-title">RAW membership</h2>
            <p className="rawjoin__price">
              {membership.price} <span>/ year</span>
            </p>
            <JoinButton className="btn btn--accent btn--block">Join RAW now</JoinButton>
          </div>
          <InviteCode />
        </section>
      </div>

      <div className={showBar ? "rawbar is-visible" : "rawbar"} aria-hidden={!showBar}>
        <span>
          <b>RAW</b> · {membership.price} / year
        </span>
        <button type="button" className="btn btn--accent" onClick={toJoin} tabIndex={showBar ? 0 : -1}>
          Join
        </button>
      </div>
    </>
  );
}

/* What is behind the lock, straight from the site's own member-only content. */
function VaultPeek({ onJoin }: { onJoin: () => void }) {
  const lockedVideos = videos.filter((v) => v.locked);
  const lockedPhotos = photos.filter((p) => p.locked);
  const rawPieces = labItems.filter((i) => i.raw);
  const items = [
    ...lockedVideos.map((v) => ({ src: v.poster, kind: "Full set · video", label: v.title, video: true })),
    ...lockedPhotos.map((p) => ({ src: p.src, kind: "Backstage · photo", label: p.label, video: false })),
    ...rawPieces.map((i) => ({ src: i.img, kind: "Member-only merch", label: i.name, video: false })),
  ];
  return (
    <section className="vaultpeek" aria-labelledby="vault-title">
      <div className="section-label">
        <span id="vault-title">Inside the vault</span>
        <span>
          {lockedPhotos.length} backstage shots · {lockedVideos.length} videos · {rawPieces.length} pieces
        </span>
      </div>
      <div className="vaultpeek__row">
        {items.map((it, i) => (
          <button key={it.src + i} type="button" className="vaultpeek__item" onClick={onJoin} aria-label={`Locked — ${it.label}. Join RAW to unlock.`}>
            <img src={it.src} alt="" loading="lazy" />
            <span className="vaultpeek__lock">
              {it.video ? <IconPlay size={14} /> : <IconLock size={16} />}
            </span>
            <span className="vaultpeek__info">
              <span className="eyebrow accent">{it.kind}</span>
              <span>{it.label}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* The five perks, each with a small live visual instead of a bullet. */
function PerkGrid() {
  const visuals = [
    <div key="secret" className="perkviz perkviz--map" aria-hidden="true">
      <span className="perkviz__pin" />
      <span className="perkviz__tag">Location hidden</span>
    </div>,
    <div key="presale" className="perkviz perkviz--clock" aria-hidden="true">
      <span className="eyebrow">Next presale opens in</span>
      <Countdown to={membership.presaleOpensAt} label="Time until the next presale" />
    </div>,
    <div key="vault" className="perkviz perkviz--stack" aria-hidden="true">
      <img src={photos[3].src} alt="" />
      <img src={photos[4].src} alt="" />
      <img src={photos[7].src} alt="" />
    </div>,
    <div key="merch" className="perkviz perkviz--merch" aria-hidden="true">
      <img src="/assets/img/lab/longsleeve-raw.svg" alt="" />
      <span className="lab__badge">RAW</span>
    </div>,
    <div key="entry" className="perkviz perkviz--scan" aria-hidden="true">
      <span className="perkviz__qr">
        <QrCode />
        <span className="perkviz__beam" />
      </span>
    </div>,
  ];
  return (
    <section className="perkgrid" aria-labelledby="perks-title">
      <div className="section-label">
        <span id="perks-title">What you get</span>
        <span>05 perks</span>
      </div>
      <ul className="perkgrid__list">
        {perks.map((p, i) => (
          <li key={p.t} className="perkcard">
            {visuals[i]}
            <span className="perkcard__n">{String(i + 1).padStart(2, "0")}</span>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const CODE_LEN = 6;

/* Invite code as six boxes; pasting a whole code fills them all. */
function InviteCode() {
  const [chars, setChars] = useState<string[]>(Array(CODE_LEN).fill(""));
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const toast = useToast();

  const accept = (code: string) => {
    // INTEGRATION: verify the invite code on the server before granting RAW.
    if (code.length === CODE_LEN) {
      setMember(true);
      toast("Invite accepted — welcome to RAW.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const put = (i: number, v: string) => {
    const next = [...chars];
    next[i] = v.slice(-1).toUpperCase();
    setChars(next);
    if (v && i < CODE_LEN - 1) boxes.current[i + 1]?.focus();
    accept(next.join(""));
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !chars[i] && i > 0) boxes.current[i - 1]?.focus();
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const code = e.clipboardData.getData("text").replace(/[^a-z0-9]/gi, "").slice(0, CODE_LEN).toUpperCase();
    if (!code) return;
    e.preventDefault();
    const next = Array.from({ length: CODE_LEN }, (_, i) => code[i] ?? "");
    setChars(next);
    boxes.current[Math.min(code.length, CODE_LEN - 1)]?.focus();
    accept(next.join(""));
  };

  return (
    <div className="invite">
      <span className="eyebrow">Got an invite?</span>
      <p>Enter the 6-character code from a RAW member.</p>
      <div className="invite__boxes" role="group" aria-label="Invite code">
        {chars.map((c, i) => (
          <input
            key={i}
            ref={(el) => {
              boxes.current[i] = el;
            }}
            value={c}
            onChange={(e) => put(i, e.target.value.replace(/[^a-z0-9]/gi, ""))}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={onPaste}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="one-time-code"
            maxLength={2}
            aria-label={`Character ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
