"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tag,
    Clock,
    Settings2,
    ShieldCheck,
    LayoutGrid,
    Box,
    Users,
    Zap,
    Plus,
    Edit3,
    Trash2
} from "lucide-react";
import LibraryPlans from "./LibraryPlans";
import { useGetTimeSlotsByLibraryIdQuery, useGetLockersQuery, useGetSeatsByLibraryQuery } from "@/state/api";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

// Sub-components for different config sections
const SlotManagement = ({ libraryId }: { libraryId: string }) => {
    const { data: response, isLoading } = useGetTimeSlotsByLibraryIdQuery(libraryId);
    const slots = response?.success ? response.data : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Time Slots</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{slots.length} Slots configured</p>
                    </div>
                </div>
                <Button className="h-10 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Slot
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />
                    ))}
                </div>
            ) : slots.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center">
                    <Clock className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No time slots found. Create your first shift.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {slots.map((slot: any) => (
                        <div key={slot.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider rounded-lg">
                                    {slot.tag}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-amber-600">
                                        <Edit3 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    {slot.startTime} <span className="text-gray-300 font-normal">→</span> {slot.endTime}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const LockerManagement = ({ libraryId }: { libraryId: string }) => {
    const { data: lockers, isLoading } = useGetLockersQuery(libraryId);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                        <Box className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Lockers</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lockers?.length || 0} Locker types</p>
                    </div>
                </div>
                <Button className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Locker Type
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-[2rem] border border-gray-100" />
                    ))}
                </div>
            ) : !lockers || lockers.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center">
                    <Box className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No lockers configured.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lockers.map((locker: any) => (
                        <div key={locker.id} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-lg font-black text-gray-900">{locker.lockerType}</h4>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{locker.numberOfLockers} Units</span>
                                </div>
                                <div className="text-xl font-black text-gray-900">₹{locker.charge}<span className="text-[10px] font-bold text-gray-400">/mo</span></div>
                            </div>
                            <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-4">{locker.description}</p>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                                <Button variant="outline" size="sm" className="flex-1 rounded-xl font-bold border-gray-100 hover:bg-gray-50">Edit</Button>
                                <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-gray-100 text-red-400 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const SeatManagement = ({ libraryId }: { libraryId: string }) => {
    const { data: seats, isLoading } = useGetSeatsByLibraryQuery(libraryId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Seat Configuration</h3>
                    <p className="text-sm text-gray-500 font-medium">Manage seat layouts and types</p>
                </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 text-center">
                <LayoutGrid className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Seat configuration management coming soon.</p>
            </div>
        </div>
    );
};

interface LibraryConfigurationProps {
    libraryId: string;
}

export default function LibraryConfiguration({ libraryId }: LibraryConfigurationProps) {
    const [activeTab, setActiveTab] = useState("plans");

    const tabs = [
        { id: "plans", label: "Plans", icon: Tag, color: "text-blue-600", bg: "bg-blue-50" },
        { id: "slots", label: "Slots", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { id: "lockers", label: "Lockers", icon: Box, color: "text-emerald-600", bg: "bg-emerald-50" },
        { id: "seats", label: "Seats", icon: LayoutGrid, color: "text-indigo-600", bg: "bg-indigo-50" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-200">
                        <Settings2 className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Library Configuration</h2>
                        <p className="text-sm text-gray-500 font-medium mt-0.5">
                            Manage and update your library Inventory
                        </p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                            activeTab === tab.id
                                ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200/50"
                                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/30"
                        )}
                    >
                        <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? tab.color : "text-gray-400")} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[500px]">
                {activeTab === "plans" && <LibraryPlans libraryId={libraryId} />}
                {activeTab === "slots" && <SlotManagement libraryId={libraryId} />}
                {activeTab === "lockers" && <LockerManagement libraryId={libraryId} />}
                {activeTab === "seats" && <SeatManagement libraryId={libraryId} />}
            </div>
        </div>
    );
}
