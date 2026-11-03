"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useToast } from "./toast";

/* Called when a guest taps member-only content: explain, then go to RAW. */
export function useMemberGate() {
  const toast = useToast();
  const router = useRouter();
  return useCallback(() => {
    toast("RAW members only — join to unlock.");
    setTimeout(() => router.push("/membership/"), 900);
  }, [toast, router]);
}
