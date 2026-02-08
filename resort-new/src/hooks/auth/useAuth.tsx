// src/hooks/auth/useAuth.tsx
"use client";

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api'; 
import { auth as authUtils, User } from '@/lib/auth';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const validateSession = useCallback(async () => {
    const token = authUtils.getToken();
    if (token) {
      try {
        const userData = await api.getCurrentUser(); // Client-side: api.ts uses localStorage token
        if (userData && userData.id) {
          authUtils.setUser(userData);
          setUser(userData);
        } else {
          authUtils.clearAuth();
          setUser(null);
        }
      } catch (error) {
        console.warn("Session validation failed (token likely expired or invalid):", error);
        authUtils.clearAuth();
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []); // No dependencies, should run once on mount

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    let success = false;
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Login Failed',
          description: data.error || data.detail || 'Invalid credentials or server error.',
          variant: 'destructive',
        });
        throw new Error(data.error || data.detail || 'Login failed');
      }

      if (data.user && data.accessToken) {
        authUtils.setToken(data.accessToken);
        authUtils.setUser(data.user);
        setUser(data.user);
        toast({ title: 'Login successful', description: `Welcome back!` });

        const params = new URLSearchParams(window.location.search);
        const redirectPath = params.get('redirect');

        if (redirectPath) {
          router.push(redirectPath);
        } else if (data.user.role === 'ADMIN' || data.user.role === 'MANAGER') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
        success = true;
      } else {
        throw new Error('Invalid response from login API.');
      }
    } catch (error: any) {
      if (!(error.message?.includes('Invalid response from login API') || error.message?.includes('Login failed'))) {
        toast({
          title: 'Login Error',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
      authUtils.clearAuth();
      setUser(null);
      console.error("Login error in useAuth:", error.message);
    } finally {
      setIsLoading(false);
    }
    return success;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    let success = false;
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast({
          title: 'Registration Failed',
          description: data.error || data.detail || 'Could not create account.',
          variant: 'destructive',
        });
        throw new Error(data.error || data.detail || 'Failed to register');
      }

      if (data.user && data.accessToken) { // If auto-login response
        authUtils.setToken(data.accessToken);
        authUtils.setUser(data.user);
        setUser(data.user);
        toast({ title: 'Registration Successful', description: 'You are now logged in.' });
        if (data.user.role === 'ADMIN' || data.user.role === 'MANAGER') router.push('/admin/dashboard');
        else router.push('/');
      } else {
        toast({ title: 'Registration Successful', description: 'Please log in with your new account.' });
        router.push('/login');
      }
      success = true;
    } catch (error: any) {
      if (!(error.message?.includes('Failed to register') || error.message?.includes('Could not create account'))) {
        toast({
          title: 'Registration Error',
          description: error.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
      console.error("Registration error in useAuth:", error.message);
    } finally {
      setIsLoading(false);
    }
    return success;
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' }); // Call Next.js API route for logout
    } catch (error) {
      console.error('Call to /api/auth/logout failed, but proceeding with client-side logout:', error);
    } finally {
      authUtils.clearAuth();
      setUser(null);
      toast({ title: 'Logged Out', description: 'Successfully logged out.' });
      router.push('/login');
      setIsLoading(false);
    }
  };

  const value = { user, isLoading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}