"use client";

import Link from "next/link";
import { IMG } from "@/data/content";
import { useProfile } from "@/lib/profile";
import { setTheme, useTheme } from "@/lib/theme";
import { IconBack, IconLock, IconMoon, IconShare, IconSun, IconUser } from "./icons";
import { DesktopNav, useScrolled } from "./nav";
import { InstallButton } from "./pwa";
import { useToast } from "./toast";

export type TopbarAction = "share" | "membership";

type TopbarProps = {
  title: string;
  back?: { href: string; label: string };
  action?: TopbarAction;
  overlay?: boolean;
};

export function Topbar({ title, back, action = "share", overlay }: TopbarProps) {
  const scrolled = useScrolled();
  const className = ["topbar", overlay && "topbar--overlay", scrolled && "is-scrolled"].filter(Boolean).join(" ");
  return (
    <header className={className}>
      <div className="topbar__inner">
        {back ? (
          <Link className="back" href={back.href}>
            <IconBack size={22} />
            <span>{back.label}</span>
          </Link>
        ) : (
          <Link className="topbar__logo" href="/">
            {/* Both logos ship; CSS shows the one for the current theme (no flash). */}
            <img className="logo--dark" src={IMG.logoWhite} alt="Raw Vision Collective — home" width={83} height={36} />
            <img className="logo--light" src={IMG.logoBlack} alt="" aria-hidden="true" width={83} height={36} />
          </Link>
        )}
        <span className="topbar__title" aria-hidden="true">
          {title}
        </span>
        <DesktopNav />
        <div className="topbar__actions">
          <InstallButton />
          <ThemeToggle />
          <ProfileLink />
          {action === "membership" ? (
            <Link className="icon-btn" href="/membership/" aria-label="RAW Membership">
              <IconLock size={22} />
            </Link>
          ) : (
            <ShareButton />
          )}
        </div>
      </div>
    </header>
  );
}

function ProfileLink() {
  const p = useProfile();
  return (
    <Link className="icon-btn profile-link" href="/profile/" aria-label={p.name ? `Profile — ${p.name}` : "Your profile"}>
      {p.photo ? <span className="profile-link__avatar" style={{ backgroundImage: `url(${p.photo})` }} /> : <IconUser size={21} />}
    </Link>
  );
}

function ThemeToggle() {
  const theme = useTheme();
  const next = theme === "light" ? "dark" : "light";
  return (
    <button type="button" className="icon-btn" onClick={() => setTheme(next)} aria-label={`Switch to ${next} mode`}>
      {theme === "light" ? <IconMoon size={21} /> : <IconSun size={21} />}
    </button>
  );
}

/* INTEGRATION: set NEXT_PUBLIC_SITE_URL so shares from the native app link to
   the public site instead of the app's local capacitor:// / localhost URL. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

function ShareButton() {
  const toast = useToast();
  const share = () => {
    const url = SITE_URL ? new URL(location.pathname, SITE_URL).href : location.href;
    if (navigator.share) navigator.share({ title: document.title, url }).catch(() => {});
    else navigator.clipboard?.writeText(url).then(() => toast("Link copied."));
  };
  return (
    <button type="button" className="icon-btn" onClick={share} aria-label="Share this page">
      <IconShare size={22} />
    </button>
  );
}
