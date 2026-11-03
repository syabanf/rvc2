import { useSyncExternalStore } from "react";
import { store } from "./storage";

/* Membership state.
   INTEGRATION: replace isMember()/setMember() with your auth/session check.
   Content gated with data-member-only / data-guest-only (or useMember) must
   ALSO be protected server-side; this only controls what is shown. */
const KEY = "rvc-member";
const listeners = new Set<() => void>();

export function isMember(): boolean {
  return store.get(KEY) === "1";
}

export function setMember(on: boolean) {
  if (on) store.set(KEY, "1");
  else store.del(KEY);
  document.documentElement.setAttribute("data-member", on ? "1" : "0");
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    document.documentElement.setAttribute("data-member", isMember() ? "1" : "0");
    fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

export function useMember(): boolean {
  return useSyncExternalStore(subscribe, isMember, () => false);
}
