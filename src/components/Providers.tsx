"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "./toast";
import { NativeShell } from "./NativeShell";
import { PwaProvider } from "./pwa";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <PwaProvider>
        {children}
        <NativeShell />
      </PwaProvider>
    </ToastProvider>
  );
}
