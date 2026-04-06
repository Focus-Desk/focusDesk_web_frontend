"use client";

import React, { useState } from "react";
import { useLoginMutation, useVerifyOTPMutation, useForgotPasswordMutation, useResetPasswordMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff, KeyRound } from "lucide-react";

const CustomLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"LOGIN" | "OTP" | "FORGOT_PASSWORD" | "FORGOT_PASSWORD_OTP">("LOGIN");

    const [login, { isLoading: isLoginLoading }] = useLoginMutation();
    const [verifyOTP, { isLoading: isVerifyLoading }] = useVerifyOTPMutation();
    const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
    const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await login({ email, password }).unwrap();
            if (result.success) {
                if (result.data?.requiresOTP) {
                    toast.success(result.message || "OTP sent to your email!");
                    setStep("OTP");
                } else {
                    localStorage.removeItem("token");
                    toast.success("Login successful!");
                    router.push("/librarian/dashboard");
                }
            } else {
                toast.error(result.message || "Login failed");
            }
        } catch (err: any) {
            toast.error(err.data?.message || "Invalid credentials");
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await verifyOTP({ email, code: otp }).unwrap();
            if (result.success) {
                localStorage.removeItem("token");
                toast.success("Login successful!");
                router.push("/librarian/dashboard");
            } else {
                toast.error(result.message || "Verification failed");
            }
        } catch (err: any) {
            toast.error(err.data?.message || "Invalid or expired OTP");
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await forgotPassword({ email }).unwrap();
            if (result.success) {
                toast.success(result.message || "OTP sent to your email!");
                setStep("FORGOT_PASSWORD_OTP");
            } else {
                toast.error(result.message || "Failed to send OTP");
            }
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to initiate password reset");
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            const result = await resetPassword({ email, otp, newPassword }).unwrap();
            if (result.success) {
                toast.success("Password reset successfully! Please log in with your new password.");
                setStep("LOGIN");
                setPassword("");
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                toast.error(result.message || "Password reset failed");
            }
        } catch (err: any) {
            toast.error(err.data?.message || "Invalid or expired OTP");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-gray-100 p-8 md:p-10">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-6 shadow-lg shadow-blue-500/30">
                            {step === "FORGOT_PASSWORD" || step === "FORGOT_PASSWORD_OTP" ? (
                                <KeyRound className="w-8 h-8" />
                            ) : (
                                <LogIn className="w-8 h-8" />
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                            {step === "FORGOT_PASSWORD" || step === "FORGOT_PASSWORD_OTP" ? "Reset Password" : "Librarian Login"}
                        </h1>
                        <p className="text-gray-500 font-medium">
                            {step === "FORGOT_PASSWORD" ? "Enter your email to receive an OTP" : step === "FORGOT_PASSWORD_OTP" ? "Enter OTP and your new password" : "Enter your credentials to access your dashboard"}
                        </p>
                    </div>

                    {step === "LOGIN" ? (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 ml-1">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@library.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                        required
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                        Password
                                    </Label>
                                    <button
                                        type="button"
                                        onClick={() => setStep("FORGOT_PASSWORD")}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-11 pr-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                        required
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoginLoading}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                            >
                                {isLoginLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    ) : step === "OTP" ? (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="otp" className="text-sm font-semibold text-gray-700 ml-1">
                                    Verification Code
                                </Label>
                                <div className="relative border-gray-200 rounded-xl">
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="text-center tracking-widest text-xl h-14 bg-gray-50/50 focus:bg-white transition-all rounded-xl border-gray-200"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isVerifyLoading}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                            >
                                {isVerifyLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    "Verify OTP"
                                )}
                            </Button>

                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep("LOGIN")}
                                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    ) : step === "FORGOT_PASSWORD" ? (
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="forgot-email" className="text-sm font-semibold text-gray-700 ml-1">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="forgot-email"
                                        type="email"
                                        placeholder="name@library.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                        required
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={isForgotLoading}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                            >
                                {isForgotLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    "Send Request"
                                )}
                            </Button>
                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep("LOGIN")}
                                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="reset-otp" className="text-sm font-semibold text-gray-700 ml-1">
                                    Verification Code
                                </Label>
                                <div className="relative border-gray-200 rounded-xl">
                                    <Input
                                        id="reset-otp"
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="text-center tracking-widest text-xl h-12 bg-gray-50/50 focus:bg-white transition-all rounded-xl border-gray-200"
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password" className="text-sm font-semibold text-gray-700 ml-1">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pl-11 pr-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                        required
                                        minLength={8}
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="text-sm font-semibold text-gray-700 ml-1">
                                    Confirm New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-11 pr-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                        required
                                        minLength={8}
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isResetLoading}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                            >
                                {isResetLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>

                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep("LOGIN")}
                                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-10 text-center">
                        <p className="text-gray-500 text-sm">
                            Don't have an account?{" "}
                            <button
                                onClick={() => router.push("/signup")}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                Register Library
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CustomLogin;