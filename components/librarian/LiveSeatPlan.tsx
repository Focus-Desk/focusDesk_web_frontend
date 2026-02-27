"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetailedSeat, useGetTimeSlotsByLibraryIdQuery } from "@/state/api";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { User, Shield, Info, Clock, CreditCard, LayoutGrid, Search, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface LiveSeatPlanProps {
    seats: DetailedSeat[];
    libraryName: string;
    libraryId: string;
    selectedSlotId: string;
    onSlotChange: (slotId: string) => void;
}

export default function LiveSeatPlan({
    seats,
    libraryName,
    libraryId,
    selectedSlotId,
    onSlotChange
}: LiveSeatPlanProps) {
    const [selectedSeat, setSelectedSeat] = useState<DetailedSeat | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: timeSlots } = useGetTimeSlotsByLibraryIdQuery(libraryId);

    const filteredSeats = useMemo(() => {
        return seats.filter(seat =>
            seat.seatNumber.toString().includes(searchQuery)
        );
    }, [seats, searchQuery]);

    const stats = {
        total: seats.length,
        flexAvailable: seats.filter((s) => s.mode === "FLEX" && s.currentAvailability === "AVAILABLE").length,
    };

    const getSeatColor = (seat: DetailedSeat) => {
        switch (seat.mode) {
            case "FIXED":
                return "bg-[#BDBCBC] text-white border-[#BDBCBC] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]";
            case "FLOAT":
                return "bg-[#C6E0B4] text-[#70AD47] border-[#C6E0B4]";
            case "FLEX":
                return "bg-[#70AD47] text-white border-[#70AD47]";
            default:
                return "bg-gray-200 text-gray-500 border-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Stats & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-4">
                    <div className="bg-white/50 px-6 py-3 rounded-2xl border shadow-sm flex items-center gap-3 backdrop-blur-md">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Seats</span>
                        <span className="text-2xl font-black text-gray-800">{stats.total}</span>
                    </div>
                    <div className="bg-white/50 px-6 py-3 rounded-2xl border shadow-sm flex items-center gap-3 backdrop-blur-md">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Available Flex</span>
                        <span className="text-2xl font-black text-green-600">{stats.flexAvailable}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center justify-end flex-1">
                    {/* Legend */}
                    <div className="flex gap-6 mr-4 bg-white/30 p-2 px-4 rounded-full border border-white/50 shadow-inner">
                        <LegendItem color="bg-[#BDBCBC]" label="Fixed Seats" />
                        <LegendItem color="bg-[#C6E0B4]" label="Float Seats" />
                        <LegendItem color="bg-[#70AD47]" label="Flexible Seats" />
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search Seat"
                            className="pl-10 h-11 bg-white border-gray-200 rounded-xl focus:ring-blue-500/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select value={selectedSlotId} onValueChange={onSlotChange}>
                        <SelectTrigger className="w-full md:w-44 h-11 bg-white border-gray-200 rounded-xl">
                            <SelectValue placeholder="Time Slot" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Slots</SelectItem>
                            {timeSlots?.data?.map(slot => (
                                <SelectItem key={slot.id} value={slot.id}>
                                    {slot.startTime} - {slot.endTime}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Seat Grid */}
                <Card className="flex-1 border-none shadow-xl bg-gray-50/50 rounded-3xl overflow-hidden min-h-[500px]">
                    <CardContent className="p-8">
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                            <TooltipProvider delayDuration={200}>
                                {filteredSeats.map((seat, i) => (
                                    <Tooltip key={seat.id}>
                                        <TooltipTrigger asChild>
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.01 }}
                                                whileHover={{ scale: 1.08, zIndex: 10 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedSeat(seat)}
                                                className={`
                                                  aspect-square rounded-xl flex items-center justify-center font-bold text-lg lg:text-xl transition-all
                                                  border-2 relative group
                                                  ${getSeatColor(seat)}
                                                  ${selectedSeat?.id === seat.id ? "ring-4 ring-blue-500/30 border-blue-500" : "border-transparent opacity-90 hover:opacity-100"}
                                                `}
                                            >
                                                {seat.seatNumber}
                                                {seat.bookings && seat.bookings.length > 0 && (
                                                    <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-blue-600 rounded-full border-2 border-white shadow-md flex items-center justify-center px-1">
                                                        <span className="text-[10px] font-black text-white leading-none">
                                                            {seat.bookings.length}
                                                        </span>
                                                    </div>
                                                )}
                                            </motion.button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[180px]">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                                    <span className="font-black text-sm tracking-tight text-white/90">Seat {seat.seatNumber}</span>
                                                    <Badge className="bg-white/10 text-[10px] text-white/60 hover:bg-white/20 border-none px-2">{seat.mode}</Badge>
                                                </div>

                                                {seat.mode === "FIXED" ? (
                                                    <div className="space-y-2">
                                                        {selectedSlotId === "all" ? (
                                                            seat.bookings?.length > 0 ? (
                                                                <div className="space-y-1.5">
                                                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Active Bookings</p>
                                                                    {seat.bookings.map((b, idx) => (
                                                                        <div key={idx} className="bg-white/5 p-2 rounded-lg flex justify-between items-center gap-3">
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[11px] font-bold text-blue-400 leading-none">
                                                                                    {b.student?.firstName || 'Student'}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                                                                                {b.plan?.hours ? `${b.plan.hours} hrs` : "Slot"}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="py-2 text-center bg-white/5 rounded-lg">
                                                                    <p className="text-[10px] italic text-gray-500">No active bookings</p>
                                                                </div>
                                                            )
                                                        ) : (
                                                            seat.currentBooking ? (
                                                                <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
                                                                    <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Occupant</p>
                                                                    <p className="text-sm font-bold">{seat.currentBooking.student.firstName} {seat.currentBooking.student.lastName}</p>
                                                                    <p className="text-[10px] text-gray-400 mt-1">{seat.currentBooking.plan.planName}</p>
                                                                </div>
                                                            ) : (
                                                                <div className="py-2 text-center bg-green-500/5 rounded-lg border border-green-500/10">
                                                                    <p className="text-[10px] font-bold text-green-400 uppercase">Available</p>
                                                                    <p className="text-[9px] text-gray-500 mt-0.5 tracking-tight">Free for this slot</p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1 text-center">
                                                        <span className={`text-xs font-bold ${seat.currentAvailability === 'AVAILABLE' ? 'text-green-400' : 'text-blue-400'}`}>
                                                            {seat.currentAvailability}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>

                {/* Details Panel - Refined Sidebar */}
                <AnimatePresence>
                    {selectedSeat && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, width: 0 }}
                            animate={{ opacity: 1, x: 0, width: "320px" }}
                            exit={{ opacity: 0, x: 20, width: 0 }}
                            className="hidden lg:block overflow-hidden"
                        >
                            <Card className="h-full border shadow-xl bg-white rounded-3xl sticky top-6">
                                <CardHeader className="border-b bg-gray-50/50 p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-2xl font-black">Seat {selectedSeat.seatNumber}</CardTitle>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{selectedSeat.mode} Mode</p>
                                        </div>
                                        <button onClick={() => setSelectedSeat(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                            <Info className="h-5 w-5 text-gray-400" />
                                        </button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-400">Status</span>
                                            <Badge className={`${getBadgeStyles(selectedSeat.currentAvailability)} font-black px-3 py-1 rounded-full text-[10px]`}>
                                                {selectedSeat.currentAvailability}
                                            </Badge>
                                        </div>

                                        {/* Bookings Section */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
                                                    {selectedSlotId === "all" ? "Daily Schedule" : "Bookings"}
                                                </h4>
                                                <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px]">
                                                    {selectedSeat.bookings?.length || 0} Total
                                                </Badge>
                                            </div>

                                            <div className="space-y-3">
                                                {/* Current Occupant (if specific slot selected) */}
                                                {selectedSlotId !== "all" && selectedSeat.currentBooking && (
                                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-3xl text-white shadow-lg shadow-blue-200">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-4">Current Occupant</p>
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                                                <User className="h-6 w-6" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-lg font-black leading-none">{selectedSeat.currentBooking.student.firstName}</p>
                                                                <p className="text-[11px] font-medium text-white/70 mt-1">{selectedSeat.currentBooking.student.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] font-bold">
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="h-3 w-3 opacity-60" />
                                                                <span>{selectedSeat.currentBooking.plan.planName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="h-3 w-3 opacity-60" />
                                                                <span>Exp: {format(new Date(selectedSeat.currentBooking.validTo), "MMM dd")}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Other Bookings List */}
                                                <div className="space-y-2">
                                                    {(selectedSlotId === "all" ? selectedSeat.bookings : selectedSeat.bookings?.filter(b => b.id !== selectedSeat.currentBooking?.id)).map((booking, idx) => (
                                                        <div key={idx} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
                                                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                                                                <User className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-start">
                                                                    <p className="text-sm font-black text-gray-800 leading-none">
                                                                        {booking.student?.firstName} {booking.student?.lastName}
                                                                    </p>
                                                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-1.5 py-0.5 rounded">
                                                                        {booking.plan?.planName || "Booking"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 font-bold">
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {booking.plan?.hours ? `${booking.plan.hours} hrs` : "Slot"}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Calendar className="h-3 w-3" />
                                                                        {format(new Date(booking.validTo), "MMM dd")}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {(!selectedSeat.bookings || (selectedSlotId === "all" ? selectedSeat.bookings.length === 0 : !selectedSeat.currentBooking && selectedSeat.bookings.length === 0)) && (
                                                        <div className="py-12 text-center rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50">
                                                            <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                                                                <LayoutGrid className="h-8 w-8 text-gray-200" />
                                                            </div>
                                                            <p className="text-sm font-black text-gray-400">Available for Booking</p>
                                                            <p className="text-[10px] text-gray-300 mt-1">This seat has no active bookings for today</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Overview */}
                                    <div className="space-y-4 pt-4">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Overview</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 p-4 rounded-2xl border text-center">
                                                <p className="text-[10px] font-bold text-gray-400 mb-1">Total Bookings</p>
                                                <p className="text-xl font-black">{selectedSeat.totalBookings || 0}</p>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-2xl border text-center">
                                                <p className="text-[10px] font-bold text-gray-400 mb-1">Queue</p>
                                                <p className="text-xl font-black">{selectedSeat.upcomingBookingsCount || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2.5">
            <div className={`h-3 w-3 rounded-full ${color} shadow-sm border border-white/20`} />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">{label}</span>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-gray-300 cursor-help hover:text-gray-500 transition-colors" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-800 text-white p-2 text-[10px] rounded-lg border-none">
                        Quick info about {label.toLowerCase()}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}

function getBadgeStyles(availability: string) {
    switch (availability) {
        case "AVAILABLE":
            return "bg-green-100 text-green-700 border-green-200";
        case "OCCUPIED":
            return "bg-blue-100 text-blue-700 border-blue-200";
        case "MAINTENANCE":
            return "bg-red-100 text-red-700 border-red-200";
        case "RESERVED":
            return "bg-amber-100 text-amber-700 border-amber-200";
        default:
            return "bg-gray-100 text-gray-600 border-gray-200";
    }
}
