"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import CustomLogin from "@/components/auth/CustomLogin";
import { api } from "@/state/api";
import { Loader2 } from "lucide-react";

const FullPageLoader = ({ message = "Initializing focusDesk..." }: { message?: string }) => (
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use getAuthUser to check authentication status
  const {
    data: authData,
    isLoading: authLoading,
    isFetching: authFetching,
    isError: authError,
  } = api.useGetAuthUserQuery();

  const isAuthenticated = !!authData && !authError;

  // Check if a token exists in localStorage as a hint that login just happened
  const hasToken = mounted && typeof window !== "undefined" && !!localStorage.getItem("token");

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (isAuthenticated && isAuthPage) {
      router.push("/librarian/dashboard");
    }
  }, [isAuthenticated, isAuthPage, router]);

  // 1. Wait for hydration and initial auth load
  if (!mounted || authLoading) {
    return <FullPageLoader />;
  }

  // 2. If we're refetching (e.g., after tag invalidation post-login) and not yet confirmed, show loader
  if (authFetching && !isAuthenticated) {
    return <FullPageLoader message="Verifying session..." />;
  }

  // 3. Dashboard page: if unauthenticated but a token exists, the query might still be resolving
  if (isDashboardPage && !isAuthenticated && hasToken) {
    return <FullPageLoader message="Loading your dashboard..." />;
  }

  // 4. Dashboard page: truly unauthenticated (no token, no data) → show login
  if (isDashboardPage && !isAuthenticated) {
    return <CustomLogin />;
  }

  // 5. Auth pages or public pages
  return <>{children}</>;
};

export default Auth;