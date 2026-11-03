"use client";

import { useSyncExternalStore } from "react";
import { setMember } from "@/lib/member";
import { usePlatform } from "@/lib/platform";
import { store } from "@/lib/storage";
import { IconWallet } from "./icons";
import { useToast } from "./toast";

export function JoinButton({ className, children }: { className: string; children: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        // INTEGRATION: open your subscription checkout / invite-code flow.
        setMember(true);
        toast("Welcome to RAW.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      {children}
    </button>
  );
}

export function LeaveButton() {
  const toast = useToast();
  return (
    <button
      type="button"
      className="btn btn--ghost btn--block"
      style={{ marginTop: 24 }}
      onClick={() => {
        setMember(false);
        toast("Signed out of RAW.");
        window.scrollTo({ top: 0 });
      }}
    >
      Sign out of RAW
    </button>
  );
}

const WALLETS = {
  apple: "Add to Apple Wallet",
  google: "Add to Google Wallet",
} as const;

const WALLET_NOTE = {
  ios: "Your card appears on the Lock Screen when you arrive at the venue.",
  android: "Your pass shows up on your phone when you arrive at the venue.",
  pwa: "Save your card to your phone wallet for faster entry.",
} as const;

/* Apple Wallet on iOS, Google Wallet on Android, both on the web. */
export function WalletButtons() {
  const platform = usePlatform();
  const toast = useToast();
  const kinds: (keyof typeof WALLETS)[] =
    platform === "ios" ? ["apple"] : platform === "android" ? ["google"] : ["apple", "google"];
  return (
    <>
      {kinds.map((kind) => (
        <button
          key={kind}
          type="button"
          className="btn btn--wallet btn--block"
          style={{ marginTop: 12 }}
          // INTEGRATION: link to a signed .pkpass (Apple) or a Google Wallet save URL.
          onClick={() => toast("Wallet pass will be issued by the RVC server.")}
        >
          <IconWallet size={20} />
          {WALLETS[kind]}
        </button>
      ))}
      <p className="wallet-note">{WALLET_NOTE[platform]}</p>
    </>
  );
}

/* Local preference toggle, remembered per device. */
const prefListeners = new Set<() => void>();
const subscribePref = (fn: () => void) => {
  prefListeners.add(fn);
  return () => prefListeners.delete(fn);
};

export function PrefSwitch({ id, pref, defaultOn = true }: { id: string; pref: string; defaultOn?: boolean }) {
  const key = `rvc-pref-${pref}`;
  const read = () => {
    const saved = store.get(key);
    return saved === null ? defaultOn : saved === "1";
  };
  const on = useSyncExternalStore(subscribePref, read, () => defaultOn);
  return (
    <span className="switch">
      <input
        id={id}
        type="checkbox"
        checked={on}
        onChange={(e) => {
          store.set(key, e.target.checked ? "1" : "0");
          prefListeners.forEach((fn) => fn());
        }}
      />
      <span className="switch__track" />
      <span className="switch__thumb" />
    </span>
  );
}
