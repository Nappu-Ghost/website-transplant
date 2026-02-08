"use client";

import React from 'react';
import { AuthProvider } from '@/hooks/auth/useAuth';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}