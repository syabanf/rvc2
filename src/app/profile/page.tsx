import type { Metadata } from "next";
import { ProfilePage } from "@/components/ProfilePage";
import { Screen } from "@/components/Screen";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your Raw Vision Collective profile.",
};

export default function Profile() {
  return (
    <Screen title="Profile" overlay className="profile-page">
      <ProfilePage />
    </Screen>
  );
}
