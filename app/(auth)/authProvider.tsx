"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import CustomLogin from "@/components/auth/CustomLogin";
import { api } from "@/state/api";
import { Loader2 } from "lucide-react";

const FullPageLoader = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-gray-500 font-medium animate-pulse">{message}</p>
    </div>
  </div>
);

const Auth = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage = pathname.startsWith("/librarian");

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const {
    data: authData,
    isLoading: authLoading,
    isFetching: authFetching,
    isError: authError,
  } = api.useGetAuthUserQuery();

  const isAuthenticated = !!authData && !authError;

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (isAuthenticated && isAuthPage) {
      router.push("/librarian/dashboard");
    }
  }, [isAuthenticated, isAuthPage, router]);

  // Wait for hydration
  if (!mounted) return <FullPageLoader />;

  // Only gate DASHBOARD pages behind auth
  if (isDashboardPage) {
    if (authLoading) {
      return <FullPageLoader message="Loading your dashboard..." />;
    }
    if (!isAuthenticated) {
      return <CustomLogin />;
    }
  }

  // Public pages & auth pages render immediately
  return <>{children}</>;
};

export default Auth;