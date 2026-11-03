import type { Metadata } from "next";
import { MerchLab } from "@/components/MerchLab";
import { Screen } from "@/components/Screen";

export const metadata: Metadata = {
  title: "Shop",
  description: "Official Raw Vision Collective tour merch.",
};

/* One endless, looping plane of Drop 01 on every screen size. */
export default function MerchPage() {
  return (
    <Screen title="Shop" className="merch-page">
      <MerchLab />
    </Screen>
  );
}
