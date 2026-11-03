import { useSyncExternalStore } from "react";
import { store } from "./storage";

/* The visitor's profile, used to personalise the app (greeting, RAW card,
   RSVP prefill, picks on /profile/).
   INTEGRATION: save to the member's account instead of this device. */
export type Profile = {
  name: string;
  country: string;
  genres: string[]; // ids from profileOptions.genres
  artists: string[];
  foundVia: string;
  instagram: string;
  email: string;
  phone: string;
  photo: string; // small JPEG data URL, or ""
};

export const EMPTY_PROFILE: Profile = {
  name: "",
  country: "",
  genres: [],
  artists: [],
  foundVia: "",
  instagram: "",
  email: "",
  phone: "",
  photo: "",
};

const KEY = "rvc-profile";
const listeners = new Set<() => void>();
let cacheRaw: string | null | undefined;
let cache: Profile = EMPTY_PROFILE;

// Early profiles stored an Indonesian city; those become the country.
const OLD_CITIES = ["Jakarta", "Bandung", "Surabaya", "Bali", "Yogyakarta"];
function migrate(saved: Partial<Profile> & { city?: string }): Profile {
  const { city, ...rest } = saved;
  const p = { ...EMPTY_PROFILE, ...rest };
  if (!p.country && city && city !== "Elsewhere") p.country = OLD_CITIES.includes(city) ? "Indonesia" : city;
  return p;
}

function read(): Profile {
  const raw = store.get(KEY);
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    try {
      cache = raw ? migrate(JSON.parse(raw)) : EMPTY_PROFILE;
    } catch {
      cache = EMPTY_PROFILE;
    }
  }
  return cache;
}

export function saveProfile(p: Profile) {
  store.set(KEY, JSON.stringify(p));
  listeners.forEach((fn) => fn());
}

export function clearProfile() {
  store.del(KEY);
  listeners.forEach((fn) => fn());
}

export function useProfile(): Profile {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    read,
    () => EMPTY_PROFILE,
  );
}

export const firstName = (p: Profile) => p.name.trim().split(/\s+/)[0] ?? "";

/* Shrink an uploaded photo to a small square-ish JPEG so it fits in storage. */
export function photoToDataUrl(file: File, max = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}
