"use client";

import Link from "next/link";
import { useState } from "react";
import { events, membership, profileOptions } from "@/data/content";
import { useMember } from "@/lib/member";
import { firstName, useProfile, type Profile } from "@/lib/profile";
import { CursorDot, RevealLens, ScrollWords, type WordPart } from "./Lens";
import { ProfileEditor } from "./ProfileEditor";

const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} & ${xs[xs.length - 1]}`);

/* A personal page in the spirit of a designer portfolio: a giant stacked
   headline with a reveal lens, an "about me" that lights up as you scroll,
   what they're into (with picks), and their RVC history. */
export function ProfilePage() {
  const p = useProfile();
  const member = useMember();
  const [editing, setEditing] = useState(false);
  const name = firstName(p);
  const hasProfile = !!name;
  const hasAny = hasProfile || !!(p.photo || p.country || p.genres.length || p.artists.length);
  const genres = profileOptions.genres.filter((g) => p.genres.includes(g.id));
  const year = membership.memberSince.match(/\d{4}/)?.[0] ?? "2026";
  const shows = member ? events.filter((e) => membership.attended.includes(e.id)) : [];

  const head = hasProfile ? [name, "LIVES", "RAW", `SINCE ${year}`] : ["WHO", "ARE", "YOU", "?"];
  const headAlt = hasProfile ? [name, "DANCES", "TILL", "SUNRISE"] : ["TELL", "US", "ABOUT", "YOU"];

  return (
    <div className="prof">
      <CursorDot />
      <section className="prof__hero" aria-labelledby="prof-title">
        <img className="prof__photo" src={p.photo || "/assets/img/rvc-reel-poster.jpg"} alt="" />
        <div className="prof__shade" />
        <div className="prof__heroin">
          <span className="prof__kicker">
            {hasProfile ? p.name : "Your RVC profile"} · {member ? `RAW member no. ${membership.memberNo}` : "Guest"}
          </span>
          <RevealLens className="prof__lens" alt={<Stack lines={headAlt} />}>
            <h1 id="prof-title">
              <Stack lines={head} />
            </h1>
          </RevealLens>
          <div className="prof__heroactions">
            <button type="button" className="btn prof__cta" onClick={() => setEditing(true)}>
              {hasAny ? "Edit profile" : "Set up your profile"} <span aria-hidden="true">→</span>
            </button>
            <Link className="eyebrow accent" href="/membership/">
              {member ? "Your RAW card →" : "Join RAW →"}
            </Link>
            {p.country && <span className="eyebrow">Based in {p.country}</span>}
            {p.instagram && (
              <a className="eyebrow accent" href={`https://instagram.com/${p.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer">
                @{p.instagram.replace(/^@/, "")}
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="container">
        <section className="prof__about" aria-labelledby="about-title">
          <span className="prof__label" id="about-title">
            About me
          </span>
          <RevealLens className="prof__lens prof__lens--about" alt={<p className="swords is-alt">{aboutAlt(p, shows.length)}</p>}>
            <ScrollWords parts={about(p, shows.length)} />
          </RevealLens>
        </section>

        <section className="prof__into" aria-labelledby="into-title">
          <span className="prof__label" id="into-title">
            What I&apos;m into
          </span>
          {genres.length ? (
            <ul className="prof__genres">
              {genres.map((g) => (
                <li key={g.id}>
                  <Link className="prof__genre" href={g.pick.href}>
                    <span className="prof__genrename">{g.label}</span>
                    <span className="prof__genremore">
                      <span>{g.line}</span>
                      <span className="accent">Picked for you → {g.pick.label}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <button type="button" className="prof__empty" onClick={() => setEditing(true)}>
              <span className="prof__genrename">Pick your sound</span>
              <span className="eyebrow">House, techno, hip-hop… we&apos;ll tune the app to it →</span>
            </button>
          )}
          {p.artists.length > 0 && (
            <p className="prof__artists">
              <span className="eyebrow">On repeat</span> {list(p.artists)}
            </p>
          )}
        </section>

        <section className="prof__history" aria-labelledby="history-title">
          <span className="prof__label" id="history-title">
            History
          </span>
          <ol className="prof__timeline">
            <li>
              <span className="prof__when">Next</span>
              <span className="prof__what">
                <b>{events[0].name}</b>
                <span>{events[0].venue}</span>
              </span>
              <Link className="eyebrow accent" href="/events/?e=next">
                RSVP →
              </Link>
            </li>
            {member && (
              <li>
                <span className="prof__when">Now</span>
                <span className="prof__what">
                  <b>RAW member</b>
                  <span>Since {membership.memberSince}</span>
                </span>
                <Link className="eyebrow" href="/membership/">
                  Card →
                </Link>
              </li>
            )}
            {shows.map((e) => (
              <li key={e.id}>
                <span className="prof__when">{e.date}</span>
                <span className="prof__what">
                  <b>{e.name}</b>
                  <span>{e.venue}</span>
                </span>
                <Link className="eyebrow" href={`/photos/${e.id}/`}>
                  Photos →
                </Link>
              </li>
            ))}
            {!member && (
              <li>
                <span className="prof__when">Soon</span>
                <span className="prof__what">
                  <b>Your first stamp</b>
                  <span>Join RAW to collect a stamp at every show.</span>
                </span>
                <Link className="eyebrow accent" href="/membership/">
                  Join →
                </Link>
              </li>
            )}
          </ol>
        </section>
      </div>

      <ProfileEditor open={editing} onClose={() => setEditing(false)} />
    </div>
  );
}

function Stack({ lines }: { lines: string[] }) {
  return (
    <span className="prof__stack">
      {lines.map((l, i) => (
        <span key={i} className={i % 2 ? "is-hot" : undefined}>
          {l.toUpperCase()}
        </span>
      ))}
    </span>
  );
}

function about(p: Profile, shows: number): WordPart[] {
  if (!firstName(p)) {
    return [
      { text: "This page is about" },
      { text: "you.", hot: true },
      { text: "Tell us your name, your country and the sound you're into, and the whole app tunes itself to it — picks, greetings and a pre-filled RSVP." },
    ];
  }
  const genres = profileOptions.genres.filter((g) => p.genres.includes(g.id)).map((g) => g.label.toLowerCase());
  return [
    { text: `I'm ${firstName(p)}, a` },
    { text: genres.length ? `${list(genres)} head` : "night person", hot: true },
    { text: p.country ? `from ${p.country}.` : "on the RVC list." },
    { text: shows ? `I've been to ${shows} RVC ${shows === 1 ? "show" : "shows"}` : "My first RVC show is coming up" },
    { text: p.artists.length ? "and I'm here for" : "and I'm here for whatever's next." },
    ...(p.artists.length ? [{ text: `${list(p.artists)}.`, hot: true }] : []),
  ];
}

function aboutAlt(p: Profile, shows: number) {
  if (!firstName(p)) return "Name, country, sound. Thirty seconds, and the app is yours.";
  return `A regular who hasn't missed a drop (yet) — ${shows} ${shows === 1 ? "stamp" : "stamps"} and counting, ${p.country || "somewhere"} represent.`;
}
