import type { Metadata } from "next";
import { EventGallery } from "@/components/EventGallery";
import { Screen } from "@/components/Screen";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past Raw Vision Collective events in Jakarta.",
};

export default function EventsPage() {
  return (
    <Screen title="Events">
      <h1 className="sr-only">Events</h1>
      <EventGallery />
    </Screen>
  );
}
