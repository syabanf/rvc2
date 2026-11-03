"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type ToastState = { message: string; visible: boolean };
type ToastApi = { toast: (message: string) => void };

const ApiContext = createContext<ToastApi>({ toast: () => {} });
const StateContext = createContext<ToastState>({ message: "", visible: false });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToastState>({ message: "", visible: false });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const toast = useCallback((message: string) => {
    setState({ message, visible: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState((s) => ({ ...s, visible: false })), 3200);
  }, []);
  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ApiContext.Provider value={api}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </ApiContext.Provider>
  );
}

export function useToast() {
  return useContext(ApiContext).toast;
}

/* Rendered inside each <Screen> so the toast picks up that screen's theme. */
export function ToastOutlet() {
  const { message, visible } = useContext(StateContext);
  return (
    <div className={visible ? "toast is-visible" : "toast"} role="status" aria-live="polite">
      {message}
    </div>
  );
}
