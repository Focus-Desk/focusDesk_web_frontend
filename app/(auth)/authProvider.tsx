"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import CustomLogin from "@/components/auth/CustomLogin";
import { api } from "@/state/api";

const Auth = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname.match(/^\/(signin|signup)$/);
  const isDashboardPage = pathname.startsWith("/librarian");

  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for local token for librarians
  const hasLocalToken = typeof window !== "undefined" && !!localStorage.getItem("token");

  // Use getAuthUser to check authentication status
  const { data: authUser, isLoading: authLoading, isError: authError } = api.useGetAuthUserQuery(undefined, {
    skip: isAuthPage || !isDashboardPage,
  });

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (hasLocalToken && isAuthPage) {
      router.push("/librarian/dashboard");
    }
  }, [hasLocalToken, isAuthPage, router]);

  // Prevent hydration mismatch by waiting for client-side mount
  if (!mounted) {
    return null;
  }

  // Handle librarian authentication (this app is librarian-only)
  if (isDashboardPage && !hasLocalToken) {
    return <CustomLogin />;
  }

  // If we are on an auth page, just render the child (which will be CustomLogin or CustomSignup)
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Default to rendering children for public pages or already authenticated sessions
  return <>{children}</>;
};

export default Auth;