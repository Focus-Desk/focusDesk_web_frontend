"use client";

import React, { useState } from "react";
import {
    Tag,
    Clock,
    Settings2,
    LayoutGrid,
    Box,
    Users,
    Zap,
    Plus,
    Gift,
    Edit3,
    Trash2,
    Calendar,
    ArrowUpRight,
    Lock,
    Shield,
    CheckCircle2,
    Info,
    ClipboardList
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LibraryPlans from "./LibraryPlans";
import LibraryPromotions from "./LibraryPromotions";
import LibraryLockers from "./LibraryLockers";
import LibraryShifts from "./LibraryShifts";
import LibraryRequests from "./LibraryRequests";
import { useGetTimeSlotsByLibraryIdQuery, useGetLockersQuery, useGetSeatsByLibraryQuery } from "@/state/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// --- SEAT MANAGEMENT (GRID/DASHBOARD STYLE) ---
const SeatManagement = ({ libraryId }: { libraryId: string }) => {
    const { data: seats, isLoading } = useGetSeatsByLibraryQuery(libraryId);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Seat Inventory</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{seats?.length || 0} Registered Desks</p>
                    </div>
                </div>
                <Button className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02]">
                    <Settings2 className="w-4 h-4" /> Bulk Configure
                </Button>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
                        {Array.from({ length: 48 }).map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />
                        ))}
                    </div>
                </div>
            ) : !seats || seats.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-16 text-center">
                    <div className="h-20 w-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <LayoutGrid className="h-10 w-10 text-gray-200" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">No seats found</h4>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm">Run the bulk seat configurator to populate your library inventory.</p>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-sm overflow-hidden relative group">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
                        {seats.map((seat: any) => (
                            <motion.div
                                whileHover={{ scale: 1.1, zIndex: 20 }}
                                key={seat.id}
                                className={cn(
                                    "aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 border-2 cursor-pointer relative group/seat",
                                    seat.status === "AVAILABLE" ? "bg-white border-gray-100 hover:border-indigo-400 hover:shadow-xl" :
                                        seat.status === "OCCUPIED" ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" :
                                            "bg-gray-50 border-gray-100 opacity-60"
                                )}
                            >
                                <span className={cn(
                                    "text-[10px] font-black",
                                    seat.status === "AVAILABLE" ? "text-gray-900" : "text-white"
                                )}>
                                    {seat.seatNumber}
                                </span>

                                {seat.mode === "FIXED" && (
                                    <div className={cn(
                                        "absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full",
                                        seat.status === "OCCUPIED" ? "bg-white" : "bg-indigo-500"
                                    )} />
                                )}

                                {/* Hover Info Card */}
                                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/seat:opacity-100 transition-all pointer-events-none z-50">
                                    <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-2xl min-w-[140px] border border-white/10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Seat {seat.seatNumber}</span>
                                            <Badge className="bg-indigo-500 text-[8px] h-4 rounded-md">
                                                {seat.mode}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-xs font-bold">
                                                <div className={cn("h-2 w-2 rounded-full", seat.status === "AVAILABLE" ? "bg-emerald-500" : "bg-amber-500")} />
                                                {seat.status}
                                            </div>
                                            {seat.lockerId && (
                                                <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold">
                                                    <Lock className="h-3 w-3" /> Linked Locker
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-50 flex flex-wrap gap-8 justify-center items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-lg bg-indigo-600" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Occupied</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-lg bg-white border-2 border-gray-100" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Available</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-lg border-2 border-indigo-500 flex items-center justify-center">
                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Fixed Desk</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN CONFIGURATION COMPONENT ---
interface LibraryConfigurationProps {
    libraryId: string;
}

export default function LibraryConfiguration({ libraryId }: LibraryConfigurationProps) {
    const [activeTab, setActiveTab] = useState("plans");

    const tabs = [
        { id: "plans", label: "Plans", icon: Tag, color: "text-blue-600", bg: "bg-blue-50" },
        { id: "slots", label: "Shifts", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { id: "lockers", label: "Lockers", icon: Box, color: "text-emerald-600", bg: "bg-emerald-50" },
        { id: "seats", label: "Inventory", icon: LayoutGrid, color: "text-indigo-600", bg: "bg-indigo-50" },
        { id: "promotions", label: "Offers", icon: Gift, color: "text-purple-600", bg: "bg-purple-50" },
        { id: "requests", label: "Requests", icon: ClipboardList, color: "text-rose-600", bg: "bg-rose-50" },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Library Configurations</h2>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">
                            Manage your seating, shifts, lockers, and revenue models from one hub
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-3 p-2 bg-gray-100/50 rounded-[2rem] w-fit border border-gray-200/50">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-3 px-7 py-3.5 rounded-[1.25rem] text-sm font-black transition-all duration-500 relative",
                            activeTab === tab.id
                                ? "bg-white text-gray-900 shadow-xl shadow-gray-200/50 ring-1 ring-gray-200 scale-[1.02]"
                                : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                        )}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-4 bg-gray-900 rounded-full"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Dynamic Content Section */}
            <div className="min-h-[600px] animate-in fade-in duration-700">
                {activeTab === "plans" && <LibraryPlans libraryId={libraryId} />}
                {activeTab === "slots" && <LibraryShifts libraryId={libraryId} />}
                {activeTab === "lockers" && <LibraryLockers libraryId={libraryId} />}
                {activeTab === "seats" && <SeatManagement libraryId={libraryId} />}
                {activeTab === "promotions" && <LibraryPromotions libraryId={libraryId} />}
                {activeTab === "requests" && <LibraryRequests libraryId={libraryId} />}
            </div>

            {/* Footer Quick Info */}
            <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                <Info className="h-5 w-5 text-blue-600" />
                <p className="text-xs font-bold text-blue-800 leading-relaxed">
                    All configuration changes will be verified by admin, please allow some time to get approved.
                </p>
            </div>
        </div>
    );
}
