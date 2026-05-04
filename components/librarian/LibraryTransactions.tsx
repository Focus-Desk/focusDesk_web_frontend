"use client";

import React, { useState, useMemo } from "react";
import {
    useGetLibraryBookingsQuery,
} from "@/state/api";
import {
    Search,
    Banknote,
    Zap,
    CreditCard,
    Calendar,
    Clock,
    User,
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle2,
    XCircle,
    Info,
    Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

interface LibraryTransactionsProps {
    libraryId: string;
}

export default function LibraryTransactions({ libraryId }: LibraryTransactionsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const today = format(new Date(), "yyyy-MM-dd");
    const [selectedDate, setSelectedDate] = useState(today);

    const { data: bookingsData, isLoading } = useGetLibraryBookingsQuery({
        libraryId,
        filter: "ALL",
    });

    const bookings = bookingsData?.data || [];

    // Flatten transactions from all bookings
    const transactions = useMemo(() => {
        const flatList: any[] = [];
        bookings.forEach((booking: any) => {
            if (booking.transactions && Array.isArray(booking.transactions)) {
                booking.transactions.forEach((tx: any) => {
                    flatList.push({
                        ...tx,
                        student: booking.student,
                        planName: booking.plan?.planName,
                        bookingId: booking.id,
                    });
                });
            }
        });

        let result = flatList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (selectedDate) {
            result = result.filter(tx => format(new Date(tx.createdAt), "yyyy-MM-dd") === selectedDate);
        }

        return result;
    }, [bookings, selectedDate]);

    const filteredTransactions = useMemo(() => {
        if (!searchQuery) return transactions;
        const q = searchQuery.toLowerCase();
        return transactions.filter((tx) =>
            tx.student.student?.firstName?.toLowerCase().includes(q) ||
            tx.student.student?.lastName?.toLowerCase().includes(q) ||
            tx.student.email?.toLowerCase().includes(q) ||
            tx.razorpayPaymentId?.toLowerCase().includes(q)
        );
    }, [transactions, searchQuery]);

    const handleStudentClick = (studentId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("studentId", studentId);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const getPaymentIcon = (method: string, razorpayId: string | null) => {
        if (razorpayId) return <CreditCard className="h-4 w-4 text-purple-500" />;
        if (method === "CASH") return <Banknote className="h-4 w-4 text-green-500" />;
        return <Zap className="h-4 w-4 text-amber-500" />;
    };

    const getPaymentLabel = (method: string, razorpayId: string | null) => {
        if (razorpayId) return "Razorpay Online";
        if (method === "CASH") return "Cash Payment";
        return "Manual Online";
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Transaction History</h2>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">
                            Track all incoming payments and financial records
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 px-3 text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Filter Date</span>
                    </div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-700 focus:ring-0 cursor-pointer"
                    />
                    {selectedDate && (
                        <button
                            onClick={() => setSelectedDate("")}
                            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"
                        >
                            <XCircle className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col lg:flex-row justify-end items-center gap-4">
                    <div className="relative w-full lg:w-72 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="search"
                            placeholder="Search student or transaction..."
                            className="w-full bg-white border border-gray-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Reference ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-6 py-6">
                                                <div className="h-4 bg-gray-100 rounded w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                                            No transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            key={tx.id}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleStudentClick(tx.student.id)}
                                                    className="flex items-center gap-3 group/student text-left"
                                                >
                                                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs ring-1 ring-blue-100 group-hover/student:bg-blue-600 group-hover/student:text-white transition-all">
                                                        {tx.student.student?.firstName?.[0] || tx.student.email?.[0]?.toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 text-sm group-hover/student:text-blue-600 transition-colors underline-offset-4 group-hover/student:underline decoration-blue-200">
                                                            {tx.student.student?.firstName} {tx.student.student?.lastName}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                            {tx.student.student?.phoneNumber || tx.student.email}
                                                        </span>
                                                    </div>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-mono font-bold text-gray-600">
                                                        {tx.razorpayPaymentId || "—"}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400">
                                                        {tx.planName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                ₹{tx.amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                    {getPaymentIcon(tx.paymentMethod, tx.razorpayPaymentId)}
                                                    {getPaymentLabel(tx.paymentMethod, tx.razorpayPaymentId)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge
                                                    className={cn(
                                                        "rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                                                        tx.paymentStatus === "COMPLETED" || tx.paymentStatus === "captured"
                                                            ? "bg-green-50 text-green-600 border-green-100"
                                                            : "bg-amber-50 text-amber-600 border-amber-100"
                                                    )}
                                                >
                                                    {tx.paymentStatus}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1 text-xs font-semibold text-gray-700">
                                                        <Calendar className="h-3 w-3 text-gray-400" />
                                                        {format(new Date(tx.createdAt), "dd MMM, yyyy")}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(tx.createdAt), "hh:mm aa")}
                                                    </div>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
