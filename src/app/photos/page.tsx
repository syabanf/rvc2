import type { Metadata } from "next";
import { PhotoAlbums } from "@/components/PhotoAlbums";
import { Screen } from "@/components/Screen";

export const metadata: Metadata = {
  title: "Photos",
  description: "Photo albums from every Raw Vision Collective show.",
};

export default function PhotosPage() {
  return (
    <Screen title="Photos" overlay>
      <PhotoAlbums />
    </Screen>
  );
}
