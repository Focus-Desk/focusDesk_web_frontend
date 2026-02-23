"use client";

import React, { useState, useEffect, useMemo } from "react";
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
    FileUp,
    Check,
    Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    useSearchStudentByPhoneNumberQuery,
    useGetLibrariansByLibraryIdQuery,
    useGetPlansQuery,
    useGetLockersQuery,
    useGetSeatsForPlanQuery,
    useAdminCreateBookingMutation,
    useGetStudentByEmailQuery,
    useUploadAadhaarMutation,
    useCalculatePricingMutation,
} from "@/state/api";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StudentOnboardingFlowProps {
    libraryId: string;
}

type Step = "SEARCH" | "STUDENT_INFO" | "SELECTION" | "PAYMENT" | "SUCCESS";

export default function StudentOnboardingFlow({ libraryId }: StudentOnboardingFlowProps) {
    const [currentStep, setCurrentStep] = useState<Step>("SEARCH");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [isNewStudent, setIsNewStudent] = useState(false);

    // Student Info
    const [studentData, setStudentData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        gender: "MALE",
        dob: "",
        aadhaarNumber: "",
        aadhaarUrl: "",
    });

    // Booking Selection
    const [selectedPlanId, setSelectedPlanId] = useState("");
    const [selectedSeatId, setSelectedSeatId] = useState("");
    const [selectedLockerId, setSelectedLockerId] = useState("");
    const [selectedLibrarianId, setSelectedLibrarianId] = useState("");
    const [pin, setPin] = useState("");
    const [couponCode, setCouponCode] = useState("");

    // API Hooks
    const { data: searchResult, isFetching: isSearching } = useSearchStudentByPhoneNumberQuery(
        phoneNumber,
        { skip: phoneNumber.length < 10 }
    );
    const { data: librarians } = useGetLibrariansByLibraryIdQuery(libraryId);
    const { data: plans } = useGetPlansQuery(libraryId);
    const { data: lockers } = useGetLockersQuery(libraryId);
    const { data: seatData } = useGetSeatsForPlanQuery(
        { planId: selectedPlanId, date: new Date().toISOString().split("T")[0] },
        { skip: !selectedPlanId }
    );
    const { data: emailCheck, isFetching: isCheckingEmail } = useGetStudentByEmailQuery(
        studentData.email,
        { skip: !isNewStudent || !studentData.email.includes("@") }
    );

    const [adminCreateBooking, { isLoading: isSubmitting }] = useAdminCreateBookingMutation();
    const [uploadAadhaar, { isLoading: isUploading }] = useUploadAadhaarMutation();
    const [calculatePricing, { isLoading: isCalculating }] = useCalculatePricingMutation();

    const [pricingData, setPricingData] = useState<{
        monthlyFee: number;
        monthsRequested: number;
        lockerPrice: number;
        packageDiscountPct: number;
        packageDiscountAmt: number;
        offerApplied: any;
        taxes: number;
        total: number;
    } | null>(null);

    const selectedPlan = useMemo(() => plans?.find(p => p.id === selectedPlanId), [plans, selectedPlanId]);

    const handleAadhaarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("aadhaar", file);

        try {
            const result = await uploadAadhaar(formData).unwrap();
            setStudentData(prev => ({ ...prev, aadhaarUrl: result.url }));
            toast.success("Aadhaar uploaded successfully");
        } catch (err) {
            toast.error("Failed to upload Aadhaar");
        }
    };

    const handleNext = async () => {
        if (currentStep === "SEARCH") {
            if (selectedStudentId || isNewStudent) {
                if (isNewStudent) {
                    setStudentData(prev => ({ ...prev, phoneNumber }));
                    setCurrentStep("STUDENT_INFO");
                } else {
                    const student = searchResult?.data;
                    setStudentData({
                        firstName: student.firstName,
                        lastName: student.lastName || "",
                        email: student.email,
                        phoneNumber: student.phoneNumber || phoneNumber,
                        gender: student.gender || "MALE",
                        dob: student.dob ? new Date(student.dob).toISOString().split("T")[0] : "",
                        aadhaarNumber: student.aadhaarNumber || "",
                        aadhaarUrl: student.aadhaarUrl || "",
                    });
                    setCurrentStep("SELECTION");
                }
            }
        } else if (currentStep === "STUDENT_INFO") {
            setCurrentStep("SELECTION");
        } else if (currentStep === "SELECTION") {
            // Fetch pricing from backend before showing confirmation
            try {
                const result = await calculatePricing({
                    planId: selectedPlanId,
                    monthsRequested: 1,
                    lockerId: selectedLockerId || undefined,
                    offerCode: couponCode || undefined,
                }).unwrap();
                if (result.success) {
                    setPricingData(result.data);
                }
            } catch (err) {
                toast.error("Failed to calculate pricing");
            }
            setCurrentStep("PAYMENT");
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
                studentId: selectedStudentId || undefined,
                studentData: isNewStudent ? studentData : undefined,
                seatId: selectedSeatId || undefined,
                lockerId: selectedLockerId || undefined,
                offerCode: couponCode || undefined,
                date: new Date().toISOString(),
            }).unwrap();

            if (result.success) {
                setCurrentStep("SUCCESS");
                toast.success("Booking created points successfully!");
            }
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to create booking");
        }
    };

    const steps = [
        { id: "SEARCH", label: "Identification" },
        { id: "STUDENT_INFO", label: "Student Details" },
        { id: "SELECTION", label: "Seat & Plan" },
        { id: "PAYMENT", label: "Confirmation" },
    ];

    const currentStepIdx = steps.findIndex(s => s.id === currentStep);

    if (currentStep === "SUCCESS") {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border shadow-sm space-y-6">
                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle2 className="h-16 w-16" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-extrabold text-gray-900">Onboarding Successful!</h2>
                    <p className="text-gray-500 max-w-md">Student has been onboarded and the booking is confirmed. They can now start using their seat.</p>
                </div>
                <Button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg rounded-2xl shadow-xl shadow-blue-100"
                >
                    Return to Directory
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header / Stepper */}
            <div className="mb-10">
                <div className="flex justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 -z-0" />
                    <div
                        className="absolute top-4 left-0 h-0.5 bg-blue-600 transition-all duration-500 -z-0"
                        style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                    />
                    {steps.map((s, idx) => (
                        <div key={s.id} className={cn(
                            "relative z-10 flex flex-col items-center gap-3",
                            (idx > currentStepIdx && s.id !== "STUDENT_INFO") || (s.id === "STUDENT_INFO" && !isNewStudent) ? "opacity-50" : ""
                        )}>
                            <div className={cn(
                                "h-9 w-9 rounded-full flex items-center justify-center font-bold transition-all duration-300",
                                currentStep === s.id ? "bg-blue-600 text-white ring-4 ring-blue-50 scale-110" :
                                    idx < currentStepIdx ? "bg-green-500 text-white" : "bg-white border-2 text-gray-400"
                            )}>
                                {idx < currentStepIdx ? <Check className="h-5 w-5" /> : idx + 1}
                            </div>
                            <span className={cn(
                                "text-sm font-bold",
                                currentStep === s.id ? "text-blue-600" : "text-gray-500"
                            )}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-3xl border shadow-sm p-4 md:p-10">
                <AnimatePresence mode="wait">
                    {currentStep === "SEARCH" && (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <Label className="text-xl font-bold text-gray-800">Enter Student Mobile Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="tel"
                                        placeholder="e.g. 9876543210"
                                        className="pl-12 h-14 text-xl rounded-2xl border-gray-200 focus:ring-blue-500"
                                        value={phoneNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                            setPhoneNumber(val);
                                            setSelectedStudentId(null);
                                            setIsNewStudent(false);
                                        }}
                                    />
                                </div>

                                {isSearching && (
                                    <div className="flex items-center gap-3 text-blue-600 font-medium px-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Checking directory...
                                    </div>
                                )}

                                {searchResult?.success && (
                                    <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
                                        {searchResult.data ? (
                                            <div className={cn(
                                                "p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                                                selectedStudentId === searchResult.data.id ? "bg-blue-50 border-blue-400 ring-1 ring-blue-400" : "bg-gray-50 border-gray-200 hover:bg-white hover:border-blue-200"
                                            )} onClick={() => {
                                                setSelectedStudentId(searchResult.data.id);
                                                setIsNewStudent(false);
                                            }}>
                                                <div className="flex items-center gap-5">
                                                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-2xl">
                                                        {searchResult.data.firstName?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="text-xl font-extrabold text-gray-900">{searchResult.data.firstName} {searchResult.data.lastName}</div>
                                                        <div className="text-gray-500 flex items-center gap-1.5 font-medium">
                                                            <Mail className="h-4 w-4" /> {searchResult.data.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "h-10 px-6 rounded-xl flex items-center justify-center font-bold transition-colors",
                                                    selectedStudentId === searchResult.data.id ? "bg-blue-600 text-white" : "bg-white border-2 text-gray-600"
                                                )}>
                                                    {selectedStudentId === searchResult.data.id ? "Selected" : "Select"}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={cn(
                                                "p-6 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                                                isNewStudent ? "bg-blue-50 border-blue-400 ring-1 ring-blue-400" : "bg-gray-50 border-gray-200 hover:bg-white hover:border-blue-200"
                                            )} onClick={() => {
                                                setIsNewStudent(true);
                                                setSelectedStudentId(null);
                                            }}>
                                                <div className="flex items-center gap-5">
                                                    <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                                        <User className="h-8 w-8" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xl font-extrabold text-gray-900">New Student</div>
                                                        <p className="text-gray-500 font-medium">This number is not registered. Click to create a new profile.</p>
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "h-10 px-6 rounded-xl flex items-center justify-center font-bold transition-colors",
                                                    isNewStudent ? "bg-blue-600 text-white" : "bg-white border-2 text-gray-600"
                                                )}>
                                                    {isNewStudent ? "Selected" : "Create New"}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="pt-6">
                                <Button
                                    disabled={!selectedStudentId && !isNewStudent}
                                    onClick={handleNext}
                                    className="w-full h-14 text-xl font-bold bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xl shadow-blue-100 transition-all"
                                >
                                    Continue to {isNewStudent ? "Profile Creation" : "Booking Details"}
                                    <ChevronRight className="ml-2 h-6 w-6" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "STUDENT_INFO" && (
                        <motion.div
                            key="info"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-bold">First Name</Label>
                                    <Input
                                        className="h-12 rounded-xl"
                                        value={studentData.firstName}
                                        onChange={e => setStudentData(prev => ({ ...prev, firstName: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Last Name</Label>
                                    <Input
                                        className="h-12 rounded-xl"
                                        value={studentData.lastName}
                                        onChange={e => setStudentData(prev => ({ ...prev, lastName: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="font-bold">Email Address</Label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            className={cn(
                                                "h-12 rounded-xl",
                                                emailCheck?.email ? "border-red-500 ring-red-100 ring-2" : ""
                                            )}
                                            value={studentData.email}
                                            onChange={e => setStudentData(prev => ({ ...prev, email: e.target.value }))}
                                        />
                                        {isCheckingEmail && <Loader2 className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-blue-600" />}
                                        {emailCheck?.email && (
                                            <p className="text-red-500 text-xs mt-1 font-bold">This email is already registered!</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Gender</Label>
                                    <Select
                                        value={studentData.gender}
                                        onValueChange={val => setStudentData(prev => ({ ...prev, gender: val }))}
                                    >
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MALE">Male</SelectItem>
                                            <SelectItem value="FEMALE">Female</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Date of Birth</Label>
                                    <Input
                                        type="date"
                                        className="h-12 rounded-xl"
                                        value={studentData.dob}
                                        onChange={e => setStudentData(prev => ({ ...prev, dob: e.target.value }))}
                                    />
                                </div>

                                <div className="md:col-span-2 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-sm border">
                                            <FileUp className="h-7 w-7 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-extrabold text-gray-900">Upload Aadhaar PDF (Optional)</h4>
                                            <p className="text-sm text-gray-500">Supports PDF files up to 5MB</p>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                type="file"
                                                accept=".pdf"
                                                className="hidden"
                                                id="aadhaar-upload"
                                                onChange={handleAadhaarUpload}
                                            />
                                            <Label
                                                htmlFor="aadhaar-upload"
                                                className={cn(
                                                    "cursor-pointer flex items-center gap-2 h-11 px-6 rounded-xl font-bold transition-all",
                                                    studentData.aadhaarUrl ? "bg-green-600 text-white" : "bg-white border-2 hover:bg-gray-100"
                                                )}
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : studentData.aadhaarUrl ? (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                ) : <FileUp className="h-4 w-4" />}
                                                {studentData.aadhaarUrl ? "Uploaded Successfully" : "Choose File"}
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="outline" onClick={() => setCurrentStep("SEARCH")} className="flex-1 h-14 rounded-2xl font-bold">
                                    <ChevronLeft className="mr-2 h-5 w-5" /> Back
                                </Button>
                                <Button
                                    disabled={!studentData.firstName || !studentData.email || emailCheck?.email}
                                    onClick={() => setCurrentStep("SELECTION")}
                                    className="flex-[2] h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold shadow-xl shadow-blue-100"
                                >
                                    Proceed to Plan Selection
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "SELECTION" && (
                        <motion.div
                            key="selection"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {/* Plans Selection - Grid of Custom Cards */}
                            <div className="space-y-4">
                                <Label className="text-xl font-bold text-gray-800">Select Subscription Plan</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {plans?.map((plan: any) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => {
                                                setSelectedPlanId(plan.id);
                                                setSelectedSeatId("");
                                            }}
                                            className={cn(
                                                "relative p-6 rounded-3xl border-2 transition-all cursor-pointer overflow-hidden",
                                                selectedPlanId === plan.id
                                                    ? "bg-[#E6F0FF] border-blue-500 shadow-md ring-1 ring-blue-500"
                                                    : "bg-white border-gray-100 hover:border-blue-200"
                                            )}
                                        >
                                            <div className="flex flex-col gap-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-2xl font-black text-gray-900">₹{plan.price}</span>
                                                            <span className="text-sm font-bold text-gray-400">/ month</span>
                                                        </div>
                                                        {plan.planName && (
                                                            <div className="text-sm font-bold text-gray-600 mt-0.5">{plan.planName}</div>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="bg-[#D48D6C] text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                                                {plan.hours} hrs/ day
                                                            </span>
                                                            <span className="text-[10px] font-black italic text-gray-600 uppercase">
                                                                {plan.planType === "Fixed" ? "Fixed seat" : "Flexi seat"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {(plan.formattedTiming && plan.formattedTiming !== "No timing configured") || plan.slotPools?.length > 0 ? (
                                                        <div className="text-right">
                                                            <span className="text-sm font-black text-gray-800 uppercase tracking-tighter block mb-2">Timing:</span>
                                                            <div className="flex flex-wrap gap-2 justify-end">
                                                                {plan.formattedTiming && plan.formattedTiming !== "No timing configured" && (
                                                                    <div className="bg-white px-3 py-1 rounded-lg border shadow-sm text-[10px] font-bold text-gray-700">
                                                                        {plan.formattedTiming}
                                                                    </div>
                                                                )}
                                                                {plan.slotPools?.map((pool: string) => (
                                                                    <div key={pool} className="bg-white px-3 py-1 rounded-lg border border-blue-200 shadow-sm text-[10px] font-bold text-blue-600 capitalize">
                                                                        {pool.toLowerCase()}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : null}
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

                            {/* Seat Grid if Fixed */}
                            {selectedPlan?.planType === "Fixed" && (
                                <div className="space-y-4 animate-in fade-in duration-500">
                                    <Label className="text-xl font-bold text-gray-800">Select Available Seat</Label>
                                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 p-6 bg-gray-50 rounded-3xl border border-gray-100 min-h-[150px]">
                                        {seatData?.data?.seats?.filter((s: any) => s.isSelectable).map((s: any) => (
                                            <button
                                                key={s.id}
                                                onClick={() => setSelectedSeatId(s.id)}
                                                className={cn(
                                                    "h-10 text-sm font-extrabold rounded-xl border transition-all",
                                                    selectedSeatId === s.id
                                                        ? "bg-blue-600 text-white border-blue-700 shadow-lg scale-110 z-10"
                                                        : "bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                                                )}
                                            >
                                                {s.seatNumber}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Locker Option */}
                            <div className="space-y-4">
                                <Label className="text-xl font-bold text-gray-800">Add-on Locker (Optional)</Label>
                                <div className="flex flex-wrap gap-4">
                                    {lockers?.map((locker: any) => (
                                        <Button
                                            key={locker.id}
                                            variant={selectedLockerId === locker.id ? "default" : "outline"}
                                            onClick={() => setSelectedLockerId(prev => prev === locker.id ? "" : locker.id)}
                                            className={cn(
                                                "h-12 px-6 rounded-xl font-bold transition-all",
                                                selectedLockerId === locker.id ? "bg-blue-600 text-white" : "border-gray-200"
                                            )}
                                        >
                                            <Lock className="mr-2 h-4 w-4" />
                                            {locker.lockerType} - Rs. {locker.price}/mo
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="outline" onClick={() => setCurrentStep(isNewStudent ? "STUDENT_INFO" : "SEARCH")} className="flex-1 h-14 rounded-2xl font-bold">
                                    <ChevronLeft className="mr-2 h-5 w-5" /> Back
                                </Button>
                                <Button
                                    disabled={!selectedPlanId || (selectedPlan?.planType === "Fixed" && !selectedSeatId)}
                                    onClick={() => setCurrentStep("PAYMENT")}
                                    className="flex-[2] h-14 bg-blue-600 hover:bg-blue-700 rounded-2xl font-bold shadow-xl shadow-blue-100"
                                >
                                    Proceed to Confirmation
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === "PAYMENT" && (
                        <motion.div
                            key="payment"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 space-y-6">
                                <div className="flex items-center gap-4 border-b border-blue-200 pb-4">
                                    <div className="h-14 w-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-2xl">
                                        {studentData.firstName?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900">{studentData.firstName} {studentData.lastName}</h3>
                                        <p className="text-blue-600 font-bold">{phoneNumber}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Plan Selected</span>
                                        <div className="font-extrabold text-gray-900 text-lg">{selectedPlan?.planName}</div>
                                        <div className="text-sm text-gray-500 font-medium">{selectedPlan?.hours} Hours Daily • {selectedPlan?.planType} Seat</div>
                                    </div>
                                    {selectedSeatId && (
                                        <div className="space-y-1">
                                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Allocated Seat</span>
                                            <div className="font-extrabold text-blue-600 text-xl">
                                                Seat {seatData?.data?.seats?.find((s: any) => s.id === selectedSeatId)?.seatNumber}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Pricing Breakdown */}
                                {isCalculating ? (
                                    <div className="flex items-center justify-center gap-3 py-6 text-blue-600 font-bold">
                                        <Loader2 className="h-5 w-5 animate-spin" /> Calculating price...
                                    </div>
                                ) : pricingData ? (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600 font-medium">Plan Base Price ({pricingData.monthsRequested} month{pricingData.monthsRequested > 1 ? 's' : ''})</span>
                                            <span className="font-bold text-gray-800">₹{pricingData.monthlyFee * pricingData.monthsRequested}</span>
                                        </div>
                                        {pricingData.packageDiscountAmt > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-green-600 font-medium">Package Discount ({pricingData.packageDiscountPct}%)</span>
                                                <span className="font-bold text-green-600">-₹{pricingData.packageDiscountAmt.toFixed(0)}</span>
                                            </div>
                                        )}
                                        {pricingData.lockerPrice > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 font-medium">Locker Add-on</span>
                                                <span className="font-bold text-gray-800">₹{pricingData.lockerPrice}</span>
                                            </div>
                                        )}
                                        {pricingData.offerApplied && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-green-600 font-medium">Coupon ({pricingData.offerApplied.code})</span>
                                                <span className="font-bold text-green-600">-₹{pricingData.offerApplied.discount.toFixed(0)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                                            <span className="font-extrabold text-gray-900 text-lg">Total Amount</span>
                                            <span className="text-2xl font-black text-blue-700">₹{pricingData.total.toFixed(0)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white/50 p-4 rounded-2xl flex justify-between items-center">
                                        <span className="font-extrabold text-gray-900">Total Subscription Amount</span>
                                        <span className="text-2xl font-black text-blue-700">₹{selectedPlan?.price}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-bold">Select Librarian (Authorizer)</Label>
                                    <Select value={selectedLibrarianId} onValueChange={setSelectedLibrarianId}>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Select who is processing..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {librarians?.data?.map((lib: any) => (
                                                <SelectItem key={lib.id} value={lib.id}>
                                                    {lib.firstName} {lib.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Authorization PIN</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            type="password"
                                            placeholder="Enter your 4-6 digit PIN"
                                            className="pl-10 h-12 rounded-xl"
                                            value={pin}
                                            onChange={e => setPin(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="font-bold">Coupon Code (Optional)</Label>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <Ticket className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                            <Input
                                                placeholder="ENTER OFFER CODE"
                                                className="pl-10 h-12 rounded-xl uppercase font-black"
                                                value={couponCode}
                                                onChange={e => setCouponCode(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            disabled={!couponCode || isCalculating}
                                            onClick={async () => {
                                                try {
                                                    const result = await calculatePricing({
                                                        planId: selectedPlanId,
                                                        monthsRequested: 1,
                                                        lockerId: selectedLockerId || undefined,
                                                        offerCode: couponCode || undefined,
                                                    }).unwrap();
                                                    if (result.success) {
                                                        setPricingData(result.data);
                                                        if (result.data.offerApplied) {
                                                            toast.success(`Coupon "${result.data.offerApplied.code}" applied!`);
                                                        } else {
                                                            toast.error("Invalid or expired coupon code");
                                                        }
                                                    }
                                                } catch (err) {
                                                    toast.error("Failed to apply coupon");
                                                }
                                            }}
                                            className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold"
                                        >
                                            {isCalculating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button variant="outline" onClick={() => setCurrentStep("SELECTION")} className="flex-1 h-14 rounded-2xl font-bold">
                                    <ChevronLeft className="mr-2 h-5 w-5" /> Back
                                </Button>
                                <Button
                                    disabled={!selectedLibrarianId || !pin || isSubmitting}
                                    onClick={handleSubmit}
                                    className="flex-[2] h-14 bg-green-600 hover:bg-green-700 rounded-2xl font-bold shadow-xl shadow-green-100"
                                >
                                    {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Confirm & Create Booking"}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
