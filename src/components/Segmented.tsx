import Link from "next/link";

type Item = { href: string; label: string };

export function Segmented({ label, items, current }: { label: string; items: Item[]; current: string }) {
  return (
    <nav className="segmented" aria-label={label}>
      {items.map((it) => (
        <Link key={it.href} href={it.href} aria-current={it.href === current ? "page" : undefined}>
          {it.label}
        </Link>
      ))}
    </nav>
  );
}

export const MEDIA_TABS: Item[] = [
  { href: "/photos/", label: "Photos" },
  { href: "/videos/", label: "Videos" },
];

export function PageHead({ eyebrow, title, id }: { eyebrow: string; title: string; id?: string }) {
  return (
    <div className="page-head">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="page-title" id={id}>
        {title}
      </h1>
    </div>
  );
}
