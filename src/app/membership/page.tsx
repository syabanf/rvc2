import type { Metadata } from "next";
import { RawGuest } from "@/components/RawGuest";
import { RawMember } from "@/components/RawMember";
import { Screen } from "@/components/Screen";

export const metadata: Metadata = {
  title: "RAW Membership",
  description: "RAW — the Raw Vision Collective membership.",
};

/* Guests see the pitch, members their card and perks. html[data-member]
   picks the right half before hydration, so neither flashes. */
export default function MembershipPage() {
  return (
    <Screen title="RAW Membership" overlay className="membership-page">
      <div data-guest-only="">
        <RawGuest />
      </div>
      <div data-member-only="" className="rawmember-wrap">
        <RawMember />
      </div>
    </Screen>
  );
}
