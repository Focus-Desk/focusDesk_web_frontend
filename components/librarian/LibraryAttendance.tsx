"use client";

import React, { useState, useMemo } from "react";
import { useGetLibraryAttendanceQuery } from "@/state/api";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CalendarDays,
    Search,
    Users,
    UserCheck,
    UserX,
    Clock,
    LogIn,
    LogOut,
    Timer,
    AlertTriangle,
    Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LibraryAttendanceProps {
    libraryId: string;
}

type StatusFilter = "ALL" | "PRESENT" | "LEFT" | "ABSENT" | "FLAGGED";

export default function LibraryAttendance({ libraryId }: LibraryAttendanceProps) {
    const today = format(new Date(), "yyyy-MM-dd");
    const [selectedDate, setSelectedDate] = useState(today);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

    const { data, isLoading, isFetching } = useGetLibraryAttendanceQuery(
        { libraryId, date: selectedDate },
        { skip: !libraryId }
    );

    const records: any[] = data?.data || [];

    const filteredRecords = useMemo(() => {
        let filtered = records;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (r: any) =>
                    r.studentName?.toLowerCase().includes(q) ||
                    r.email?.toLowerCase().includes(q) ||
                    r.phoneNumber?.includes(q)
            );
        }

        if (statusFilter !== "ALL") {
            if (statusFilter === "FLAGGED") {
                filtered = filtered.filter((r: any) => r.isFlagged);
            } else {
                filtered = filtered.filter((r: any) => r.status === statusFilter);
            }
        }

        return filtered;
    }, [records, searchQuery, statusFilter]);

    const formatDuration = (minutes: number) => {
        if (!minutes) return "—";
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const formatTime = (iso: string | null) => {
        if (!iso) return "—";
        return format(new Date(iso), "hh:mm a");
    };

    const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
        PRESENT: { label: "Present", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: UserCheck },
        LEFT: { label: "Left", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: LogOut },
        ABSENT: { label: "Absent", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: UserX },
    };

    const filterTabs: { key: StatusFilter; label: string; count?: number }[] = [
        { key: "ALL", label: "All", count: records.length },
        { key: "PRESENT", label: "Present", count: data?.presentCount || 0 },
        { key: "ABSENT", label: "Absent", count: data?.absentCount || 0 },
        { key: "LEFT", label: "Left", count: records.filter((r: any) => r.status === "LEFT").length },
        { key: "FLAGGED", label: "Flagged", count: records.filter((r: any) => r.isFlagged).length },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                        <CalendarDays className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Attendance</h2>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">
                            {selectedDate === today ? "Today's attendance" : format(new Date(selectedDate), "MMM dd, yyyy")}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate}
                            max={today}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="h-11 px-4 pr-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            {!isLoading && data && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Students", value: data.totalStudents, icon: Users, color: "blue" },
                        { label: "Present", value: data.presentCount, icon: UserCheck, color: "emerald" },
                        { label: "Absent", value: data.absentCount, icon: UserX, color: "red" },
                        { label: "Left", value: records.filter((r: any) => r.status === "LEFT").length, icon: LogOut, color: "amber" },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", `bg-${stat.color}-50 text-${stat.color}-600`)}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-3xl font-black text-gray-900">{stat.value}</span>
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-3">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-gray-50/50 border-gray-200 rounded-xl"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-4 h-4 text-gray-400" />
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key)}
                                className={cn(
                                    "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    statusFilter === tab.key
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                )}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {isLoading || isFetching ? (
                    <div className="p-6 space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-20 ml-auto" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="py-16 text-center">
                        <UserX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-semibold">No attendance records found</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {searchQuery ? "Try adjusting your search" : "No students have active bookings on this date"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest px-6 py-4">Student</th>
                                    <th className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest px-4 py-4">Seat</th>
                                    <th className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest px-4 py-4">Check In</th>
                                    <th className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest px-4 py-4">Check Out</th>
                                    <th className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest px-4 py-4">Duration</th>
                                    <th className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest px-4 py-4">Scans</th>
                                    <th className="text-left text-[11px] font-black text-gray-400 uppercase tracking-widest px-4 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {filteredRecords.map((record: any, index: number) => {
                                        const config = statusConfig[record.status] || statusConfig.ABSENT;
                                        const StatusIcon = config.icon;
                                        return (
                                            <motion.tr
                                                key={record.studentId}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
                                                            {record.studentName?.charAt(0)?.toUpperCase() || "?"}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{record.studentName}</p>
                                                            <p className="text-[11px] text-gray-400 font-medium">{record.email || record.phoneNumber || "—"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm font-bold text-gray-600">
                                                        {record.seatNumber ? `#${record.seatNumber}` : "—"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                                                        <span className="font-semibold">{formatTime(record.checkInTime)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <LogOut className="w-3.5 h-3.5 text-amber-500" />
                                                        <span className="font-semibold">{formatTime(record.checkOutTime)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <Timer className="w-3.5 h-3.5 text-blue-500" />
                                                        <span className="font-semibold">{formatDuration(record.totalDuration)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm font-bold text-gray-600">{record.scanCount || 0}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={cn("text-[11px] font-bold border px-2.5 py-1 rounded-lg", config.bg, config.color)}>
                                                            <StatusIcon className="w-3 h-3 mr-1" />
                                                            {config.label}
                                                        </Badge>
                                                        {record.isFlagged && (
                                                            <span title={record.flagReason || "Flagged"}>
                                                                <AlertTriangle className="w-4 h-4 text-orange-500" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
