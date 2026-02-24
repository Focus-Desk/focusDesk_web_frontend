"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Search,
    Filter,
    ClipboardList,
    CreditCard,
    Banknote,
    Zap,
    CheckCircle2,
    XCircle,
    User,
    Calendar,
    Clock,
    MoreHorizontal,
    Loader2,
    Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    useGetLibraryBookingsQuery,
    useApproveBookingMutation,
    useRejectBookingMutation,
} from "@/state/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface LibraryBookingsProps {
    libraryId: string;
}

type BookingTab = "ALL" | "CASH" | "ONLINE_RECEPTION" | "RAZORPAY";

const TAB_CONFIG = [
    { id: "ALL" as BookingTab, label: "All Bookings", icon: ClipboardList },
    { id: "CASH" as BookingTab, label: "Cash on reception", icon: Banknote },
    { id: "ONLINE_RECEPTION" as BookingTab, label: "Online on reception", icon: Zap },
    { id: "RAZORPAY" as BookingTab, label: "Online through Razorpay", icon: CreditCard },
];

export default function LibraryBookings({ libraryId }: LibraryBookingsProps) {
    const [activeTab, setActiveTab] = useState<BookingTab>("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: bookingsData, isLoading } = useGetLibraryBookingsQuery({
        libraryId,
        filter: activeTab,
    });

    const [approveBooking, { isLoading: isApproving }] = useApproveBookingMutation();
    const [rejectBooking, { isLoading: isRejecting }] = useRejectBookingMutation();

    const bookings = bookingsData?.data || [];

    const filteredBookings = useMemo(() => {
        if (!searchQuery) return bookings;
        const q = searchQuery.toLowerCase();
        return bookings.filter((b: any) =>
            b.student.firstName?.toLowerCase().includes(q) ||
            b.student.lastName?.toLowerCase().includes(q) ||
            b.student.username?.toLowerCase().includes(q) ||
            b.student.phoneNumber?.includes(q)
        );
    }, [bookings, searchQuery]);

    const handleApprove = async (id: string) => {
        try {
            await approveBooking(id).unwrap();
            toast.success("Booking approved successfully");
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to approve booking");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to reject this booking?")) return;
        try {
            await rejectBooking(id).unwrap();
            toast.success("Booking rejected successfully");
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to reject booking");
        }
    };

    const getModeLabel = (transactions: any[]) => {
        if (!transactions || transactions.length === 0) return "N/A";
        const t = transactions[0];
        if (t.razorpayPaymentId) return "Online through Razorpay";
        if (t.paymentMethod === "CASH") return "Cash on reception";
        return "Online on reception";
    };

    return (
        <div className="space-y-6">
            {/* Header with Search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100/80 rounded-2xl w-full lg:w-auto">
                    {TAB_CONFIG.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                            )}
                        >
                            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-blue-500" : "text-gray-400")} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full lg:w-72 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="search"
                        placeholder="Search student or ID..."
                        className="w-full bg-white border border-gray-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Bookings List */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Mode of Payment</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="h-10 bg-gray-100 rounded-xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center">
                                                <ClipboardList className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No bookings found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking: any) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={booking.id}
                                        className="hover:bg-gray-50/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm border-2 border-white shadow-sm ring-1 ring-blue-100">
                                                    {booking.student.firstName?.[0] || booking.student.username?.[0]?.toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 text-sm">
                                                        {booking.student.firstName} {booking.student.lastName}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {booking.student.phoneNumber}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">
                                            {booking.student.id.slice(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-700">
                                                {getModeLabel(booking.transactions)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">
                                                    ₹{booking.totalAmount}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {booking.plan.planName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                    {format(new Date(booking.createdAt), "dd MMM, yyyy")}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(booking.createdAt), "hh:mm aa")}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            {booking.status === "PENDING" ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleApprove(booking.id)}
                                                        disabled={isApproving}
                                                        className="h-9 w-9 p-0 rounded-xl bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-100 transition-all active:scale-95"
                                                    >
                                                        {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5" />}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleReject(booking.id)}
                                                        disabled={isRejecting}
                                                        className="h-9 w-9 p-0 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all active:scale-95"
                                                    >
                                                        {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-5 w-5" />}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Badge
                                                    className={cn(
                                                        "rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border",
                                                        booking.status === "ACTIVE"
                                                            ? "bg-green-50 text-green-600 border-green-100"
                                                            : "bg-gray-50 text-gray-500 border-gray-100 shadow-sm"
                                                    )}
                                                >
                                                    {booking.status}
                                                </Badge>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
