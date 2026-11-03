import type { CapacitorConfig } from "@capacitor/cli";

/* Native shells for iOS and Android around the static Next.js export.
   Workflow: `npm run build` (writes out/) → `npx cap sync` → open in Xcode / Android Studio. */
const config: CapacitorConfig = {
  appId: "id.rawvision.app",
  appName: "RVC",
  webDir: "out",
  backgroundColor: "#0A0A0A",
  ios: {
    // Layouts handle the notch / Dynamic Island themselves via env(safe-area-inset-*).
    contentInset: "never",
  },
  plugins: {
    SystemBars: {
      // Every page sets viewport-fit=cover; hinting it avoids a layout jump on Android.
      initialViewportFitValueHint: "cover",
    },
  },
};

export default config;
