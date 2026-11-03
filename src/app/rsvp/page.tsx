import type { Metadata } from "next";
import { RsvpForm } from "@/components/RsvpForm";
import { Screen } from "@/components/Screen";

export const metadata: Metadata = {
  title: "RSVP",
  description: "RSVP or book tickets for the next Raw Vision Collective event.",
};

export default function RsvpPage() {
  return (
    <Screen title="RSVP" tabbar={false} back={{ href: "/events/", label: "Event" }}>
      <RsvpForm />
    </Screen>
  );
}
