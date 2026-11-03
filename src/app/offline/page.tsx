import type { Metadata } from "next";
import { IMG } from "@/data/content";

export const metadata: Metadata = { title: "Offline" };

/* Served by the service worker (public/sw.js) when a page isn't cached.
   Plain <a> on purpose: retry must be a full network request. */
export default function OfflinePage() {
  return (
    <div className="screen no-tabbar">
      <main id="main" style={{ paddingTop: "20vh" }}>
        <div className="container narrow" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <img className="logo--dark" src={IMG.logoWhite} alt="Raw Vision Collective" width={148} height={64} style={{ height: 64, width: "auto" }} />
          <img className="logo--light" src={IMG.logoBlack} alt="" aria-hidden="true" width={148} height={64} style={{ height: 64, width: "auto" }} />
          <h1 className="page-title">You&apos;re offline</h1>
          <p className="dim">Pages you&apos;ve opened before still work. Reconnect to load new drops.</p>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="btn btn--primary" href="/" style={{ alignSelf: "flex-start" }}>
            Try again
          </a>
        </div>
      </main>
    </div>
  );
}
