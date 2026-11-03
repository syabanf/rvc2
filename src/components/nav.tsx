"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { IconBag, IconCalendar, IconHome, IconLock, IconMedia } from "./icons";

export type Section = "home" | "media" | "shop" | "events" | "raw";

export const NAV = [
  { key: "home", href: "/", label: "Home", Icon: IconHome },
  { key: "media", href: "/photos/", label: "Media", Icon: IconMedia },
  { key: "shop", href: "/merch/", label: "Shop", Icon: IconBag },
  { key: "events", href: "/events/", label: "Events", Icon: IconCalendar },
  { key: "raw", href: "/profile/", label: "RAW", Icon: IconLock },
] as const satisfies readonly { key: Section; href: string; label: string; Icon: unknown }[];

const SECTION_BY_PATH: Record<string, Section> = {
  photos: "media",
  videos: "media",
  merch: "shop",
  events: "events",
  "past-shows": "events",
  rsvp: "events",
  membership: "raw",
  profile: "raw",
};

export function useSection(): Section {
  const first = usePathname().split("/").filter(Boolean)[0] ?? "";
  return SECTION_BY_PATH[first] ?? "home";
}

const subscribeScroll = (fn: () => void) => {
  window.addEventListener("scroll", fn, { passive: true });
  return () => window.removeEventListener("scroll", fn);
};

export function useScrolled(): boolean {
  return useSyncExternalStore(subscribeScroll, () => window.scrollY > 8, () => false);
}

/* Bottom tab bar (iOS, Android, PWA on mobile; hidden on desktop PWA). */
export function TabBar() {
  const section = useSection();
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar__inner">
        {NAV.map(({ key, href, label, Icon }) => (
          <Link key={key} className="tab" href={href} aria-current={section === key ? "page" : undefined}>
            <span className="tab__icon">
              <Icon />
            </span>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

/* Top navigation links, only visible on the desktop PWA layout. */
export function DesktopNav() {
  const section = useSection();
  return (
    <nav className="topbar__nav" aria-label="Main">
      {NAV.filter((n) => n.key !== "home").map(({ key, href, label }) => (
        <Link
          key={key}
          href={href}
          className={key === "raw" ? "nav-raw" : undefined}
          aria-current={section === key ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
