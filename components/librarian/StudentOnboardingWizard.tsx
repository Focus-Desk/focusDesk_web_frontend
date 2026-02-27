"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
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
import {
    Search,
    User,
    Phone,
    Mail,
    Calendar,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Lock,
    Armchair,
    Ticket,
    CreditCard,
    QrCode,
    IndianRupee,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    useSearchStudentByPhoneNumberQuery,
    useGetLibrariansByLibraryIdQuery,
    useGetPlansQuery,
    useGetLockersQuery,
    useGetSeatsForPlanQuery,
    useAdminCreateBookingMutation,
} from "@/state/api";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface StudentOnboardingWizardProps {
    isOpen: boolean;
    onClose: () => void;
    libraryId: string;
}

type Step = "SEARCH" | "STUDENT_INFO" | "SELECTION" | "PAYMENT" | "SUCCESS";

export default function StudentOnboardingWizard({
    isOpen,
    onClose,
    libraryId,
}: StudentOnboardingWizardProps) {
    const [currentStep, setCurrentStep] = useState<Step>("SEARCH");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [studentId, setStudentId] = useState<string | null>(null);
    const [studentData, setStudentData] = useState<any>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        gender: "",
        dob: "",
        aadhaarNumber: "",
    });
    const [isNewStudent, setIsNewStudent] = useState(false);

    const [selectedLibrarianId, setSelectedLibrarianId] = useState<string>("");
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const [selectedSeatId, setSelectedSeatId] = useState<string>("");
    const [selectedLockerId, setSelectedLockerId] = useState<string>("");
    const [couponCode, setCouponCode] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI">("CASH");
    const [pin, setPin] = useState("");

    const { data: searchResult, isFetching: isSearching } = useSearchStudentByPhoneNumberQuery(phoneNumber, {
        skip: phoneNumber.length < 10,
    });

    const { data: librarians } = useGetLibrariansByLibraryIdQuery(libraryId);
    const { data: plans } = useGetPlansQuery(libraryId);
    const { data: lockers } = useGetLockersQuery(libraryId);

    const selectedPlan = plans?.find(p => p.id === selectedPlanId);
    const isFixedPlan = selectedPlan?.planType.toUpperCase() === 'FIXED';

    const { data: seatData } = useGetSeatsForPlanQuery(
        { planId: selectedPlanId, date: new Date().toISOString() },
        { skip: !selectedPlanId || !isFixedPlan }
    );

    const [adminCreateBooking, { isLoading: isBooking }] = useAdminCreateBookingMutation();

    useEffect(() => {
        if (searchResult?.success && searchResult.data) {
            setStudentId(searchResult.data.id);
            setStudentData(searchResult.data);
            setIsNewStudent(false);
        } else if (searchResult?.success && !searchResult.data && phoneNumber.length === 10) {
            setIsNewStudent(true);
            setStudentId(null);
            setStudentData(prev => ({ ...prev, phoneNumber }));
        }
    }, [searchResult, phoneNumber]);

    const handleNext = () => {
        if (currentStep === "SEARCH") {
            if (!isNewStudent && !studentId) {
                toast.error("Please find a student or add a new one");
                return;
            }
            setCurrentStep("STUDENT_INFO");
        } else if (currentStep === "STUDENT_INFO") {
            if (isNewStudent && (!studentData.firstName || !studentData.email)) {
                toast.error("Please fill in basic student details");
                return;
            }
            setCurrentStep("SELECTION");
        } else if (currentStep === "SELECTION") {
            if (!selectedLibrarianId || !selectedPlanId) {
                toast.error("Please select librarian and plan");
                return;
            }
            if (isFixedPlan && !selectedSeatId) {
                toast.error("Please select a seat for the fixed plan");
                return;
            }
            setCurrentStep("PAYMENT");
        }
    };

    const handleBack = () => {
        if (currentStep === "STUDENT_INFO") setCurrentStep("SEARCH");
        if (currentStep === "SELECTION") setCurrentStep("STUDENT_INFO");
        if (currentStep === "PAYMENT") setCurrentStep("SELECTION");
    };

    const handleComplete = async () => {
        if (pin.length < 4) {
            toast.error("Please enter your 4-digit PIN");
            return;
        }

        try {
            const result = await adminCreateBooking({
                librarianId: selectedLibrarianId,
                pin,
                libraryId,
                planId: selectedPlanId,
                studentId: studentId || undefined,
                studentData: isNewStudent ? studentData : undefined,
                seatId: selectedSeatId || undefined,
                lockerId: selectedLockerId || undefined,
                offerCode: couponCode || undefined,
                date: new Date().toISOString(),
                paymentMethod: paymentMethod,
            }).unwrap();

            if (result.success) {
                setCurrentStep("SUCCESS");
            }
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to create booking");
        }
    };

    const steps = [
        { id: "SEARCH", label: "Search" },
        { id: "STUDENT_INFO", label: "Student" },
        { id: "SELECTION", label: "Selection" },
        { id: "PAYMENT", label: "Payment" },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <User className="h-6 w-6" /> Student Onboarding
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Complete the steps to onboard and book a seat for a student.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-between mt-8 relative">
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-400/30 -translate-y-1/2 -z-0" />
                        {steps.map((s, idx) => (
                            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                                <div
                                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep === s.id ? "bg-white text-blue-600 scale-125 shadow-lg" :
                                        steps.findIndex(x => x.id === currentStep) > idx ? "bg-green-400 text-white" : "bg-blue-400 text-blue-100"
                                        }`}
                                >
                                    {steps.findIndex(x => x.id === currentStep) > idx ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                                </div>
                                <span className={`text-xs font-medium ${currentStep === s.id ? "text-white" : "text-blue-200"}`}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {currentStep === "SEARCH" && (
                            <motion.div
                                key="search"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <Label className="text-lg font-semibold flex items-center gap-2">
                                        <Phone className="h-5 w-5 text-blue-600" /> Search by Phone Number
                                    </Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                            type="tel"
                                            placeholder="Enter 10-digit mobile number..."
                                            className="pl-10 h-12 text-lg rounded-xl border-gray-200 focus:ring-blue-500"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                        />
                                    </div>
                                    {isSearching && (
                                        <div className="flex items-center gap-2 text-blue-600 animate-pulse text-sm">
                                            <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                                            Searching student...
                                        </div>
                                    )}

                                    {searchResult?.success && searchResult.data && (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-xl">
                                                    {searchResult.data.firstName?.[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-green-900">{searchResult.data.firstName} {searchResult.data.lastName}</div>
                                                    <div className="text-sm text-green-700">{searchResult.data.email}</div>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-600">Existing Student</Badge>
                                        </div>
                                    )}

                                    {isNewStudent && phoneNumber.length === 10 && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <User className="h-6 w-6 text-blue-600" />
                                                <div>
                                                    <div className="font-bold text-blue-900">Student not found</div>
                                                    <div className="text-sm text-blue-700">Enter details to register a new student.</div>
                                                </div>
                                            </div>
                                            <Button onClick={() => setCurrentStep("STUDENT_INFO")} size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                Add New Student
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {currentStep === "STUDENT_INFO" && (
                            <motion.div
                                key="info"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>First Name</Label>
                                        <Input
                                            placeholder="John"
                                            value={studentData.firstName}
                                            onChange={e => setStudentData({ ...studentData, firstName: e.target.value })}
                                            disabled={!isNewStudent}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Name</Label>
                                        <Input
                                            placeholder="Doe"
                                            value={studentData.lastName}
                                            onChange={e => setStudentData({ ...studentData, lastName: e.target.value })}
                                            disabled={!isNewStudent}
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Email Address</Label>
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={studentData.email}
                                            onChange={e => setStudentData({ ...studentData, email: e.target.value })}
                                            disabled={!isNewStudent}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <Select
                                            value={studentData.gender}
                                            onValueChange={v => setStudentData({ ...studentData, gender: v })}
                                            disabled={!isNewStudent}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MALE">Male</SelectItem>
                                                <SelectItem value="FEMALE">Female</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date of Birth</Label>
                                        <Input
                                            type="date"
                                            value={studentData.dob}
                                            onChange={e => setStudentData({ ...studentData, dob: e.target.value })}
                                            disabled={!isNewStudent}
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Aadhaar Number (Optional)</Label>
                                        <Input
                                            placeholder="1234 5678 9012"
                                            value={studentData.aadhaarNumber}
                                            onChange={e => setStudentData({ ...studentData, aadhaarNumber: e.target.value })}
                                            disabled={!isNewStudent}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === "SELECTION" && (
                            <motion.div
                                key="selection"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 font-semibold">
                                            <User className="h-4 w-4 text-blue-600" /> Responsible Librarian
                                        </Label>
                                        <Select value={selectedLibrarianId} onValueChange={setSelectedLibrarianId}>
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Select a librarian" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {librarians?.data?.map(l => (
                                                    <SelectItem key={l.id} value={l.id}>
                                                        {l.firstName} {l.lastName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 font-semibold">
                                            <Calendar className="h-4 w-4 text-blue-600" /> Select Plan
                                        </Label>
                                        <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Select a plan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {plans?.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.planName} ({p.planType}) - ₹{Number(p.price)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {isFixedPlan && (
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 font-semibold">
                                                <Armchair className="h-4 w-4 text-blue-600" /> Select Seat
                                            </Label>
                                            <div className="grid grid-cols-6 gap-2 p-4 bg-gray-50 rounded-xl border max-h-[200px] overflow-y-auto">
                                                {seatData?.data?.seats?.filter((s: any) => s.isSelectable).map((s: any) => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => setSelectedSeatId(s.id)}
                                                        className={`h-10 text-sm font-medium rounded-lg border transition-all ${selectedSeatId === s.id
                                                            ? "bg-blue-600 text-white border-blue-700 shadow-md"
                                                            : "bg-white text-gray-700 hover:border-blue-300"
                                                            }`}
                                                    >
                                                        {s.seatNumber}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 font-semibold">
                                                <Lock className="h-4 w-4 text-blue-600" /> Locker (Opt)
                                            </Label>
                                            <Select value={selectedLockerId} onValueChange={setSelectedLockerId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="None" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No Locker</SelectItem>
                                                    {lockers?.map(l => (
                                                        <SelectItem key={l.id} value={l.id}>
                                                            Locker {l.lockerNumber} (₹{Number(l.price)})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 font-semibold">
                                                <Ticket className="h-4 w-4 text-blue-600" /> Coupon
                                            </Label>
                                            <Input
                                                placeholder="ENTER CODE"
                                                value={couponCode}
                                                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === "PAYMENT" && (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-center text-center space-y-4">
                                    <div className="text-sm font-medium text-blue-600 uppercase tracking-wider">Total Payable</div>
                                    <div className="text-4xl font-extrabold text-blue-900 flex items-center gap-1">
                                        <IndianRupee className="h-8 w-8" />
                                        {selectedPlan?.price ? Number(selectedPlan.price) : 0}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-lg font-semibold">Select Payment Method</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setPaymentMethod("CASH")}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "CASH" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-100 text-gray-400 grayscale"
                                                }`}
                                        >
                                            <IndianRupee className="h-8 w-8" />
                                            <span className="font-bold">Cash</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod("UPI")}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "UPI" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-100 text-gray-400 grayscale"
                                                }`}
                                        >
                                            <QrCode className="h-8 w-8" />
                                            <span className="font-bold">UPI / QR</span>
                                        </button>
                                    </div>

                                    {paymentMethod === "UPI" && (
                                        <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-xl gap-4">
                                            {librarians?.data?.find(l => l.id === selectedLibrarianId)?.qrImage ? (
                                                <div className="p-2 bg-white rounded-lg shadow-inner">
                                                    <img
                                                        src={librarians.data.find(l => l.id === selectedLibrarianId)?.qrImage!}
                                                        alt="QR Code"
                                                        className="h-40 w-40 object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-40 w-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 italic text-sm text-center px-4">
                                                    No QR Image available for this librarian.
                                                </div>
                                            )}
                                            <p className="text-xs text-center text-gray-500 max-w-[200px]">
                                                Scan the QR code to take payment via any UPI app.
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-lg font-bold">Librarian Authorization</Label>
                                            <Badge variant="outline" className="text-blue-600 border-blue-200">Required</Badge>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-500 text-xs">ENTER YOUR 4-DIGIT PIN TO AUTHORIZE ACTION</Label>
                                            <div className="flex gap-4 justify-center">
                                                {[0, 1, 2, 3].map(i => (
                                                    <div key={i} className="relative">
                                                        <input
                                                            type="password"
                                                            maxLength={1}
                                                            value={pin[i] || ""}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/\D/g, "");
                                                                if (!val && e.target.previousElementSibling) (e.target.previousElementSibling as HTMLInputElement).focus();
                                                                if (val) {
                                                                    const newPin = pin.split("");
                                                                    newPin[i] = val;
                                                                    setPin(newPin.join(""));
                                                                    if (e.target.nextElementSibling) (e.target.nextElementSibling as HTMLInputElement).focus();
                                                                }
                                                            }}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Backspace' && !pin[i] && (e.target as HTMLInputElement).previousElementSibling) {
                                                                    ((e.target as HTMLInputElement).previousElementSibling as HTMLInputElement).focus();
                                                                }
                                                            }}
                                                            className="w-12 h-16 text-center text-2xl font-bold bg-gray-100 rounded-xl focus:ring-4 focus:ring-blue-100 border-none transition-all"
                                                        />
                                                        {pin[i] && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 bg-blue-600 rounded-full" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === "SUCCESS" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center space-y-6 text-center"
                            >
                                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <CheckCircle2 className="h-16 w-16" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-extrabold text-gray-900">Registration Complete!</h2>
                                    <p className="text-gray-500 mt-2">The student has been successfully onboarded and booked.</p>
                                </div>
                                <div className="w-full bg-gray-50 p-6 rounded-2xl border space-y-3 text-left">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Student</span>
                                        <span className="font-bold text-gray-900">{studentData.firstName} {studentData.lastName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Plan</span>
                                        <span className="font-bold text-gray-900">{selectedPlan?.planName}</span>
                                    </div>
                                    {isFixedPlan && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Seat Number</span>
                                            <span className="font-bold text-blue-600">Seat {seatData?.data?.seats?.find((s: any) => s.id === selectedSeatId)?.seatNumber}</span>
                                        </div>
                                    )}
                                    <div className="border-t pt-3 flex justify-between items-center">
                                        <span className="text-gray-500">Status</span>
                                        <Badge className="bg-green-600">ACTIVE</Badge>
                                    </div>
                                </div>
                                <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold rounded-xl shadow-lg shadow-blue-200">
                                    Finish & Close
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {currentStep !== "SUCCESS" && (
                    <div className="p-6 bg-gray-50 border-t flex justify-between gap-4">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={currentStep === "SEARCH"}
                            className="px-6 rounded-xl border-gray-300 font-semibold"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" /> Back
                        </Button>

                        {currentStep === "PAYMENT" ? (
                            <Button
                                onClick={handleComplete}
                                disabled={isBooking || pin.length < 4}
                                className="bg-green-600 hover:bg-green-700 px-8 rounded-xl font-bold shadow-lg shadow-green-100 flex-1"
                            >
                                {isBooking ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                        Processing...
                                    </div>
                                ) : (
                                    <>Authorize & Complete <ChevronRight className="h-4 w-4 ml-2" /></>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleNext}
                                className="bg-blue-600 hover:bg-blue-700 px-8 rounded-xl font-bold shadow-lg shadow-blue-100 flex-1"
                            >
                                Continue <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
