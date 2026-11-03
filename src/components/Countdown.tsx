"use client";

import { useSyncExternalStore } from "react";

const subscribeSecond = (fn: () => void) => {
  const id = setInterval(fn, 1000);
  return () => clearInterval(id);
};
const nowSeconds = () => Math.floor(Date.now() / 1000);

const pad = (n: number) => String(n).padStart(2, "0");

/* Current time in whole seconds, ticking every second; null when prerendering. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribeSecond, nowSeconds, () => null);
}

/* Days / hours / min / sec until `to` (ISO string). Shows 00 while `to` is
   not a valid date, and on the prerendered HTML. */
export function Countdown({ to, label }: { to: string; label: string }) {
  const target = Date.parse(to) / 1000;
  const now = useNow();
  const left = now === null || Number.isNaN(target) ? 0 : Math.max(0, Math.floor(target - now));
  const parts = [
    [Math.floor(left / 86400), "Days"],
    [Math.floor((left % 86400) / 3600), "Hours"],
    [Math.floor((left % 3600) / 60), "Min"],
    [left % 60, "Sec"],
  ] as const;

  return (
    <div className="countdown" role="timer" aria-label={label}>
      {parts.map(([n, unit]) => (
        <div key={unit}>
          <b>{pad(n)}</b>
          <span>{unit}</span>
        </div>
      ))}
    </div>
  );
}
