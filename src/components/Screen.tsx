import type { ReactNode } from "react";
import { TabBar } from "./nav";
import { InstallSheet } from "./pwa";
import { ToastOutlet } from "./toast";
import { Topbar, type TopbarAction } from "./Topbar";

type ScreenProps = {
  /* Shown in the top bar (iOS: on scroll, Android: always). */
  title: string;
  tabbar?: boolean;
  back?: { href: string; label: string };
  action?: TopbarAction;
  /* Transparent top bar over a full-bleed hero until the page scrolls. */
  overlay?: boolean;
  /* Extra class on the page wrapper, for page-specific layout rules. */
  className?: string;
  children: ReactNode;
};

/* Page frame: top bar, <main>, tab bar. The theme class lives on <body>
   (set before paint by THEME_SCRIPT); the no-tabbar class sits here. */
export function Screen({ title, tabbar = true, back, action, overlay, className, children }: ScreenProps) {
  const classes = ["screen", !tabbar && "no-tabbar", className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <Topbar title={title} back={back} action={action} overlay={overlay} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      {tabbar && <TabBar />}
      <ToastOutlet />
      <InstallSheet />
    </div>
  );
}
