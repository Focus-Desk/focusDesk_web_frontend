"use client";

import React, { useState } from "react";
import { useLoginMutation } from "@/state/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";

const CustomLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [login, { isLoading }] = useLoginMutation();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await login({ email, password }).unwrap();
            if (result.success) {
                toast.success("Login successful!");
                router.push("/librarian/dashboard");
            } else {
                toast.error(result.message || "Login failed");
            }
        } catch (err: any) {
            toast.error(err.data?.message || "Invalid credentials");
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
                            <LogIn className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                            Librarian Login
                        </h1>
                        <p className="text-gray-500 font-medium">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>

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
                                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-11 h-12 bg-gray-50/50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                    required
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                        >
                            {isLoading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

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
