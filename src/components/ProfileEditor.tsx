"use client";

import { useState, type FormEvent } from "react";
import { profileOptions } from "@/data/content";
import { clearProfile, photoToDataUrl, saveProfile, useProfile, type Profile } from "@/lib/profile";
import { Sheet } from "./Sheet";
import { useToast } from "./toast";

/* Profile form in a sheet: everything optional, saved on this device. */
export function ProfileEditor({ open, onClose }: { open: boolean; onClose: () => void }) {
  const saved = useProfile();
  return (
    <Sheet open={open} onClose={onClose} title="Your profile">
      {/* Mounted only while open, so it starts from the saved values each time. */}
      {open && <Form initial={saved} onDone={onClose} />}
    </Sheet>
  );
}

// ISO 3166 region codes; names come from the browser in English.
const REGIONS =
  "AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW".split(" ");

function CountryList() {
  let names: string[] = [];
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    names = REGIONS.map((c) => dn.of(c) ?? c).sort((a, b) => a.localeCompare(b));
  } catch {}
  return (
    <datalist id="pf-countries">
      {names.map((n) => (
        <option key={n} value={n} />
      ))}
    </datalist>
  );
}

function Form({ initial, onDone }: { initial: Profile; onDone: () => void }) {
  const [p, setP] = useState<Profile>(initial);
  const [artist, setArtist] = useState("");
  const toast = useToast();
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((x) => ({ ...x, [k]: v }));
  const toggle = (k: "genres" | "artists", v: string) =>
    setP((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((y) => y !== v) : [...x[k], v] }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    saveProfile({ ...p, name: p.name.trim(), instagram: p.instagram.trim().replace(/^@/, "") });
    toast("Profile saved.");
    onDone();
  };

  const artists = Array.from(new Set([...profileOptions.artists, ...p.artists]));

  return (
    <form className="pform" onSubmit={submit}>
      <div className="pform__photo">
        <span className="pform__avatar" style={p.photo ? { backgroundImage: `url(${p.photo})` } : undefined}>
          {!p.photo && (p.name.trim()[0]?.toUpperCase() || "?")}
        </span>
        <label className="btn btn--ghost">
          {p.photo ? "Change photo" : "Add a photo"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                set("photo", await photoToDataUrl(f));
              } catch {
                toast("Couldn't read that image.");
              }
            }}
          />
        </label>
        {p.photo && (
          <button type="button" className="text-link" onClick={() => set("photo", "")}>
            Remove
          </button>
        )}
      </div>

      <div className="field">
        <label htmlFor="pf-name">Name</label>
        <input id="pf-name" value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="What should we call you?" autoComplete="name" />
      </div>

      <fieldset className="pform__group">
        <legend className="eyebrow">Country</legend>
        <div className="pform__chips">
          {profileOptions.countries.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={p.country === c} onClick={() => set("country", p.country === c ? "" : c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="pform__add">
          <input
            list="pf-countries"
            value={profileOptions.countries.includes(p.country) ? "" : p.country}
            onChange={(e) => set("country", e.target.value)}
            placeholder="Other country"
            aria-label="Other country"
            autoComplete="country-name"
          />
        </div>
        <CountryList />
      </fieldset>

      <fieldset className="pform__group">
        <legend className="eyebrow">Your sound · pick any</legend>
        <div className="pform__chips">
          {profileOptions.genres.map((g) => (
            <button key={g.id} type="button" className="chip" aria-pressed={p.genres.includes(g.id)} onClick={() => toggle("genres", g.id)}>
              {g.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="pform__group">
        <legend className="eyebrow">Artists on repeat</legend>
        <div className="pform__chips">
          {artists.map((a) => (
            <button key={a} type="button" className="chip" aria-pressed={p.artists.includes(a)} onClick={() => toggle("artists", a)}>
              {a}
            </button>
          ))}
        </div>
        <div className="pform__add">
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (artist.trim()) toggle("artists", artist.trim());
                setArtist("");
              }
            }}
            placeholder="Add another artist"
            aria-label="Add another artist"
          />
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              if (artist.trim()) toggle("artists", artist.trim());
              setArtist("");
            }}
          >
            Add
          </button>
        </div>
      </fieldset>

      <fieldset className="pform__group">
        <legend className="eyebrow">How did you find RVC?</legend>
        <div className="pform__chips">
          {profileOptions.foundVia.map((f) => (
            <button key={f} type="button" className="chip" aria-pressed={p.foundVia === f} onClick={() => set("foundVia", p.foundVia === f ? "" : f)}>
              {f}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="fields">
        <div className="field">
          <label htmlFor="pf-ig">Instagram</label>
          <input id="pf-ig" value={p.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@handle" autoCapitalize="none" />
        </div>
        <div className="field">
          <label htmlFor="pf-email">Email · for RSVPs</label>
          <input id="pf-email" type="email" value={p.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="pf-phone">WhatsApp · for RSVPs</label>
          <input id="pf-phone" type="tel" value={p.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+62 8xx xxxx xxxx" autoComplete="tel" />
        </div>
      </div>

      <div className="sheet__actions">
        <button type="submit" className="btn btn--primary btn--block">
          Save profile
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={() => {
            clearProfile();
            toast("Profile cleared.");
            onDone();
          }}
        >
          Clear profile
        </button>
        <p className="note">Saved on this device only for now.</p>
      </div>
    </form>
  );
}
