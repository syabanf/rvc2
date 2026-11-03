import type { Metadata } from "next";
import { Screen } from "@/components/Screen";
import { VideoBrowse } from "@/components/VideoBrowse";

export const metadata: Metadata = {
  title: "Videos",
  description: "Exclusive videos from Raw Vision Collective shows.",
};

export default function VideosPage() {
  return (
    <Screen title="Videos" overlay>
      <VideoBrowse />
    </Screen>
  );
}
