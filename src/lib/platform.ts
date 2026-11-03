import { useSyncExternalStore } from "react";

export type Platform = "ios" | "android" | "pwa";

const noop = () => () => {};

function readPlatform(): Platform {
  return (document.documentElement.getAttribute("data-platform") as Platform) || "pwa";
}

/* Static HTML is prerendered as "pwa"; components re-render with the real
   platform right after hydration. */
export function usePlatform(): Platform {
  return useSyncExternalStore(noop, readPlatform, () => "pwa");
}

export function isNative(): boolean {
  const cap = (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
}

/* The real OS inside the Capacitor shell ("android" / "ios"), or null on the web. */
export function nativeOS(): string | null {
  return document.documentElement.getAttribute("data-native");
}
