"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/useAuth';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('login');
  
  // Set active tab based on URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [searchParams]);
    // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectPath = searchParams.get('redirect');
      if (redirectPath) {
        router.push(redirectPath);
      } else if (user.role === 'ADMIN' || user.role === 'MANAGER') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    }
  }, [user, router, searchParams]);
  
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      await login(email, password);
    } catch (error) {
      // Error is handled inside the login function
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    if (password !== confirmPassword) {
      toast({
        title: 'Registration failed',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    try {
      await register(name, email, password);
    } catch (error) {
      // Error is handled inside the register function
    } finally {
      setIsLoading(false);
    }
  };

  // If checking authentication status, show a loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex flex-grow items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <main className="flex flex-grow items-center justify-center bg-gradient-to-b from-background to-teal-50 py-12 md:py-20">
        <motion.div
          className="w-full max-w-md px-4"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card className="shadow-xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger id="login-tab" value="login">Login</TabsTrigger>
                <TabsTrigger id="register-tab" value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <CardHeader className="text-center">
                  <div className="mb-4 flex justify-center">
                    <LogIn className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-primary">
                    Welcome Back!
                  </CardTitle>
                  <CardDescription>
                    Log in to access your resort account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email Address</Label>
                      <Input id="login-email" name="email" type="email" required placeholder="your.email@example.com" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <Label htmlFor="login-password">Password</Label>
                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Input id="login-password" name="password" type="password" required placeholder="••••••••" />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? 'Logging in...' : 'Log In'}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
              
              <TabsContent value="register">
                <CardHeader className="text-center">
                  <div className="mb-4 flex justify-center">
                    <UserPlus className="h-10 w-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-primary">
                    Create Account
                  </CardTitle>
                  <CardDescription>
                    Register to plan your next resort stay.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-name">Name</Label>
                      <Input id="register-name" name="name" type="text" required placeholder="John Doe" />
                    </div>
                    <div>
                      <Label htmlFor="register-email">Email Address</Label>
                      <Input id="register-email" name="email" type="email" required placeholder="your.email@example.com" />
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input id="register-password" name="password" type="password" required placeholder="••••••••" />
                    </div>
                    <div>
                      <Label htmlFor="register-confirm-password">Confirm Password</Label>
                      <Input id="register-confirm-password" name="confirmPassword" type="password" required placeholder="••••••••" />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </main>

      <AppFooter />
    </div>
  );
}
