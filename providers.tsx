"use client";

import StoreProvider from "@/state/redux";
import Auth from "./app/(auth)/authProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <StoreProvider>
        <Auth>{children}</Auth>
      </StoreProvider>
    </GoogleOAuthProvider>
  );
};

export default Providers;
