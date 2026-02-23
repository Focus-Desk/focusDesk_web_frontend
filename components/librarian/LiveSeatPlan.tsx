"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetailedSeat } from "@/state/api";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, Shield, Info, Clock, CreditCard, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveSeatPlanProps {
    seats: DetailedSeat[];
    libraryName: string;
    libraryId: string;
}

export default function LiveSeatPlan({ seats, libraryName, libraryId }: LiveSeatPlanProps) {
    const [selectedSeat, setSelectedSeat] = useState<DetailedSeat | null>(null);

    const stats = {
        total: seats.length,
        occupied: seats.filter((s) => s.currentAvailability === "OCCUPIED").length,
        available: seats.filter((s) => s.currentAvailability === "AVAILABLE").length,
        reserved: seats.filter((s) => s.currentAvailability === "RESERVED").length,
        maintenance: seats.filter((s) => s.currentAvailability === "MAINTENANCE").length,
    };

    return (
        <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: "Total", value: stats.total, color: "bg-gray-100 text-gray-800" },
                    { label: "Available", value: stats.available, color: "bg-green-100 text-green-800" },
                    { label: "Occupied", value: stats.occupied, color: "bg-blue-100 text-blue-800" },
                    { label: "Reserved", value: stats.reserved, color: "bg-amber-100 text-amber-800" },
                    { label: "Maintenance", value: stats.maintenance, color: "bg-red-100 text-red-800" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <StatCard {...stat} />
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Seat Grid */}
                <Card className="flex-1 border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="border-b bg-gray-50/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Live Floor Map
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-4">
                            <TooltipProvider>
                                {seats.map((seat, i) => (
                                    <Tooltip key={seat.id}>
                                        <TooltipTrigger asChild>
                                            <motion.button
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 260,
                                                    damping: 20,
                                                    delay: i * 0.01
                                                }}
                                                whileHover={{ scale: 1.15, rotate: 2 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setSelectedSeat(seat)}
                                                className={`
                          w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all
                          border-2 shadow-sm
                          ${getSeatStyles(seat.currentAvailability, selectedSeat?.id === seat.id)}
                        `}
                                            >
                                                {seat.seatNumber}
                                            </motion.button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="bg-gray-900 text-white border-none shadow-xl">
                                            <div className="text-xs p-1">
                                                <p className="font-bold">Seat {seat.seatNumber}</p>
                                                <p className="opacity-80">{seat.currentAvailability}</p>
                                                {seat.currentBooking && (
                                                    <p className="mt-1 border-t border-white/20 pt-1 text-blue-300">
                                                        {seat.currentBooking.student.firstName}
                                                    </p>
                                                )}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </TooltipProvider>
                        </div>

                        {/* Legend */}
                        <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-600 border-t pt-4">
                            <LegendItem color="bg-green-500" label="Available" />
                            <LegendItem color="bg-blue-500" label="Occupied" />
                            <LegendItem color="bg-amber-500" label="Reserved" />
                            <LegendItem color="bg-red-500" label="Maintenance" />
                        </div>
                    </CardContent>
                </Card>

                {/* Details Panel */}
                <Card className="w-full lg:w-80 shadow-md">
                    <CardHeader className="bg-gray-50 border-b">
                        <CardTitle className="text-lg">Seat Details</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <AnimatePresence mode="wait">
                            {selectedSeat ? (
                                <motion.div
                                    key={selectedSeat.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-2xl font-bold">Seat {selectedSeat.seatNumber}</h3>
                                        <Badge className={`${getBadgeStyles(selectedSeat.currentAvailability)} py-1 px-3 rounded-full text-xs font-bold`}>
                                            {selectedSeat.currentAvailability}
                                        </Badge>
                                    </div>

                                    {selectedSeat.currentBooking ? (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm">
                                                <p className="text-[10px] text-blue-600 font-bold mb-3 uppercase tracking-[0.1em]">
                                                    Current Occupant
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                                        <User className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 leading-tight text-lg">
                                                            {selectedSeat.currentBooking.student.firstName} {selectedSeat.currentBooking.student.lastName}
                                                        </p>
                                                        <p className="text-xs text-blue-600/70 font-medium">{selectedSeat.currentBooking.student.email}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-2">
                                                <DetailRow
                                                    icon={<CreditCard className="h-4 w-4 text-blue-500" />}
                                                    label="Active Plan"
                                                    value={selectedSeat.currentBooking.plan.planName}
                                                />
                                                <DetailRow
                                                    icon={<Clock className="h-4 w-4 text-blue-500" />}
                                                    label="Valid Until"
                                                    value={new Date(selectedSeat.currentBooking.validTo).toLocaleDateString()}
                                                />
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-dashed">
                                                <p className="text-[10px] text-gray-400 font-bold mb-3 uppercase tracking-wider">Locker Info</p>
                                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-sm shadow-blue-200 animate-pulse" />
                                                    {selectedSeat.currentBooking.lockerId ? (
                                                        <span className="font-semibold text-gray-800">
                                                            Locker: #{selectedSeat.currentBooking.lockerId.slice(0, 8).toUpperCase()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">Standalone Seat (No Locker)</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center text-gray-500 space-y-3 bg-gray-50/50 rounded-3xl border border-dashed">
                                            <div className="bg-white h-16 w-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                                <Info className="h-8 w-8 text-gray-300" />
                                            </div>
                                            <p className="text-sm font-medium">Available for Booking</p>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="py-20 text-center text-gray-400 space-y-4">
                                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-2 border-white shadow-inner">
                                        <LayoutGrid className="h-10 w-10 text-gray-200" />
                                    </div>
                                    <p className="text-sm">Select a seat for detailed insights</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className={`p-4 rounded-xl border shadow-sm ${color}`}>
            <p className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${color}`} />
            <span>{label}</span>
        </div>
    );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
                {icon}
                <span>{label}</span>
            </div>
            <span className="font-medium text-gray-900">{value}</span>
        </div>
    );
}

function getSeatStyles(availability: string, isSelected: boolean) {
    const base = isSelected ? "ring-4 ring-offset-4 ring-blue-500 shadow-xl z-10" : "shadow-sm";
    switch (availability) {
        case "AVAILABLE":
            return `${base} bg-white border-green-400 text-green-600 hover:bg-green-50`;
        case "OCCUPIED":
            return `${base} bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400 text-white`;
        case "RESERVED":
            return `${base} bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 text-white`;
        case "MAINTENANCE":
            return `${base} bg-red-100 border-red-300 text-red-700`;
        default:
            return `${base} bg-gray-50 border-gray-200 text-gray-400`;
    }
}

function getBadgeStyles(availability: string) {
    switch (availability) {
        case "AVAILABLE":
            return "bg-green-100 text-green-800 border-green-200";
        case "OCCUPIED":
            return "bg-blue-100 text-blue-800 border-blue-200";
        case "RESERVED":
            return "bg-amber-100 text-amber-800 border-amber-200";
        case "MAINTENANCE":
            return "bg-red-100 text-red-800 border-red-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
}
