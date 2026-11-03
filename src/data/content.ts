/* Placeholder content, copied from the HTML reference.
   Text in [BRACKETS] is still to be replaced with real data
   (INTEGRATION: load these from your CMS / API instead). */

export const IMG = {
  logoWhite: "/assets/img/rvc-logo-white.png",
  logoBlack: "/assets/img/rvc-logo-black.png",
  yeLive: "/assets/img/ye-live-jakarta.jpg",
  yeListening: "/assets/img/ye-listening-party.jpg",
  gbkAerial: "/assets/img/gbk-aerial.jpg",
  tourTee: "/assets/img/products/tour-tee.svg",
  hoodie: "/assets/img/products/hoodie.svg",
  longsleeve: "/assets/img/products/longsleeve.svg",
  cap: "/assets/img/products/cap.svg",
};

/* ---------- Home hero reel ----------
   Full-bleed background that switches with the active show (hover on desktop,
   tap on touch; a second tap opens it). `video` loops muted; `img` is used when
   there is no video; neither = plain black frame. */

export type ReelItem = { title: string; meta: string; href: string; video?: string; img?: string };

export const heroReel = {
  tagline: "Crafting unforgettable live experiences that celebrate culture and community.",
  items: [
    { title: "YE — Live", meta: "Gelora Bung Karno · 24.10.2026", href: "/videos/", video: "/assets/video/rvc-reel.mp4", img: "/assets/img/rvc-reel-poster.jpg" },
    // Dummy abstract loops until real Moodymann / Jeff Mills footage is in.
    { title: "Moodymann", meta: "Zoo SCBD · Aug 2026", href: "/events/?e=moodymann", video: "/assets/video/moodymann-dummy.mp4", img: "/assets/img/moodymann-dummy-poster.jpg" },
    { title: "Jeff Mills", meta: "Zoo SCBD · May 2026", href: "/events/?e=jeff-mills", video: "/assets/video/jeffmills-dummy.mp4", img: "/assets/img/jeffmills-dummy-poster.jpg" },
    { title: "YE — Listening Party", meta: "Bengkel Space · Apr 2026", href: "/photos/ye-listening/", img: IMG.yeListening },
  ] satisfies ReelItem[],
};

/* ---------- Events ---------- */

export const nextEvent = {
  artist: "[NEXT ARTIST]",
  date: "[DATE]",
  dayDate: "[DAY, DATE]",
  venue: "[VENUE]",
  city: "Jakarta",
  doorsTime: "[TIME]",
  // ISO start time, e.g. "2026-12-12T19:00:00+07:00". Countdown shows 00 until set.
  startsAt: "[EVENT_START_ISO]",
  keyVisual: "", // image URL; empty shows the [EVENT KEY VISUAL] placeholder
  flag: "RAW presale open",
};

/* ---------- Events (upcoming + past, one gallery) ----------
   Order matters: upcoming first, then past shows newest first. */

export type RvcEvent = {
  id: string;
  status: "upcoming" | "past";
  tag: string; // badge on the tile, e.g. "Upcoming" or "RVC 004"
  name: string;
  date: string;
  // Card face: big date figure (day, or month when there is no day) + the line above it.
  big: string;
  when: string;
  venue: string;
  cover: string;
  // Muted loop that plays on hover and in the event banner.
  heroVideo?: string;
  desc: string;
  // Gallery photos shown under the event; `show` links to the Photos data.
  show?: string;
  extraPhotos?: string[];
  startsAt?: string;
  cta?: { label: string; href: string };
  raw?: boolean;
};

export const events: RvcEvent[] = [
  {
    id: "next",
    status: "upcoming",
    tag: "Upcoming · RAW presale open",
    name: nextEvent.artist,
    date: nextEvent.dayDate,
    big: "[DD]",
    when: "[MON] 2026",
    venue: `${nextEvent.venue}, ${nextEvent.city}`,
    cover: "/assets/img/lab/cover-halftone.svg",
    desc: "The next Raw Vision Collective night. Artist, date and venue drop soon; RAW members get presale access and priority entry.",
    startsAt: nextEvent.startsAt,
    cta: { label: "RSVP / Book tickets", href: "/rsvp/" },
  },
  {
    id: "tba",
    status: "upcoming",
    tag: "Upcoming",
    name: "[ARTIST TBA]",
    date: "[DD MON]",
    big: "[DD]",
    when: "[MON] 2026",
    venue: "[VENUE], Jakarta",
    cover: "/assets/img/lab/cover-sun.svg",
    desc: "Another RVC show is on the way. RSVP to be first in line when the line-up is announced.",
    cta: { label: "RSVP", href: "/rsvp/" },
  },
  {
    id: "secret",
    status: "upcoming",
    tag: "Upcoming · RAW only",
    name: "Secret show",
    date: "[DD MON]",
    big: "[DD]",
    when: "Secret · 2026",
    venue: "Location revealed to RAW",
    cover: "/assets/img/lab/cover-orbit.svg",
    desc: "A members-only night. The location drops to RAW members a few hours before doors.",
    cta: { label: "Join RAW", href: "/membership/" },
    raw: true,
  },
  {
    id: "ye-gbk",
    status: "past",
    tag: "RVC 004",
    name: "YE — Live",
    date: "24 Oct 2026",
    big: "24",
    when: "Oct 2026",
    venue: "Gelora Bung Karno Stadium, Jakarta",
    cover: IMG.yeLive,
    heroVideo: "/assets/video/rvc-reel.mp4",
    desc: "YE live at Gelora Bung Karno: a figure on a globe above a full stadium. The biggest RVC night so far, with the full aftermovie and backstage photos in the vault.",
    show: "ye-gbk",
    cta: { label: "Watch the aftermovie", href: "/videos/" },
  },
  {
    id: "moodymann",
    status: "past",
    tag: "RVC 003",
    name: "Moodymann",
    date: "Aug 2026",
    big: "AUG",
    when: "2026",
    venue: "Zoo SCBD, Jakarta",
    cover: "/assets/img/lab/poster-moody.svg",
    heroVideo: "/assets/video/moodymann-dummy.mp4",
    desc: "Detroit house legend Moodymann at Zoo SCBD: a long, warm set that ran past closing. Photos are coming soon; the full set recording is in the vault.",
    extraPhotos: ["/assets/img/moodymann-dummy-poster.jpg", "/assets/img/lab/poster-moody.svg"],
    cta: { label: "Full set — RAW", href: "/videos/" },
  },
  {
    id: "jeff-mills",
    status: "past",
    tag: "RVC 002",
    name: "Jeff Mills",
    date: "May 2026",
    big: "MAY",
    when: "2026",
    venue: "Zoo SCBD, Jakarta",
    cover: "/assets/img/lab/poster-jeff.svg",
    heroVideo: "/assets/video/jeffmills-dummy.mp4",
    desc: "The Wizard at Zoo SCBD: three decks, a 909 and a room that didn't stop moving. Photos are coming soon.",
    extraPhotos: ["/assets/img/jeffmills-dummy-poster.jpg", "/assets/img/lab/poster-techno.svg"],
    cta: { label: "Watch on RVC", href: "/videos/" },
  },
  {
    id: "ye-listening",
    status: "past",
    tag: "RVC 001",
    name: "YE — Listening Party",
    date: "Apr 2026",
    big: "APR",
    when: "2026",
    venue: "Bengkel Space, Jakarta",
    cover: IMG.yeListening,
    desc: "Where it started: the YE listening party at Bengkel Space, the night Jakarta first heard “Coming soon 2026”.",
    show: "ye-listening",
    cta: { label: "See the photos", href: "/photos/ye-listening/" },
  },
];

export const eventsAbout = {
  title: "Raw Vision nights",
  body: [
    "Raw Vision Collective is a network of creators and cultural leaders building live experiences that celebrate culture and community — from a listening party in a Jakarta workshop to a stadium night at Gelora Bung Karno.",
    "Every show is designed as one piece: the sound, the room, the visuals and the people in it. RAW members hear about the next one first, get presale access, and find out where the secret shows are.",
  ],
};

// Photos and videos from past shows, shown under the event cards.
export type EventMedia = { src: string; label: string; event: string; video?: string };

export const pastMedia: EventMedia[] = [
  { src: "/assets/img/rvc-reel-poster.jpg", video: "/assets/video/rvc-reel.mp4", label: "YE Live in Jakarta — Teaser", event: "ye-gbk" },
  { src: IMG.gbkAerial, label: "Gelora Bung Karno from above", event: "ye-gbk" },
  { src: IMG.yeLive, label: "YE Live in Jakarta key visual", event: "ye-gbk" },
  { src: "/assets/img/moodymann-dummy-poster.jpg", video: "/assets/video/moodymann-dummy.mp4", label: "Moodymann — Zoo SCBD", event: "moodymann" },
  { src: IMG.yeListening, label: "YE Listening Party — Bengkel Space", event: "ye-listening" },
  { src: "/assets/img/lab/poster-moody.svg", label: "Moodymann poster", event: "moodymann" },
  { src: "/assets/img/jeffmills-dummy-poster.jpg", video: "/assets/video/jeffmills-dummy.mp4", label: "Jeff Mills — Zoo SCBD", event: "jeff-mills" },
  { src: "/assets/img/lab/poster-jeff.svg", label: "Jeff Mills poster", event: "jeff-mills" },
  { src: "/assets/img/lab/poster-ye.svg", label: "YE Live poster", event: "ye-gbk" },
  { src: "/assets/img/lab/poster-listening.svg", label: "Listening Party poster", event: "ye-listening" },
];

/* ---------- Photos ---------- */

export type Show = { key: string; label: string; title: string; meta: string; featureImg?: string };

export const shows: Show[] = [
  { key: "ye-gbk", label: "YE · GBK", title: "YE Live — GBK Stadium, Oct 2026", meta: "Drop 01", featureImg: IMG.gbkAerial },
  { key: "moodymann", label: "Moodymann", title: "Moodymann — Zoo SCBD, Aug 2026", meta: "" },
  { key: "jeff-mills", label: "Jeff Mills", title: "Jeff Mills — Zoo SCBD, May 2026", meta: "" },
  { key: "ye-listening", label: "YE · Listening", title: "YE Listening Party — Bengkel Space, Apr 2026", meta: "Drop 01", featureImg: IMG.yeListening },
];

export type Photo = { show: string; label: string; src: string; position: string; locked?: boolean };

export const photos: Photo[] = [
  { show: "ye-gbk", label: "Gelora Bung Karno Stadium from above", src: IMG.gbkAerial, position: "center" },
  { show: "ye-gbk", label: "YE Live in Jakarta key visual", src: IMG.yeLive, position: "center 25%" },
  { show: "ye-gbk", label: "Stadium detail", src: IMG.gbkAerial, position: "20% 60%" },
  { show: "ye-gbk", label: "Crowd at GBK", src: IMG.yeLive, position: "center 85%", locked: true },
  { show: "ye-gbk", label: "Backstage", src: IMG.gbkAerial, position: "80% 30%", locked: true },
  { show: "ye-gbk", label: "Stage", src: IMG.yeLive, position: "center 50%", locked: true },
  { show: "ye-listening", label: "YE Listening Party at Bengkel Space", src: IMG.yeListening, position: "center" },
  { show: "ye-listening", label: "Listening Party crowd", src: IMG.yeListening, position: "center 80%", locked: true },
  { show: "ye-listening", label: "Listening Party screen", src: IMG.yeListening, position: "center 30%", locked: true },
];

/* ---------- Photo albums (one per past show) ---------- */

export type AlbumPhoto = { src: string; label: string; position?: string; locked?: boolean };
export type Album = {
  id: string; // = event id, also the URL: /photos/<id>/
  name: string;
  no: string; // "RVC 004"
  category: string;
  date: string;
  year: string;
  venue: string;
  cover: string;
  desc: string;
  photos: AlbumPhoto[];
};

const ALBUM_CATEGORY: Record<string, string> = {
  "ye-gbk": "Concert",
  "ye-listening": "Listening party",
  moodymann: "Club night",
  "jeff-mills": "Club night",
};

export const albums: Album[] = events
  .filter((e) => e.status === "past")
  .map((e) => ({
    id: e.id,
    name: e.name,
    no: e.tag,
    category: ALBUM_CATEGORY[e.id] ?? "Show",
    date: e.date,
    year: e.date.match(/\d{4}/)?.[0] ?? "",
    venue: e.venue,
    // Posters carry their own type, which fights the album title; prefer a photo.
    cover: e.extraPhotos?.[0] ?? e.cover,
    desc: e.desc,
    photos: [
      ...photos.filter((p) => p.show === e.show).map((p) => ({ src: p.src, label: p.label, position: p.position, locked: p.locked })),
      ...(e.extraPhotos ?? []).map((src, i) => ({ src, label: `${e.name} — ${i + 1}` })),
    ],
  }));

/* ---------- Videos ---------- */

export type Video = {
  id: string;
  title: string;
  meta: string;
  desc: string;
  poster: string;
  // INTEGRATION: HLS/MP4 URL from your CDN. Empty shows "Coming soon" in the player.
  src: string;
  length: string;
  locked?: boolean;
};

export const videos: Video[] = [
  {
    id: "ye-teaser",
    title: "YE Live in Jakarta — Teaser",
    meta: "GBK Stadium · 2026",
    desc: "One night at Gelora Bung Karno. The first look at YE live in Jakarta.",
    poster: "/assets/img/rvc-reel-poster.jpg",
    src: "/assets/video/rvc-reel.mp4",
    length: "0:11",
  },
  {
    id: "ye-aftermovie",
    title: "YE Live in Jakarta — Official Aftermovie",
    meta: "GBK Stadium · 24.10.2026",
    desc: "The stadium, the globe, the crowd. The official aftermovie of YE at GBK.",
    poster: IMG.yeLive,
    src: "",
    length: "[--:--]",
  },
  {
    id: "gbk-timelapse",
    title: "Building the Stage — GBK Timelapse",
    meta: "Production",
    desc: "Seven days of build compressed into minutes: how the GBK stage came together.",
    poster: IMG.gbkAerial,
    src: "",
    length: "[--:--]",
  },
  {
    id: "soundcheck",
    title: "Soundcheck — Night Before",
    meta: "Backstage · GBK",
    desc: "The empty stadium the night before doors. Members-only backstage footage.",
    poster: IMG.gbkAerial,
    src: "",
    length: "[--:--]",
    locked: true,
  },
  {
    id: "ye-listening",
    title: "YE Listening Party — Bengkel Space",
    meta: "Apr 2026",
    desc: "Where it started: the listening party at Bengkel Space.",
    poster: IMG.yeListening,
    src: "",
    length: "[--:--]",
  },
  {
    id: "moodymann-set",
    title: "Moodymann — Full Set Recording",
    meta: "Zoo SCBD · Aug 2026",
    desc: "The complete Moodymann set at Zoo SCBD, start to finish.",
    poster: IMG.yeListening,
    src: "",
    length: "[--:--]",
    locked: true,
  },
];

/* Netflix-style browse: featured billboard + horizontal rows (by video id). */
export const videoBrowse = {
  featured: "ye-teaser",
  rows: [
    { title: "New on RVC", ids: ["ye-teaser", "ye-aftermovie", "gbk-timelapse", "ye-listening"] },
    { title: "Free to watch", ids: ["ye-teaser", "ye-aftermovie", "gbk-timelapse", "ye-listening"] },
    { title: "RAW only — The Vault", ids: ["soundcheck", "moodymann-set"] },
  ],
};

/* ---------- Shop ---------- */

export type Product = { name: string; price: string; img: string; raw?: boolean; w?: number; h?: number };

export const isApparel = (name: string) => /tee|hoodie|longsleeve/i.test(name);

export const sizes = ["S", "M", "L", "XL", "XXL"];
export const defaultSize = "L";

export const checkout = {
  shipping: "[IDR]",
  memberDiscount: "−[IDR]",
  total: "[TOTAL IDR]",
};

/* ---------- RSVP ---------- */

export type Tier = { value: string; name: string; note: string; price: string; total: string; raw?: boolean };

export const tiers: Tier[] = [
  { value: "free", name: "Free RSVP", note: `Guestlist · entry before ${nextEvent.doorsTime}`, price: "Free", total: "Free" },
  { value: "ga", name: "General Admission", note: "Ticketed entry", price: "[IDR]", total: "[TOTAL IDR]" },
  { value: "raw", name: "RAW Presale", note: "Members only · priority entry", price: "[IDR]", total: "[TOTAL IDR]", raw: true },
];

export const maxTickets = 4;

/* ---------- Membership ---------- */

export const membership = {
  price: "[IDR]",
  memberName: "[MEMBER NAME]",
  memberNo: "[0000]",
  validTo: "[DATE]",
  memberSince: "[MON YYYY]",
  // INTEGRATION: these come from the member's account. Demo values so the
  // timers on the page actually run.
  presaleCode: "RAW-[XXXX]",
  presaleOpensAt: "2026-12-12T10:00:00+07:00",
  secretShow: { name: "Secret show", revealAt: "2026-11-21T18:00:00+07:00", location: "[SECRET LOCATION], Jakarta" },
  attended: ["ye-gbk", "ye-listening"], // event ids → stamps
};

export const perks = [
  { t: "Secret shows", d: "Location drops to members only, hours before doors." },
  { t: "Presale access", d: "Tickets before the public on-sale, every RVC event." },
  { t: "The vault", d: "Full sets, backstage photos and unreleased footage." },
  { t: "Member-only merch", d: "Pieces that never go on public sale." },
  { t: "Priority entry", d: "Your member card is your fast lane at the door." },
];

/* ---------- Profile (personalisation) ---------- */

export type GenreOption = { id: string; label: string; line: string; pick: { label: string; href: string } };

export const profileOptions = {
  genres: [
    { id: "house", label: "House", line: "Long, warm sets that run past closing.", pick: { label: "Moodymann at Zoo SCBD", href: "/events/?e=moodymann" } },
    { id: "techno", label: "Techno", line: "Three decks, a 909 and no breaks.", pick: { label: "Jeff Mills — the album", href: "/photos/jeff-mills/" } },
    { id: "hiphop", label: "Hip-hop", line: "Stadium nights and listening parties.", pick: { label: "YE Live in Jakarta — Teaser", href: "/videos/" } },
    { id: "rnb", label: "R&B", line: "Late, slow and loud enough.", pick: { label: "YE Listening Party photos", href: "/photos/ye-listening/" } },
    { id: "disco", label: "Disco", line: "Mirror balls and edits you can't find online.", pick: { label: "Next RVC night", href: "/events/?e=next" } },
    { id: "ambient", label: "Ambient", line: "Rooms you can hear yourself think in.", pick: { label: "Building the Stage — GBK", href: "/videos/" } },
    { id: "experimental", label: "Experimental", line: "If it sounds wrong, it's probably right.", pick: { label: "Secret show (RAW)", href: "/events/?e=secret" } },
  ] satisfies GenreOption[],
  artists: ["YE", "Moodymann", "Jeff Mills"],
  // Quick picks; any other country can be typed (the full list comes from the browser).
  countries: ["Indonesia", "Singapore", "Malaysia", "Thailand", "Philippines", "Australia", "Japan"],
  foundVia: ["Instagram", "A friend", "At an RVC show", "Ticketing site", "Other"],
};
