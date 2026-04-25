"use client";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import {
  UserCircle,
  Mail,
  ShieldCheck,
  CalendarDays,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Copy,
  Hash
} from "lucide-react";
import { format } from "date-fns";
import { useGetAuthUserQuery, useConnectGoogleMutation, useGetLibrariesByLibrarianQuery } from "@/state/api";

export default function LibrarianProfile() {
  const { data: authData, isLoading } = useGetAuthUserQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  const [connectGoogle, { isLoading: isConnecting }] = useConnectGoogleMutation();

  const profile = authData?.userInfo;
  const { data: librariesData } = useGetLibrariesByLibrarianQuery(
    (profile as any)?.userId ?? "",
    { skip: !profile }
  );

  const libraryId = librariesData && librariesData.length > 0 ? librariesData[0].id : null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // The backend might return isGoogleConnected directly on `userInfo.user.isGoogleConnected` based on getMe output
  // Wait, getMe returns librarian data: { id, firstName, lastName, ... user: { id, email, role, isGoogleConnected } }
  const isGoogleConnected = profile.user?.isGoogleConnected || false;

  const handleConnectGoogle = async (credentialResponse: any) => {
    try {
      if (!credentialResponse.credential) {
        toast.error("Google authentication failed");
        return;
      }

      const result = await connectGoogle({ idToken: credentialResponse.credential }).unwrap();
      if (result.success) {
        toast.success("Google account fully secured and connected!");
      } else {
        toast.error(result.message || "Failed to connect Google account");
      }
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to connect to Google");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <UserCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Your Profile</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              Manage your account settings and connected services
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Profile Info */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-blue-500/5">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <UserCircle className="w-6 h-6 text-blue-600" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">First Name</p>
                <p className="text-lg font-medium text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-100">{profile.firstName || "Not provided"}</p>
              </div>
              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Last Name</p>
                <p className="text-lg font-medium text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-100">{profile.lastName || "Not provided"}</p>
              </div>
              <div className="space-y-2.5 sm:col-span-2">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Email Address</p>
                <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <p className="text-lg font-medium text-gray-900">{profile.email}</p>
                </div>
              </div>

              {profile.phoneNumber && (
                <div className="space-y-2.5 sm:col-span-2">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Phone Number</p>
                  <div className="flex items-center gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                    <p className="text-lg font-medium text-gray-900">{profile.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-blue-500/5">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-blue-600" />
              Account Activity
            </h2>
            <div className="space-y-2.5">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Member Since</p>
              <p className="text-lg font-medium text-gray-900 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                {profile.user?.createdAt ? format(new Date(profile.user.createdAt), "MMMM do, yyyy") : "Unknown"}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-blue-500/5 hover:border-blue-100 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-xl flex-shrink-0 transition-colors ${isGoogleConnected
                ? "bg-green-100 text-green-600 group-hover:bg-green-200"
                : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                }`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Connected Services</h3>
            </div>

            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Link your Google account to enable single sign-on (SSO) ensuring rapid and secure entry directly into your dashboard.
            </p>

            <div className="space-y-4">
              {isGoogleConnected ? (
                <div className="flex items-center gap-3 bg-green-50/50 text-green-700 p-4 border border-green-200 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-bold">Google Connected</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-amber-50/50 text-amber-700 p-3 border border-amber-200 rounded-xl mb-4">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-xs font-semibold leading-tight">Link your Google credentials for seamless auth.</span>
                  </div>

                  {isConnecting ? (
                    <div className="flex items-center justify-center p-3">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <GoogleLogin
                        onSuccess={handleConnectGoogle}
                        onError={() => toast.error("Connection failed")}
                        useOneTap={false}
                        shape="pill"
                        text="continue_with"
                        size="medium"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 shadow-xl shadow-blue-500/25 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            <h3 className="text-lg font-bold text-white mb-2 relative z-10">Librarian Access</h3>
            <p className="text-blue-100 text-sm relative z-10 opacity-90 leading-relaxed mb-6">
              Your account carries elevated permissions for global library configuration. Always keep your credentials completely strictly secure.
            </p>

            {libraryId && (
              <div className="relative z-10 space-y-2">
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest flex items-center gap-1.5">
                  <Hash className="w-3 h-3" /> Assigned Library ID
                </p>
                <div className="flex items-center gap-2 group/copy cursor-pointer active:scale-[0.98] transition-all"
                  onClick={() => handleCopy(libraryId, "Library ID")}>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 flex items-center justify-between grow group-hover/copy:bg-white/20 transition-all shadow-inner">
                    <code className="text-white text-xs font-mono font-bold tracking-tight">
                      {libraryId}
                    </code>
                    <Copy className="w-4 h-4 text-blue-200 group-hover/copy:text-white transition-colors" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
