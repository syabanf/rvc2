"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { maxTickets, nextEvent, tiers } from "@/data/content";
import { useMember } from "@/lib/member";
import { useProfile } from "@/lib/profile";
import { IconCheck } from "./icons";
import { Sheet } from "./Sheet";
import { Stepper } from "./Stepper";
import { useToast } from "./toast";

export function RsvpForm() {
  const [tierValue, setTierValue] = useState(tiers[0].value);
  const [qty, setQty] = useState(1);
  const [doneEmail, setDoneEmail] = useState<string | null>(null);
  const member = useMember();
  const profile = useProfile();
  const toast = useToast();
  const tier = tiers.find((t) => t.value === tierValue) ?? tiers[0];

  const pickTier = (value: string) => {
    const next = tiers.find((t) => t.value === value);
    if (next?.raw && !member) {
      toast("RAW Presale is for members — join RAW first.");
      setTierValue(tiers[0].value);
      return;
    }
    setTierValue(value);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // INTEGRATION: POST the form to your booking API, then show the result.
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    setDoneEmail(email);
  };

  return (
    <>
      <form className="container narrow" noValidate action="#" method="post" onSubmit={submit}>
        <div className="page-head">
          <h1 className="page-title">RSVP</h1>
          <span className="page-sub">
            {nextEvent.artist} · {nextEvent.date} · {nextEvent.venue}
          </span>
        </div>

        <fieldset className="tiers">
          <legend className="step-label" style={{ paddingTop: 8 }}>
            01 — Choose access
          </legend>
          {tiers.map((t) => (
            <label key={t.value} className="tier">
              <input
                type="radio"
                name="tier"
                value={t.value}
                checked={t.value === tierValue}
                onChange={() => pickTier(t.value)}
              />
              <span>
                <span className="tier__name" style={{ display: "block" }}>
                  {t.name}
                </span>
                <span className={t.raw ? "tier__note tier__note--raw" : "tier__note"} style={{ display: "block" }}>
                  {t.note}
                </span>
              </span>
              <span className="tier__price">{t.price}</span>
            </label>
          ))}
        </fieldset>

        <div className="step-label" id="qty-label">
          02 — Quantity
        </div>
        <Stepper
          name="qty"
          value={qty}
          onChange={setQty}
          max={maxTickets}
          labelledBy="qty-label"
          hint={`Max ${maxTickets} per account`}
        />

        <div className="step-label">03 — Your details</div>
        {/* Prefilled from the profile; remounts once it has loaded. */}
        <div className="fields" key={`${profile.name}|${profile.email}|${profile.phone}`}>
          <div className="field">
            <label htmlFor="f-name">Full name (as on ID)</label>
            <input id="f-name" name="name" type="text" autoComplete="name" required placeholder="Name" defaultValue={profile.name} />
          </div>
          <div className="field">
            <label htmlFor="f-email">Email</label>
            <input
              id="f-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              placeholder="you@email.com"
              defaultValue={profile.email}
            />
          </div>
          <div className="field">
            <label htmlFor="f-phone">WhatsApp</label>
            <input
              id="f-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              required
              pattern="^\+?[0-9\s\-]{9,16}$"
              placeholder="+62 8xx xxxx xxxx"
              defaultValue={profile.phone}
            />
          </div>
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", fontSize: 14, color: "var(--fg-dim)" }}>
            <input
              type="checkbox"
              name="terms"
              required
              style={{ width: 20, height: 20, margin: 0, accentColor: "var(--accent)" }}
            />{" "}
            I agree to the event terms and the RVC privacy policy.
          </label>
        </div>

        <div className="actionbar">
          <div className="container narrow">
            <div>
              <div className="eyebrow">
                {qty} × {tier.name}
              </div>
              <div className="actionbar__total">{tier.total}</div>
            </div>
            <button type="submit" className="btn btn--primary">
              Confirm →
            </button>
          </div>
        </div>
      </form>

      <Sheet open={doneEmail !== null} onClose={() => setDoneEmail(null)} label="RSVP confirmed">
        <div className="success" role="status">
          <div className="success__icon">
            <IconCheck size={30} />
          </div>
          <h2>You&apos;re on the list</h2>
          <p>Confirmation and your entry QR are on the way to {doneEmail}.</p>
          <Link className="btn btn--ghost" href="/events/">
            Back to events
          </Link>
        </div>
      </Sheet>
    </>
  );
}
