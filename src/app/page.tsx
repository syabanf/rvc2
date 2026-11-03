import type { Metadata } from "next";
import Link from "next/link";
import { Screen } from "@/components/Screen";
import { HeroReel } from "@/components/HeroReel";
import { IMG, nextEvent } from "@/data/content";

export const metadata: Metadata = { title: "Home" };

const tiles = [
  { href: "/photos/", img: IMG.gbkAerial, name: "Photos" },
  { href: "/videos/", img: IMG.yeListening, name: "Videos" },
  { href: "/merch/", img: "/assets/img/lab/tee-arches.svg", name: "Merch" },
  { href: "/events/", img: IMG.yeLive, name: "Archive" },
];

export default function HomePage() {
  return (
    <Screen title="Home" action="membership" overlay>
      <HeroReel />
      <div className="container">
        <div className="section-label">
          <span>Exclusive</span>
          <span>Members first</span>
        </div>
        <nav className="tiles" aria-label="Exclusive content">
          {tiles.map((t, i) => (
            <Link key={t.href} className="tile" href={t.href}>
              <img src={t.img} alt="" loading="lazy" width={400} height={400} />
              <span className="tile__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="tile__name">{t.name}</span>
            </Link>
          ))}
        </nav>

        <div className="split">
          <section aria-labelledby="next-label">
            <div className="section-label" id="next-label">
              <span>Next</span>
              <Link href="/events/">All events</Link>
            </div>
            <Link className="next-event" href="/events/">
              <span>
                <span className="next-event__name">{nextEvent.artist}</span>
                <span className="next-event__meta" style={{ display: "block" }}>
                  {nextEvent.date} · {nextEvent.venue}, {nextEvent.city}
                </span>
              </span>
              <span className="mono" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                RSVP →
              </span>
            </Link>
          </section>
          <Link className="teaser" href="/membership/">
            <span className="eyebrow accent" data-guest-only="">
              Locked
            </span>
            <span className="eyebrow accent" data-member-only="">
              You&apos;re in
            </span>
            <span className="teaser__title" data-guest-only="">
              There is more. RAW members only.
            </span>
            <span className="teaser__title" data-member-only="">
              Your RAW card, secret shows and the vault.
            </span>
            <span className="eyebrow">Enter →</span>
          </Link>
        </div>
      </div>
    </Screen>
  );
}
