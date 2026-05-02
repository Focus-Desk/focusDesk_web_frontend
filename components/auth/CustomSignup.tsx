"use client";

import React, { useState } from "react";
import { useRegisterMutation, useVerifyOTPMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";

const CustomSignup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState<"SIGNUP" | "OTP">("SIGNUP");
    const [otp, setOtp] = useState("");

    const [register, { isLoading }] = useRegisterMutation();
    const [verifyOTP, { isLoading: isVerifyLoading }] = useVerifyOTPMutation();
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const result = await register({
                email,
                password,
                role: "LIBRARIAN",
                // Other fields are optional and handled by the backend defaults
            }).unwrap();

            if (result.success) {
                toast.success(result.message || "OTP sent to your email!");
                setStep("OTP");
            } else {
                toast.error(result.message || "Registration failed");
            }
        } catch (err: any) {
            toast.error(err.data?.message || "Registration failed. Please try again.");
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await verifyOTP({ email, code: otp }).unwrap();
            if (result.success) {
                if (result.data?.token) {
                    localStorage.setItem("token", result.data.token);
                }
                toast.success("Verification successful! You are now logged in.");
                router.push("/librarian/dashboard");
            } else {
                toast.error(result.message || "Verification failed");
            }
        } catch (err: any) {
            toast.error(err.data?.message || "Invalid or expired OTP");
        }
    };

    const isAnyLoading = isLoading || isVerifyLoading;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-3xl shadow-xl shadow-blue-500/5 border border-gray-100 p-8 md:p-10">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white mb-6 shadow-lg shadow-blue-500/30">
                            <UserPlus className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                            {step === "SIGNUP" ? "Librarian Signup" : "Verify Email"}
                        </h1>
                        <p className="text-gray-500 font-medium">
                            {step === "SIGNUP" ? "Create your account to start managing your library" : "Enter the OTP sent to your email"}
                        </p>
                    </div>

                    {step === "SIGNUP" ? (
                        <form onSubmit={handleSignup} className="space-y-6">
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
                            <Label htmlFor="password" className="text-sm font-semibold text-gray-700 ml-1">
                                Password
                            </Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 ml-1">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-11 pr-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                    required
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
                            disabled={isAnyLoading}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                        >
                            {isAnyLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>
                    ) : (
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
                                    "Verify OTP & Login"
                                )}
                            </Button>

                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep("SIGNUP")}
                                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                                >
                                    Back to Signup
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-10 text-center">
                        <p className="text-gray-500 text-sm">
                            Already have an account?{" "}
                            <button
                                onClick={() => router.push("/signin")}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CustomSignup;
