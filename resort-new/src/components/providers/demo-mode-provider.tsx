"use client";

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';

type DemoModeContextValue = {
  demoMode: boolean;
  isLoading: boolean;
};

const DemoModeContext = createContext<DemoModeContextValue>({ demoMode: false, isLoading: true });

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [demoMode, setDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const meta = await api.getMeta();
        if (!cancelled) {
          setDemoMode(Boolean(meta?.demo_mode));
        }
      } catch {
        if (!cancelled) {
          setDemoMode(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ demoMode, isLoading }), [demoMode, isLoading]);

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}
