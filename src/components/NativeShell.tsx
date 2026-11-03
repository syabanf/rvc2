"use client";

import { useEffect, useRef, useState } from "react";
import { nativeOS } from "@/lib/platform";
import { Sheet } from "./Sheet";

/* Behaviour that only matters inside the native app (Capacitor):
   - Android back button: close what's open → previous page → "Leave RVC?" dialog.
   - Launch splash: the YE Live film, once per app start (also for an installed PWA). */
export function NativeShell() {
  return (
    <>
      <BackButton />
      <LaunchSplash />
    </>
  );
}

function BackButton() {
  const [ask, setAsk] = useState(false);
  const exit = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!nativeOS()) return;
    let off: (() => void) | undefined;
    let cancelled = false;
    import("@capacitor/app").then(({ App }) => {
      exit.current = () => void App.exitApp().catch(() => {});
      App.addListener("backButton", ({ canGoBack }) => {
        // 1. An open sheet/dialog (incl. the exit dialog itself) closes first.
        const dlg = Array.from(document.querySelectorAll<HTMLDialogElement>("dialog[open]")).pop();
        if (dlg) {
          dlg.close();
          return;
        }
        // 2. Full-screen player / event detail listen for Escape.
        if (document.querySelector(".nplayer, .edetail")) {
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
          return;
        }
        // 3. Previous page, else ask before leaving.
        if (canGoBack && history.length > 1) history.back();
        else setAsk(true);
      }).then((h) => {
        if (cancelled) h.remove();
        else off = () => h.remove();
      });
    });
    return () => {
      cancelled = true;
      off?.();
    };
  }, []);

  return (
    <Sheet open={ask} onClose={() => setAsk(false)} label="Leave RVC?">
      <div className="exitask">
        <h2>Leave RVC?</h2>
        <p>Are you sure you want to exit the app?</p>
        <div className="exitask__actions">
          <button type="button" className="btn btn--ghost" onClick={() => setAsk(false)}>
            Stay
          </button>
          <button type="button" className="btn btn--primary" onClick={() => exit.current?.()}>
            Exit
          </button>
        </div>
      </div>
    </Sheet>
  );
}

const SPLASH_MS = 4200; // play this much of the film, then fade

function LaunchSplash() {
  const ref = useRef<HTMLVideoElement>(null);
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-splash") !== "1") return;
    const v = ref.current;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      root.setAttribute("data-splash", "out");
      setTimeout(() => root.removeAttribute("data-splash"), 600);
    };
    finishRef.current = finish;
    try {
      sessionStorage.setItem("rvc-splashed", "1");
    } catch {}
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(finish, still ? 900 : SPLASH_MS);
    // If the film can't start quickly, don't hold the app hostage.
    const guard = setTimeout(() => {
      if (!v || v.paused || v.currentTime === 0) finish();
    }, 2000);
    // The film is only fetched when the splash is actually showing.
    if (v && !still) {
      v.src = "/assets/video/rvc-reel.mp4";
      v.play().catch(finish);
    }
    v?.addEventListener("ended", finish);
    return () => {
      clearTimeout(t);
      clearTimeout(guard);
      v?.removeEventListener("ended", finish);
    };
  }, []);

  return (
    <div className="splash" aria-hidden="true" onClick={() => finishRef.current()}>
      <video ref={ref} muted playsInline preload="none" />
      <div className="splash__poster" />
      <div className="splash__shade" />
      <img className="splash__logo" src="/assets/img/rvc-logo-white.png" alt="" />
      <span className="splash__tag">YE — Live · Gelora Bung Karno</span>
      <span className="splash__skip">Tap to skip</span>
    </div>
  );
}
