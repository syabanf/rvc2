# Raw Vision Collective — App

Next.js (App Router, static export) + Capacitor. One React codebase builds the
**iOS** and **Android** apps and the installable **PWA**, ported from the
`RVC-App-HTML.zip` reference (same pages, same design tokens, same behaviour).

| Page | Route | Feature |
|---|---|---|
| Home | `/` | Hero, exclusive content, next event, RAW teaser |
| Photos | `/photos/` | Filter by show, member-locked shots |
| Videos | `/videos/` | Player + playlist, member-locked videos |
| Shop | `/merch/` | Merch, size picker, checkout sheet |
| Upcoming | `/events/` | Next event with countdown, upcoming list |
| Past shows | `/past-shows/` | Show archive |
| RSVP | `/rsvp/` | Ticket tiers, quantity, validated form |
| RAW Membership | `/membership/` | Join flow, member card, wallet pass, member menu |
| Offline | `/offline/` | Service-worker fallback (PWA) |

## Develop

```bash
npm install
npm run dev            # http://localhost:3000
```

Preview a platform layer in the browser with `?platform=ios`, `?platform=android`
or `?platform=pwa` (remembered until you pass another). Inside the native apps the
real platform is always used.

## Build

```bash
npm run build          # static export to out/ — deploy this folder as the PWA
npm run deploy         # build + publish to https://rvc2.reddie.id
npm run ios            # build, sync, open Xcode
npm run android        # build, sync, open Android Studio
npm run apk            # debug APK → rvc-debug.apk (JDK 21 + Android SDK, no Studio needed)
```

`rvc2.reddie.id` is served by the `rvc2` nginx container on this machine
(`/home/wit/docker-infra/rvc2/html`, reached through Cloudflare); `npm run deploy`
syncs `out/` into that folder, no restart needed.

The PWA must be served over HTTPS (service worker + install prompt). The service
worker's cache name is stamped with the build id after each build
(`scripts/stamp-sw.mjs`), so every deploy refreshes returning visitors.

## How it is organised

```
src/app/                 one folder per route (server components, prerendered)
src/components/          Screen (page frame), Topbar, TabBar, Sheet, Shop, Checkout,
                         PhotoGallery, VideoPlayer, RsvpForm, Membership, Countdown…
src/data/content.ts      all placeholder content ([NEXT ARTIST], [IDR PRICE]…)
src/lib/                 platform detection, membership state, safe localStorage
src/styles/base.css      shared design tokens + components (from the HTML reference)
src/styles/platform-*.css  platform layers, scoped to html[data-platform="…"]
public/                  images, icons, manifest, service worker
ios/, android/           Capacitor native projects
```

- **Platform**: an inline script in `<head>` sets `html[data-platform]` before first
  paint (Capacitor → `ios` / `android`, browser → `pwa`). Components that render
  differently per platform (pay methods, wallet buttons, sheet header) use `usePlatform()`.
- **Member gating**: `html[data-member]` + `data-member-only` / `data-guest-only`
  attributes (CSS), and `useMember()` for logic.

## What to connect before launch

Search the code for `INTEGRATION`:

- **Auth / membership** — `src/lib/member.ts` uses localStorage for the demo. Replace with
  your session check and gate member content on the server too.
- **Payments** — `src/components/Checkout.tsx`: Apple Pay / Google Pay via your PSP, or
  Midtrans / Xendit for QRIS, virtual accounts and cards.
- **Video** — `src` per video in `src/data/content.ts` (HLS/MP4 URL).
- **RSVP** — POST the form in `src/components/RsvpForm.tsx` to your booking API.
- **Wallet passes** — `src/components/Membership.tsx`: signed `.pkpass` / Google Wallet URL.
- **Share links** — set `NEXT_PUBLIC_SITE_URL` so shares from the native apps link to the
  public site (it is also the base URL for Open Graph images).

## Native notes

- Inside Capacitor every route loads through client-side navigation from `/`; a hard
  reload of a deep URL falls back to the home page (Capacitor serves `index.html` for
  extensionless paths).
- Layouts use `viewport-fit=cover` and `env(safe-area-inset-*)` for the notch / home
  indicator (Android: Capacitor 8 SystemBars, `insetsHandling` default).
- iOS builds need macOS + Xcode; Android builds need Android Studio / the Android SDK.
