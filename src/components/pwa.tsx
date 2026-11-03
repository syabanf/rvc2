"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isNative } from "@/lib/platform";
import { Sheet } from "./Sheet";
import { useToast } from "./toast";
import { IconAddSquare, IconInstall, IconShare } from "./icons";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> };
type PwaApi = { install: () => void; sheetOpen: boolean; closeSheet: () => void };

const PwaContext = createContext<PwaApi>({ install: () => {}, sheetOpen: false, closeSheet: () => {} });

/* Native shell: finish a reload/deep link that boot.ts parked on "/". */
function NativeRoute() {
  const router = useRouter();
  useEffect(() => {
    let to: string | null = null;
    try {
      to = sessionStorage.getItem("rvc-route");
      sessionStorage.removeItem("rvc-route");
    } catch {}
    if (to && to !== "/") router.replace(to);
  }, [router]);
  return null;
}

/* PWA only: service worker, install prompt, iOS "Add to Home Screen" sheet.
   The install button is shown by CSS once <html> has the .can-install class. */
export function PwaProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const deferred = useRef<InstallPromptEvent | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-platform") !== "pwa" || isNative()) return;

    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production" && location.protocol !== "file:") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as { standalone?: boolean }).standalone === true;
    const isIOS =
      /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (!standalone && isIOS) root.classList.add("can-install");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferred.current = e as InstallPromptEvent;
      root.classList.add("can-install");
    };
    const onInstalled = () => {
      root.classList.remove("can-install");
      toast("RVC installed.");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [toast]);

  const install = useCallback(() => {
    const prompt = deferred.current;
    if (prompt) {
      prompt.prompt();
      prompt.userChoice.finally(() => {
        deferred.current = null;
      });
    } else {
      setSheetOpen(true);
    }
  }, []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const api = useMemo(() => ({ install, sheetOpen, closeSheet }), [install, sheetOpen, closeSheet]);

  return (
    <PwaContext.Provider value={api}>
      <NativeRoute />
      {children}
    </PwaContext.Provider>
  );
}

export function InstallButton() {
  const { install } = useContext(PwaContext);
  return (
    <button type="button" className="btn btn--ghost install-btn" onClick={install}>
      <IconInstall size={16} />
      Install app
    </button>
  );
}

export function InstallSheet() {
  const { sheetOpen, closeSheet } = useContext(PwaContext);
  return (
    <Sheet open={sheetOpen} onClose={closeSheet} title="Install the RVC app">
      <p className="dim" style={{ paddingBottom: 12 }}>
        Full screen, drop alerts and offline access — no app store needed.
      </p>
      <ol className="install-steps" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        <li>
          <span className="perk__n">01</span>
          <span style={{ flex: 1 }}>Tap Share in Safari</span>
          <IconShare size={20} />
        </li>
        <li>
          <span className="perk__n">02</span>
          <span style={{ flex: 1 }}>Choose “Add to Home Screen”</span>
          <IconAddSquare size={20} />
        </li>
        <li>
          <span className="perk__n">03</span>
          <span style={{ flex: 1 }}>Open RVC from your home screen</span>
        </li>
      </ol>
    </Sheet>
  );
}
