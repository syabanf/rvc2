import type { ReactNode, SVGProps } from "react";

type IconProps = { size?: number; strokeWidth?: number } & Omit<SVGProps<SVGSVGElement>, "children">;

function Stroke({ size = 24, strokeWidth = 1.6, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconHome = (p: IconProps) => <Stroke {...p}><path d="M4 11l8-7 8 7v9h-5v-6h-6v6H4z" /></Stroke>;
export const IconMedia = (p: IconProps) => <Stroke {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9l5 3-5 3z" /></Stroke>;
export const IconBag = (p: IconProps) => <Stroke {...p}><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></Stroke>;
export const IconCalendar = (p: IconProps) => <Stroke {...p}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></Stroke>;
export const IconLock = (p: IconProps) => <Stroke {...p}><rect x="5" y="11" width="14" height="10" rx="1" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Stroke>;
export const IconShare = (p: IconProps) => <Stroke {...p}><path d="M12 4v11M8 8l4-4 4 4M5 13v7h14v-7" /></Stroke>;
export const IconDownload = (p: IconProps) => <Stroke {...p}><path d="M12 4v12M6 10l6 6 6-6M4 20h16" /></Stroke>;
export const IconInstall = (p: IconProps) => <Stroke strokeWidth={1.8} {...p}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></Stroke>;
export const IconClose = (p: IconProps) => <Stroke strokeWidth={1.8} {...p}><path d="M6 6l12 12M18 6L6 18" /></Stroke>;
export const IconBack = (p: IconProps) => <Stroke strokeWidth={2} {...p}><path d="M15 5l-7 7 7 7" /></Stroke>;
export const IconCheck = (p: IconProps) => <Stroke strokeWidth={2} {...p}><path d="M5 12l5 5 9-10" /></Stroke>;
export const IconPin = (p: IconProps) => <Stroke {...p}><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></Stroke>;
export const IconTicket = (p: IconProps) => <Stroke {...p}><path d="M4 8h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z" /></Stroke>;
export const IconBell = (p: IconProps) => <Stroke {...p}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20a2 2 0 0 0 4 0" /></Stroke>;
export const IconWallet = (p: IconProps) => <Stroke {...p}><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /></Stroke>;
export const IconAddSquare = (p: IconProps) => <Stroke {...p}><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8M8 12h8" /></Stroke>;

/* Long, thin editorial arrow (no circle), used for carousel steps. */
export function IconArrowLong({ dir = 1, size = 44 }: { dir?: 1 | -1; size?: number }) {
  return (
    <svg width={size} height={size * 0.4} viewBox="0 0 44 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g transform={dir === -1 ? "translate(44 0) scale(-1 1)" : undefined}>
        <path d="M2 9h38M32 2l8 7-8 7" />
      </g>
    </svg>
  );
}

export const IconUser = (p: IconProps) => <Stroke {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></Stroke>;
export const IconSun = (p: IconProps) => <Stroke {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Stroke>;
export const IconMoon = (p: IconProps) => <Stroke {...p}><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></Stroke>;

export function IconPause({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function IconPlay({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4l13 8-13 8z" />
    </svg>
  );
}
