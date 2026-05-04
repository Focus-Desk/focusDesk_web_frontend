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
    Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import LibraryPlans from "./LibraryPlans";
import LibraryPromotions from "./LibraryPromotions";
import LibraryLockers from "./LibraryLockers";
import { useGetTimeSlotsByLibraryIdQuery, useGetLockersQuery, useGetSeatsByLibraryQuery } from "@/state/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// --- SLOT MANAGEMENT (TIMELINE STYLE) ---
const SlotManagement = ({ libraryId }: { libraryId: string }) => {
    const { data: response, isLoading } = useGetTimeSlotsByLibraryIdQuery(libraryId);
    const slots = response?.success ? response.data : [];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm border border-amber-100">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Shift Schedule</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{slots.length} Operation windows</p>
                    </div>
                </div>
                <Button className="h-11 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-gray-200 transition-all hover:scale-[1.02]">
                    <Plus className="w-4 h-4" /> New Shift
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-[2.5rem] border border-gray-100" />
                    ))}
                </div>
            ) : slots.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-16 text-center">
                    <div className="h-20 w-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Clock className="h-10 w-10 text-gray-200" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">No shifts defined</h4>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm">Define your library's operational hours to enable member bookings.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {slots.map((slot: any) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={slot.id}
                            className="relative bg-white border border-gray-100 rounded-[2.5rem] p-7 shadow-sm hover:shadow-2xl transition-all duration-500 group overflow-hidden"
                        >
                            {/* Accent Background */}
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                                <Clock className="h-32 w-32 -rotate-12" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                                            {slot.tag} Shift
                                        </span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-amber-600 hover:bg-amber-50">
                                        <Edit3 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="mb-8">
                                    <div className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
                                        {slot.startTime}
                                        <ArrowUpRight className="h-5 w-5 text-gray-200 group-hover:text-amber-500 transition-colors" />
                                        {slot.endTime}
                                    </div>
                                </div>

                                {/* <div className="mt-auto space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Capacity</span>
                                            <span className="text-sm font-black text-gray-900">{slot.bookedCount} / {slot.capacity || "Unlimited"}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Load</span>
                                            <div className="flex gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "h-1 w-4 rounded-full transition-all duration-500",
                                                            i < (slot.bookedCount / (slot.capacity || 1)) * 5 ? "bg-amber-500" : "bg-gray-100"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- LOCKER MANAGEMENT (SECURITY/VAULT STYLE) ---
const LockerManagement = ({ libraryId }: { libraryId: string }) => {
    const { data: lockers, isLoading } = useGetLockersQuery(libraryId);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100">
                        <Lock className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Security Lockers</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lockers?.length || 0} Storage units</p>
                    </div>
                </div>
                <Button className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02]">
                    <Plus className="w-4 h-4" /> Add Locker
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-[2.5rem] border border-gray-100" />
                    ))}
                </div>
            ) : !lockers || lockers.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-16 text-center">
                    <div className="h-20 w-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Lock className="h-10 w-10 text-gray-200" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">No lockers configured</h4>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm">Offer secure storage to your members to increase your monthly revenue.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lockers.map((locker: any) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={locker.id}
                            className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
                        >
                            {/* Status Tag */}
                            <div className="absolute top-6 right-6">
                                <Badge className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                    locker.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-gray-400 border-gray-100"
                                )}>
                                    {locker.isActive ? "Online" : "Disabled"}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-5 mb-8">
                                <div className="h-16 w-16 rounded-[1.25rem] bg-gray-900 text-white flex items-center justify-center font-black text-2xl shadow-xl group-hover:bg-emerald-600 transition-colors duration-500">
                                    {locker.lockerNumber || "L"}
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-gray-900 leading-tight">{locker.lockerType}</h4>
                                    <code className="text-[10px] font-bold text-emerald-600 tracking-widest">{locker.code}</code>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{locker.price}</span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">/ Month</span>
                                </div>

                                <div className="p-5 rounded-[1.75rem] bg-gray-50/50 border border-gray-100 group-hover:bg-white group-hover:border-emerald-100 transition-all duration-500">
                                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200/50">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Usage Model</span>
                                        <span className="text-[10px] font-black text-gray-700">{locker.isStandalone ? "Public Access" : "Seat-Linked"}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Attachment</span>
                                        <span className="text-[10px] font-black text-emerald-600">
                                            {locker.linkedSeatId ? `Seat #${locker.linkedSeatId.slice(-4)}` : "None"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-2">
                                <Button className="flex-1 h-12 rounded-2xl font-bold bg-white text-gray-900 border border-gray-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 shadow-sm transition-all">
                                    Manage Unit
                                </Button>
                                <Button variant="ghost" className="h-12 w-12 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- SEAT MANAGEMENT (GRID/DASHBOARD STYLE) ---
const SeatManagement = ({ libraryId }: { libraryId: string }) => {
    const { data: seats, isLoading } = useGetSeatsByLibraryQuery(libraryId);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100">
                        <LayoutGrid className="h-6 w-6" />
                    </div>
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
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {/* Page Header */}
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                    <Settings2 className="h-40 w-40" />
                </div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-gray-900 text-white flex items-center justify-center shadow-2xl">
                        <Shield className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Library Control Hub</h2>
                        <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                            Advanced Management System <Badge variant="outline" className="text-[9px] h-4 rounded-md">v2.0</Badge>
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 relative z-10">
                    <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 text-center min-w-[120px]">
                        <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">System Health</span>
                        <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-xs font-black text-gray-900">Synchronized</span>
                        </div>
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
                        <tab.icon className={cn("w-4.5 h-4.5 transition-colors duration-500", activeTab === tab.id ? tab.color : "text-gray-300")} />
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
                {activeTab === "slots" && <SlotManagement libraryId={libraryId} />}
                {activeTab === "lockers" && <LockerManagement libraryId={libraryId} />}
                {activeTab === "seats" && <SeatManagement libraryId={libraryId} />}
                {activeTab === "promotions" && <LibraryPromotions libraryId={libraryId} />}
            </div>

            {/* Footer Quick Info */}
            <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                <Info className="h-5 w-5 text-blue-600" />
                <p className="text-xs font-bold text-blue-800 leading-relaxed">
                    All configuration changes are applied in real-time to your library listing.
                    Ensure to verify pricing before saving.
                </p>
            </div>
        </div>
    );
}
