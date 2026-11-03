import type { Metadata, Viewport } from "next";
import { Arimo, Noto_Sans_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { BOOT_SCRIPT, THEME_SCRIPT } from "@/lib/boot";
import "@/styles/base.css";
import "@/styles/platform-ios.css";
import "@/styles/platform-android.css";
import "@/styles/platform-pwa.css";
import "./globals.css";

/* Menlo / Helvetica are used where installed (Apple devices); these are the
   self-hosted fallbacks so the native apps also work offline. */
const arimo = Arimo({ variable: "--font-arimo", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const notoMono = Noto_Sans_Mono({ variable: "--font-noto-mono", subsets: ["latin"], weight: ["400", "500"] });

const description = "Exclusive photos, videos, merch and events from Raw Vision Collective.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { template: "%s — Raw Vision Collective", default: "Raw Vision Collective" },
  description,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/assets/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: "/assets/icons/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "RVC" },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Raw Vision Collective",
    description,
    images: "/assets/img/og-image.jpg",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-platform="pwa"
      data-member="0"
      className={`${arimo.variable} ${notoMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
