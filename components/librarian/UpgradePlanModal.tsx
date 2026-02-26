"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
    X,
    ChevronRight,
    ChevronLeft,
    Check,
    CheckCircle2,
    Lock,
    Loader2,
    Ticket,
    Calendar,
    ArrowUpCircle,
    BadgeInfo
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    useGetPlansQuery,
    useGetSeatsForPlanQuery,
    useGetLockersQuery,
    useAdminCreateBookingMutation,
    useCalculatePricingMutation,
    useGetLibrariansByLibraryIdQuery
} from "@/state/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UpgradePlanModalProps {
    student: any;
    libraryId: string;
    activeBooking?: any;
    onClose: () => void;
    onSuccess: () => void;
}

type Step = "SELECTION" | "CONFIRMATION" | "SUCCESS";

export default function UpgradePlanModal({
    student,
    libraryId,
    activeBooking,
    onClose,
    onSuccess
}: UpgradePlanModalProps) {
    const [currentStep, setCurrentStep] = useState<Step>("SELECTION");

    // Booking Selection
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [selectedSeatId, setSelectedSeatId] = useState("");
    const [selectedLockerId, setSelectedLockerId] = useState("");
    const [selectedLibrarianId, setSelectedLibrarianId] = useState("");
    const [pin, setPin] = useState("");
    const [couponCode, setCouponCode] = useState("");

    // API Hooks
    const { data: plans, isLoading: isLoadingPlans } = useGetPlansQuery(libraryId, { skip: !libraryId });
    const { data: lockers, isLoading: isLoadingLockers } = useGetLockersQuery(libraryId, { skip: !libraryId });
    const { data: librarians, isLoading: isLoadingLibrarians } = useGetLibrariansByLibraryIdQuery(libraryId, { skip: !libraryId });

    const startDate = useMemo(() => {
        const validTo = activeBooking?.bookingDetails?.validTo || activeBooking?.validTo;
        if (validTo) {
            const date = new Date(validTo);
            // Ensure we are working with the next day
            date.setDate(date.getDate() + 1);
            return date;
        }
        return new Date();
    }, [activeBooking]);

    const { data: seatData, isLoading: isLoadingSeats } = useGetSeatsForPlanQuery(
        {
            planId: selectedPlanId,
            date: startDate.toISOString().split("T")[0]
        },
        { skip: !selectedPlanId }
    );

    const [adminCreateBooking, { isLoading: isSubmitting }] = useAdminCreateBookingMutation();
    const [calculatePricing, { isLoading: isCalculating }] = useCalculatePricingMutation();

    const [pricingData, setPricingData] = useState<any>(null);

    const sortedPlans = useMemo(() => {
        if (!plans) return [];
        const currentPlanId = activeBooking?.planId || activeBooking?.plan?.id;
        const list = [...plans];
        if (currentPlanId) {
            const index = list.findIndex(p => p.id === currentPlanId);
            if (index > -1) {
                const [current] = list.splice(index, 1);
                return [{ ...current, isCurrent: true }, ...list];
            }
        }
        return list;
    }, [plans, activeBooking]);

    useEffect(() => {
        const currentPlanId = activeBooking?.planId || activeBooking?.plan?.id;
        if (currentPlanId && !selectedPlanId) {
            setSelectedPlanId(currentPlanId);
        }
    }, [activeBooking, selectedPlanId]);

    useEffect(() => {
        if (librarians?.data?.length === 1 && !selectedLibrarianId) {
            setSelectedLibrarianId(librarians.data[0].id);
        }
    }, [librarians, selectedLibrarianId]);

    const selectedPlan = useMemo(() => plans?.find((p: any) => p.id === selectedPlanId), [plans, selectedPlanId]);

    const handleNext = async () => {
        if (currentStep === "SELECTION") {
            try {
                const result = await calculatePricing({
                    planId: selectedPlanId,
                    monthsRequested: 1,
                    lockerId: selectedLockerId || undefined,
                    offerCode: couponCode || undefined,
                }).unwrap();
                if (result.success) {
                    setPricingData(result.data);
                    setCurrentStep("CONFIRMATION");
                }
            } catch (err) {
                toast.error("Failed to calculate pricing");
            }
        }
    };

    const handleSubmit = async () => {
        if (!selectedLibrarianId || !pin) {
            toast.error("Librarian and PIN are required");
            return;
        }

        try {
            const result = await adminCreateBooking({
                librarianId: selectedLibrarianId,
                pin,
                libraryId,
                planId: selectedPlanId,
                studentId: student.id,
                seatId: selectedSeatId || undefined,
                lockerId: selectedLockerId || undefined,
                offerCode: couponCode || undefined,
                date: startDate.toISOString(),
            }).unwrap();

            if (result.success) {
                setCurrentStep("SUCCESS");
                toast.success("Upgrade successful!");
            }
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to process upgrade");
        }
    };

    if (currentStep === "SUCCESS") {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <div className="bg-white rounded-3xl w-full max-w-md p-10 flex flex-col items-center text-center space-y-6">
                    <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle2 className="h-16 w-16" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-gray-900">Upgrade Success!</h2>
                        <p className="text-gray-500 font-medium">
                            New plan scheduled to start from {startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            onSuccess();
                            onClose();
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold rounded-2xl shadow-xl shadow-blue-100"
                    >
                        Done
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-50 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="px-8 py-6 bg-white border-b flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                            <ArrowUpCircle className="h-7 w-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 leading-tight">Upgrade Plan</h2>
                            <p className="text-sm font-bold text-gray-400">Student: {student?.firstName} {student?.lastName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                        <X className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        {currentStep === "SELECTION" && (
                            <motion.div
                                key="selection"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {/* Current Plan Status */}
                                {activeBooking && (
                                    <div className="bg-gray-100 rounded-3xl p-6 border border-gray-200 flex items-center gap-5 relative overflow-hidden group shadow-inner">
                                        <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                            <BadgeInfo className="h-7 w-7 text-gray-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-gray-400 text-xs uppercase tracking-widest">Currently Enrolled In</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="font-black text-gray-900 text-lg">{activeBooking.plan?.planName}</span>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-none font-black text-[10px] px-2 py-0.5 uppercase">
                                                    {activeBooking.plan?.hours} HRS • {activeBooking.bookingDetails?.seatMode || activeBooking.plan?.planType}
                                                </Badge>
                                            </div>
                                            <p className="text-gray-500 font-bold text-xs mt-1">
                                                Expires on {new Date(activeBooking.bookingDetails?.validTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Info Box about Start Date */}
                                <div className="bg-blue-600 rounded-3xl p-6 text-white flex items-center gap-5 shadow-xl shadow-blue-100 relative overflow-hidden group">
                                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Calendar className="h-32 w-32" />
                                    </div>
                                    <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                        <Calendar className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-lg italic">
                                            Plan will start on {startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </h3>
                                        <p className="text-blue-100 font-bold text-sm">
                                            {activeBooking
                                                ? "Automatically scheduled after current plan expires"
                                                : "Starting from today"
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Plan Selection */}
                                <div className="space-y-4">
                                    <Label className="text-lg font-black text-gray-800 ml-1">Select New Plan</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {isLoadingPlans ? (
                                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
                                                <Loader2 className="h-10 w-10 animate-spin mb-4" />
                                                <p className="font-bold">Loading available plans...</p>
                                            </div>
                                        ) : sortedPlans?.map((plan: any) => (
                                            <div
                                                key={plan.id}
                                                onClick={() => {
                                                    setSelectedPlanId(plan.id);
                                                    setSelectedSeatId("");
                                                }}
                                                className={cn(
                                                    "relative p-6 rounded-3xl border-2 transition-all cursor-pointer overflow-hidden",
                                                    selectedPlanId === plan.id
                                                        ? "bg-white border-blue-500 shadow-xl ring-1 ring-blue-500"
                                                        : "bg-white/50 border-white hover:border-blue-200"
                                                )}
                                            >
                                                {plan.isCurrent && (
                                                    <div className="absolute -left-10 top-3 -rotate-45 bg-blue-600 text-white text-[8px] font-black px-10 py-1 shadow-sm">
                                                        CURRENT
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-2xl font-black text-gray-900">₹{plan.price}</span>
                                                                <span className="text-xs font-bold text-gray-400">/ month</span>
                                                            </div>
                                                            <div className="text-xs font-black text-gray-500 mt-0.5 uppercase tracking-tight">{plan.planName}</div>
                                                        </div>
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-none font-black text-[10px] px-2 py-1">
                                                            {plan.planType === "Fixed" ? "Fixed" : "Flexi"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-md font-black uppercase">
                                                            {plan.hours} HRS
                                                        </span>
                                                        {plan.planType !== "Float" && plan.planType !== "Flexi" && (
                                                            <span className="text-[10px] font-bold text-gray-400">
                                                                {plan.formattedTiming || "Standard shifts"}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedPlanId === plan.id && (
                                                    <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1">
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Seat Selection for Fixed Plans */}
                                {selectedPlan?.planType === "Fixed" && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <Label className="text-lg font-black text-gray-800 ml-1">Select Seat</Label>
                                        <div className="bg-white rounded-3xl p-6 border border-gray-100 overflow-x-auto">
                                            {isLoadingSeats ? (
                                                <div className="py-4 flex items-center justify-center gap-3 text-blue-600 font-bold">
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    <span>Checking seat availability...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {seatData?.data?.seats?.filter((s: any) => s.isSelectable).length > 0 ? (
                                                        seatData.data.seats.filter((s: any) => s.isSelectable).map((s: any) => (
                                                            <button
                                                                key={s.id}
                                                                onClick={() => setSelectedSeatId(s.id)}
                                                                className={cn(
                                                                    "h-10 px-4 text-xs font-black rounded-xl border transition-all",
                                                                    selectedSeatId === s.id
                                                                        ? "bg-blue-600 text-white border-blue-700 shadow-lg scale-110"
                                                                        : "bg-gray-50 text-gray-700 hover:border-blue-400 hover:bg-white"
                                                                )}
                                                            >
                                                                {s.seatNumber}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm font-bold text-gray-400 italic py-2">No seats available for this plan and date.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Locker Option */}
                                <div className="space-y-4">
                                    <Label className="text-lg font-black text-gray-800 ml-1">Add Locker (Optional)</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {isLoadingLockers ? (
                                            <div className="py-2 flex items-center gap-2 text-gray-400 animate-pulse">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm font-bold">Loading lockers...</span>
                                            </div>
                                        ) : lockers?.map((locker: any) => (
                                            <Button
                                                key={locker.id}
                                                variant={selectedLockerId === locker.id ? "default" : "outline"}
                                                onClick={() => setSelectedLockerId(prev => prev === locker.id ? "" : locker.id)}
                                                className={cn(
                                                    "h-12 px-6 rounded-2xl font-bold transition-all",
                                                    selectedLockerId === locker.id ? "bg-blue-600 text-white" : "bg-white border-gray-100 shadow-sm"
                                                )}
                                            >
                                                <Lock className="mr-2 h-4 w-4" />
                                                {locker.lockerType} (₹{locker.price})
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        disabled={!selectedPlanId || (selectedPlan?.planType === "Fixed" && !selectedSeatId) || isCalculating}
                                        onClick={handleNext}
                                        className="h-14 px-10 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-100"
                                    >
                                        {isCalculating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                        Continue to Payment
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === "CONFIRMATION" && (
                            <motion.div
                                key="confirmation"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Left: Summary */}
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-6">
                                            <div className="flex items-center gap-4 border-b pb-6">
                                                <div className="h-16 w-16 bg-blue-100 text-blue-700 rounded-[1.25rem] flex items-center justify-center font-black text-2xl">
                                                    {student.firstName[0]}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-900">{student.firstName} {student.lastName}</h3>
                                                    <Badge className="bg-blue-50 text-blue-700 border-none font-black text-[10px] px-2 mt-1">
                                                        Upgrade Schedule
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Plan</span>
                                                    <div className="font-extrabold text-gray-900">{selectedPlan?.planName}</div>
                                                    <div className="text-xs text-gray-500 font-bold">{selectedPlan?.hours} HRS • {selectedPlan?.planType} Seat</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Date</span>
                                                    <div className="font-extrabold text-blue-600">
                                                        {startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </div>
                                                {selectedSeatId && (
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seat Number</span>
                                                        <div className="font-extrabold text-gray-900">
                                                            Seat {seatData?.data?.seats?.find((s: any) => s.id === selectedSeatId)?.seatNumber}
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedLockerId && (
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Add-on</span>
                                                        <div className="font-extrabold text-gray-900">Locker Service</div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Pricing Table */}
                                            {pricingData && (
                                                <div className="pt-6 border-t space-y-3">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-500 font-bold">Base Price</span>
                                                        <span className="font-extrabold text-gray-800">₹{pricingData.monthlyFee}</span>
                                                    </div>
                                                    {pricingData.lockerPrice > 0 && (
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-500 font-bold">Locker Fee</span>
                                                            <span className="font-extrabold text-gray-800">₹{pricingData.lockerPrice}</span>
                                                        </div>
                                                    )}
                                                    {pricingData.offerApplied && (
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-green-600 font-bold font-mono text-xs">OFFER: {pricingData.offerApplied.code}</span>
                                                            <span className="font-extrabold text-green-600">-₹{pricingData.offerApplied.discount.toFixed(0)}</span>
                                                        </div>
                                                    )}
                                                    <div className="pt-4 flex justify-between items-center">
                                                        <span className="text-lg font-black text-gray-900">Grand Total</span>
                                                        <span className="text-3xl font-black text-blue-600">₹{pricingData.total.toFixed(0)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Auth */}
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-6">
                                            <div className="space-y-4">
                                                <Label className="font-black text-sm text-gray-700">Authorizing Librarian</Label>
                                                <Select value={selectedLibrarianId} onValueChange={setSelectedLibrarianId}>
                                                    <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none font-bold">
                                                        {isLoadingLibrarians ? (
                                                            <div className="flex items-center gap-2 text-gray-400">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                <span>Loading librarians...</span>
                                                            </div>
                                                        ) : (
                                                            <SelectValue placeholder="Select yourself" />
                                                        )}
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {librarians?.data?.length === 0 ? (
                                                            <div className="p-2 text-sm text-gray-500 text-center font-bold">No authorizers found</div>
                                                        ) : librarians?.data?.map((lib: any) => (
                                                            <SelectItem key={lib.id} value={lib.id}>{lib.firstName} {lib.lastName}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-4">
                                                <Label className="font-black text-sm text-gray-700">Security PIN</Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        type="password"
                                                        placeholder="••••"
                                                        className="h-12 pl-11 rounded-xl bg-gray-50 border-none font-black text-lg tracking-[0.5em]"
                                                        value={pin}
                                                        onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <Label className="font-black text-sm text-gray-700">Coupon Code</Label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            placeholder="CODE"
                                                            className="h-12 pl-11 rounded-xl bg-gray-50 border-none font-black uppercase"
                                                            value={couponCode}
                                                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={!couponCode || isCalculating}
                                                        onClick={async () => {
                                                            try {
                                                                const result = await calculatePricing({
                                                                    planId: selectedPlanId,
                                                                    monthsRequested: 1,
                                                                    lockerId: selectedLockerId || undefined,
                                                                    offerCode: couponCode || undefined,
                                                                }).unwrap();
                                                                if (result.success && result.data.offerApplied) {
                                                                    setPricingData(result.data);
                                                                    toast.success("Coupon applied!");
                                                                } else {
                                                                    toast.error("Invalid coupon");
                                                                }
                                                            } catch {
                                                                toast.error("Error applying coupon");
                                                            }
                                                        }}
                                                        className="h-12 px-4 rounded-xl text-blue-600 font-bold hover:bg-blue-50"
                                                    >
                                                        {isCalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" onClick={() => setCurrentStep("SELECTION")} className="h-14 flex-1 rounded-2xl font-black border-gray-200 text-gray-500">
                                        <ChevronLeft className="mr-2 h-5 w-5" /> Back to Selection
                                    </Button>
                                    <Button
                                        disabled={!selectedLibrarianId || !pin || isSubmitting}
                                        onClick={handleSubmit}
                                        className="h-14 flex-[2] rounded-2xl bg-green-600 hover:bg-green-700 font-black text-lg shadow-xl shadow-green-100"
                                    >
                                        {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : null}
                                        Confirm & Process Upgrade
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}
