"use client";

import React, { useState, useEffect } from "react";
import {
    X,
    CheckCircle2,
    Lock,
    Loader2,
    User,
    IndianRupee,
    QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    useApproveBookingMutation,
    useGetLibrariansByLibraryIdQuery
} from "@/state/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ConfirmBookingModalProps {
    booking: any;
    libraryId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ConfirmBookingModal({
    booking,
    libraryId,
    onClose,
    onSuccess
}: ConfirmBookingModalProps) {
    const [selectedLibrarianId, setSelectedLibrarianId] = useState("");
    const [pin, setPin] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI">("CASH");

    const { data: librarians, isLoading: isLoadingLibrarians } = useGetLibrariansByLibraryIdQuery(libraryId, { skip: !libraryId });
    const [approveBooking, { isLoading: isSubmitting }] = useApproveBookingMutation();

    useEffect(() => {
        if (librarians?.data?.length === 1 && !selectedLibrarianId) {
            setSelectedLibrarianId(librarians.data[0].id);
        }
    }, [librarians, selectedLibrarianId]);

    const handleSubmit = async () => {
        if (!selectedLibrarianId || !pin) {
            toast.error("Librarian and PIN are required");
            return;
        }

        try {
            const result = await approveBooking({
                id: booking.id,
                librarianId: selectedLibrarianId,
                pin,
                paymentMethod,
            }).unwrap();

            if (result.success) {
                toast.success("Booking approved successfully!");
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to approve booking");
        }
    };

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
                className="bg-gray-50 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="px-8 py-6 bg-white border-b flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-100">
                            <CheckCircle2 className="h-7 w-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 leading-tight">Confirm Booking</h2>
                            <p className="text-sm font-bold text-gray-400">Student: {booking?.student?.firstName} {booking?.student?.lastName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                        <X className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: Booking Summary & Payment */}
                        <div className="space-y-6">
                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Details</span>
                                <div className="space-y-1">
                                    <div className="font-extrabold text-gray-900">{booking?.plan?.planName}</div>
                                    <div className="text-sm font-bold text-blue-600">₹{booking?.totalPrice || booking?.plan?.price}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-black text-gray-700 uppercase tracking-tight ml-1">1. Select Payment Mode</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentMethod("CASH")}
                                        className={cn(
                                            "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                                            paymentMethod === "CASH" ? "border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-50" : "bg-white border-gray-100 text-gray-400 grayscale"
                                        )}
                                    >
                                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", paymentMethod === "CASH" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400")}>
                                            <IndianRupee className="h-5 w-5" />
                                        </div>
                                        <span className="font-black uppercase text-[9px] tracking-widest text-center">Cash</span>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod("UPI")}
                                        className={cn(
                                            "p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all",
                                            paymentMethod === "UPI" ? "border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-50" : "bg-white border-gray-100 text-gray-400 grayscale"
                                        )}
                                    >
                                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors", paymentMethod === "UPI" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400")}>
                                            <QrCode className="h-5 w-5" />
                                        </div>
                                        <span className="font-black uppercase text-[9px] tracking-widest text-center">Transfer / UPI</span>
                                    </button>
                                </div>

                                {paymentMethod === "UPI" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="flex flex-col items-center p-4 border-2 border-dashed rounded-3xl gap-3 bg-white"
                                    >
                                        {librarians?.data?.find(l => l.id === selectedLibrarianId)?.qrImage ? (
                                            <div className="p-2 bg-white rounded-2xl shadow-md">
                                                <img
                                                    src={librarians.data.find(l => l.id === selectedLibrarianId)?.qrImage!}
                                                    alt="QR Code"
                                                    className="h-32 w-32 object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-32 w-32 bg-gray-50 rounded-2xl border-2 border-dashed flex items-center justify-center text-gray-300 italic text-[10px] text-center px-4 font-bold uppercase tracking-tighter">
                                                No QR code found for authorizer
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Right: Librarian Auth */}
                        <div className="p-6 bg-white rounded-3xl border-2 border-orange-500/10 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <Label className="text-xs font-black text-gray-700 uppercase tracking-tight">2. Authorizer</Label>
                                </div>
                                <Select value={selectedLibrarianId} onValueChange={setSelectedLibrarianId}>
                                    <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-none font-bold shadow-inner">
                                        <SelectValue placeholder="Select yourself" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {librarians?.data?.map(l => (
                                            <SelectItem key={l.id} value={l.id}>{l.firstName} {l.lastName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <Label className="text-xs font-black text-gray-700 uppercase tracking-tight">3. Security PIN</Label>
                                </div>
                                <Input
                                    type="password"
                                    placeholder="••••"
                                    className="h-11 rounded-xl bg-gray-50 border-none font-black text-center text-lg tracking-[0.5em]"
                                    value={pin}
                                    onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl font-bold">
                            Cancel
                        </Button>
                        <Button
                            disabled={!selectedLibrarianId || !pin || isSubmitting}
                            onClick={handleSubmit}
                            className="flex-[2] h-12 bg-green-600 hover:bg-green-700 rounded-xl font-bold shadow-xl shadow-green-100"
                        >
                            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Verify & Activate"}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
