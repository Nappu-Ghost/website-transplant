"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ThemeProvider from "@/components/admin/ThemeProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.push("/login?callbackUrl=/admin");
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated or not admin, don't render content (will redirect)
  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <AdminSidebar />
        <div className="flex-1 overflow-auto w-full">
          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
