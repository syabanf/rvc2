import { useSyncExternalStore } from "react";
import { store } from "./storage";

export type Theme = "dark" | "light";

const KEY = "rvc-theme";
const listeners = new Set<() => void>();

const read = (): Theme => (document.body.classList.contains("theme-light") ? "light" : "dark");

/* Dark is the default; light is an opt-in white theme, remembered per device. */
export function setTheme(t: Theme) {
  document.body.classList.toggle("theme-light", t === "light");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "light" ? "#FFFFFF" : "#0A0A0A");
  if (t === "light") store.set(KEY, "light");
  else store.del(KEY);
  listeners.forEach((fn) => fn());
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    read,
    () => "dark",
  );
}
