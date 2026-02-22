"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    useLazySearchStudentByMobileQuery,
    useGetPlansQuery,
    useGetDetailedLibrarySeatsQuery,
    useGetLockersQuery,
    useCreateStudentMutation,
    useCreateBookingMutation,
    DetailedSeat
} from "@/state/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Search, UserPlus, Check, ChevronRight, ChevronLeft,
    User, CreditCard, LayoutGrid, Box, Phone, Mail,
    MapPin, Calendar, ArrowLeft, Loader2, Landmark, Info,
    FileText, UploadCloud, X, Cake, Smile, Plus, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type Step = "IDENTITY" | "PLAN" | "SEAT" | "LOCKER" | "REVIEW";

export default function AddStudentPage() {
    const { id } = useParams();
    const router = useRouter();
    const libraryId = Array.isArray(id) ? id[0] : id;

    const [currentStep, setCurrentStep] = useState<Step>("IDENTITY");
    const [mobileNumber, setMobileNumber] = useState("");
    const [student, setStudent] = useState<any>(null);
    const [newStudentData, setNewStudentData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        gender: "Male",
        age: "",
        dob: "",
        aadhaarNumber: "",
        state: "",
        area: "",
        address: "",
        about: "",
        interests: [] as string[]
    });
    const [interestInput, setInterestInput] = useState("");
    const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);

    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [selectedSeat, setSelectedSeat] = useState<DetailedSeat | null>(null);
    const [selectedLocker, setSelectedLocker] = useState<any>(null);

    // API Hooks
    const [triggerSearch, { data: searchedStudent, isFetching: isSearching, isError: searchError }] = useLazySearchStudentByMobileQuery();
    const { data: plans, isLoading: plansLoading } = useGetPlansQuery(libraryId);
    const { data: libraryData, isLoading: seatsLoading } = useGetDetailedLibrarySeatsQuery(libraryId);
    const { data: lockers, isLoading: lockersLoading } = useGetLockersQuery(libraryId);

    const [createStudent, { isLoading: isCreatingStudent }] = useCreateStudentMutation();
    const [createBooking, { isLoading: isCreatingBooking }] = useCreateBookingMutation();

    const seats = libraryData?.data?.seats || [];
    const libraryName = libraryData?.data?.library?.libraryName || "Library";

    // Step 1: Search Logic
    const handleSearch = async () => {
        if (mobileNumber.length < 10) {
            toast.error("Please enter a valid 10-digit mobile number");
            return;
        }
        const result = await triggerSearch(mobileNumber).unwrap();
        if (result) {
            setStudent(result);
            toast.success("Student found!");
        } else {
            setStudent(null);
            toast.info("Student not found. Please fill the registration form.");
        }
    };

    const handleNextStep = () => {
        if (currentStep === "IDENTITY") {
            if (!student && (!newStudentData.firstName || !newStudentData.email)) {
                toast.error("Please provide student details first");
                return;
            }
            setCurrentStep("PLAN");
        } else if (currentStep === "PLAN") {
            if (!selectedPlan) {
                toast.error("Please select a plan");
                return;
            }
            if (selectedPlan.planType === "Fixed") {
                setCurrentStep("SEAT");
            } else {
                setCurrentStep("LOCKER");
            }
        } else if (currentStep === "SEAT") {
            if (!selectedSeat) {
                toast.error("Please select a seat");
                return;
            }
            setCurrentStep("LOCKER");
        } else if (currentStep === "LOCKER") {
            setCurrentStep("REVIEW");
        }
    };

    const handlePrevStep = () => {
        if (currentStep === "PLAN") setCurrentStep("IDENTITY");
        else if (currentStep === "SEAT") setCurrentStep("PLAN");
        else if (currentStep === "LOCKER") {
            if (selectedPlan?.planType === "Fixed") setCurrentStep("SEAT");
            else setCurrentStep("PLAN");
        }
        else if (currentStep === "REVIEW") setCurrentStep("LOCKER");
    };

    const handleSubmit = async () => {
        try {
            let activeStudent = student;

            // 1. Create student if new
            if (!activeStudent) {
                activeStudent = await createStudent({
                    ...newStudentData,
                    phoneNumber: mobileNumber
                }).unwrap();
            }

            // 2. Create booking
            // Calculate validTo based on plan (mocked for now, usually 1 month)
            const validFrom = new Date();
            const validTo = new Date();
            validTo.setMonth(validTo.getMonth() + 1);

            await createBooking({
                libraryId,
                studentId: activeStudent.id,
                planId: selectedPlan.id,
                seatId: selectedSeat?.id,
                lockerId: selectedLocker?.id,
                validFrom: validFrom.toISOString(),
                validTo: validTo.toISOString(),
                totalAmount: selectedPlan.price + (selectedLocker?.price || 0)
            }).unwrap();

            toast.success("Plan assigned successfully!");
            router.push(`/librarian/libraries/${libraryId}?tab=students`);
        } catch (error) {
            console.error("Submission failed:", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="-ml-2 text-gray-500 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Library
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assign New Plan</h1>
                    <p className="text-gray-500 text-sm">Follow the steps to register a student and assign a study plan.</p>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{libraryName}</p>
                        <p className="text-[10px] text-blue-600 font-medium uppercase tracking-wider">Librarian Access</p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 italic font-bold">
                        <Landmark className="h-5 w-5 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white p-4 rounded-2xl border shadow-sm flex justify-between gap-2 overflow-x-auto">
                <StepIndicator current={currentStep} target="IDENTITY" label="Student" icon={<User className="h-4 w-4" />} />
                <StepDivider />
                <StepIndicator current={currentStep} target="PLAN" label="Plan" icon={<CreditCard className="h-4 w-4" />} />
                <StepDivider />
                <StepIndicator current={currentStep} target="SEAT" label="Seat" icon={<LayoutGrid className="h-4 w-4" />} disabled={selectedPlan?.planType !== "Fixed" && currentStep !== "IDENTITY" && currentStep !== "PLAN"} />
                <StepDivider />
                <StepIndicator current={currentStep} target="LOCKER" label="Locker" icon={<Box className="h-4 w-4" />} />
                <StepDivider />
                <StepIndicator current={currentStep} target="REVIEW" label="Review" icon={<Check className="h-4 w-4" />} />
            </div>

            {/* Step Content */}
            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    {currentStep === "IDENTITY" && (
                        <motion.div key="identity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <IdentityStep
                                mobile={mobileNumber}
                                setMobile={setMobileNumber}
                                onSearch={handleSearch}
                                isSearching={isSearching}
                                student={student}
                                newStudentData={newStudentData}
                                setNewStudentData={setNewStudentData}
                                interestInput={interestInput}
                                setInterestInput={setInterestInput}
                                aadhaarFile={aadhaarFile}
                                setAadhaarFile={setAadhaarFile}
                            />
                        </motion.div>
                    )}

                    {currentStep === "PLAN" && (
                        <motion.div key="plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <PlanStep
                                plans={plans || []}
                                selectedPlan={selectedPlan}
                                setSelectedPlan={setSelectedPlan}
                                isLoading={plansLoading}
                            />
                        </motion.div>
                    )}

                    {currentStep === "SEAT" && (
                        <motion.div key="seat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <SeatStep
                                seats={seats}
                                selectedSeat={selectedSeat}
                                setSelectedSeat={setSelectedSeat}
                                isLoading={seatsLoading}
                            />
                        </motion.div>
                    )}

                    {currentStep === "LOCKER" && (
                        <motion.div key="locker" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <LockerStep
                                lockers={lockers || []}
                                selectedLocker={selectedLocker}
                                setSelectedLocker={setSelectedLocker}
                                isLoading={lockersLoading}
                            />
                        </motion.div>
                    )}

                    {currentStep === "REVIEW" && (
                        <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <ReviewStep
                                student={student || newStudentData}
                                plan={selectedPlan}
                                seat={selectedSeat}
                                locker={selectedLocker}
                                isSubmitting={isCreatingStudent || isCreatingBooking}
                                onSubmit={handleSubmit}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="flex justify-between items-center py-6 border-t pt-8">
                <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStep === "IDENTITY"}
                    className="rounded-xl h-12 px-6 border-gray-200"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                {currentStep !== "REVIEW" && (
                    <Button
                        onClick={handleNextStep}
                        className="rounded-xl h-12 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
                    >
                        Next Step <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

// --- Components ---

function StepIndicator({ current, target, label, icon, disabled }: { current: Step, target: Step, label: string, icon: React.ReactNode, disabled?: boolean }) {
    const isActive = current === target;
    const isCompleted = getStepSequence(current) > getStepSequence(target);

    return (
        <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
            isActive ? "bg-blue-50 text-blue-600 border border-blue-100" : "text-gray-400",
            disabled && "opacity-30 grayscale pointer-events-none"
        )}>
            <div className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold",
                isActive ? "bg-blue-600 text-white shadow-md shadow-blue-200" :
                    isCompleted ? "bg-green-100 text-green-600" : "bg-gray-100"
            )}>
                {isCompleted ? <Check className="h-4 w-4" /> : icon}
            </div>
            <span className={cn("text-xs font-bold whitespace-nowrap", isActive && "text-blue-600")}>{label}</span>
        </div>
    );
}

function StepDivider() {
    return <div className="h-px bg-gray-100 w-8 self-center" />;
}

function getStepSequence(step: Step): number {
    switch (step) {
        case "IDENTITY": return 1;
        case "PLAN": return 2;
        case "SEAT": return 3;
        case "LOCKER": return 4;
        case "REVIEW": return 5;
    }
}

// --- IDENTITY STEP ---
function IdentityStep({
    mobile, setMobile, onSearch, isSearching, student,
    newStudentData, setNewStudentData,
    interestInput, setInterestInput,
    aadhaarFile, setAadhaarFile
}: any) {
    const addInterest = () => {
        if (interestInput.trim()) {
            setNewStudentData({
                ...newStudentData,
                interests: [...newStudentData.interests, interestInput.trim()]
            });
            setInterestInput("");
        }
    };

    const removeInterest = (index: number) => {
        const newInterests = [...newStudentData.interests];
        newInterests.splice(index, 1);
        setNewStudentData({ ...newStudentData, interests: newInterests });
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-md overflow-hidden rounded-[2rem]">
                <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-10">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-black flex items-center gap-3">
                                <UserPlus className="h-8 w-8 text-blue-200" /> Student Onboarding
                            </CardTitle>
                            <CardDescription className="text-blue-100 text-lg font-medium">
                                Search mobile to verify or fill the comprehensive profile below.
                            </CardDescription>
                        </div>
                        <Badge className="bg-white/20 text-white border-none py-2 px-4 rounded-full backdrop-blur-md text-xs font-bold uppercase tracking-widest">
                            New Registration
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="p-10 space-y-12">
                    {/* Search Section */}
                    <div className="p-8 bg-blue-50/50 rounded-[1.5rem] border border-blue-100 shadow-inner space-y-4">
                        <Label className="text-gray-900 font-black text-sm uppercase tracking-[0.15em] ml-1">Identity Verification</Label>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                                <Input
                                    placeholder="Enter 10-digit mobile number"
                                    className="pl-12 h-14 rounded-2xl border-white bg-white shadow-sm text-lg font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    maxLength={10}
                                />
                            </div>
                            <Button
                                onClick={onSearch}
                                disabled={isSearching || mobile.length < 10}
                                className="h-14 px-10 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                            >
                                {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 mr-2" />}
                                Verify Mobile
                            </Button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {student ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-[2rem] border border-green-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-green-100/50">
                                <div className="flex items-center gap-6">
                                    <div className="h-20 w-20 rounded-[1.5rem] bg-green-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-green-200 border-4 border-white">
                                        {student.firstName[0]}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <p className="font-black text-gray-900 text-2xl">{student.firstName} {student.lastName}</p>
                                            <Badge className="bg-green-600 text-white border-none font-bold px-3 py-1 flex items-center gap-1">
                                                <Check className="h-3 w-3" /> Verified
                                            </Badge>
                                        </div>
                                        <div className="flex gap-4 text-sm font-bold text-gray-500">
                                            <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-green-500" /> {student.email}</span>
                                            <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-green-500" /> {student.phoneNumber}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/60 rounded-2xl border border-green-100 text-right">
                                    <p className="text-[10px] uppercase font-black text-green-600 tracking-widest mb-1">System UUID</p>
                                    <p className="font-mono text-xs font-bold text-gray-400">{student.id}</p>
                                </div>
                            </motion.div>
                        ) : student === null && !isSearching && mobile.length === 10 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-10"
                            >
                                {/* Personal Info Section */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                            <User className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900">Personal Information</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">First Name</Label>
                                            <div className="relative">
                                                <Smile className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
                                                <Input
                                                    placeholder="Ishani"
                                                    className="h-12 pl-10 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold"
                                                    value={newStudentData.firstName}
                                                    onChange={(e) => setNewStudentData({ ...newStudentData, firstName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">Last Name</Label>
                                            <Input
                                                placeholder="Kapoor"
                                                className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold"
                                                value={newStudentData.lastName}
                                                onChange={(e) => setNewStudentData({ ...newStudentData, lastName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">Age</Label>
                                            <div className="relative">
                                                <Cake className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
                                                <Input
                                                    type="number"
                                                    placeholder="22"
                                                    className="h-12 pl-10 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold"
                                                    value={newStudentData.age}
                                                    onChange={(e) => setNewStudentData({ ...newStudentData, age: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">Gender</Label>
                                            <select
                                                className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50/50 font-bold focus:bg-white outline-none transition-all"
                                                value={newStudentData.gender}
                                                onChange={(e) => setNewStudentData({ ...newStudentData, gender: e.target.value })}
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
                                                <Input
                                                    type="email"
                                                    placeholder="ishani@example.com"
                                                    className="h-12 pl-10 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold"
                                                    value={newStudentData.email}
                                                    onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">Date of Birth</Label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
                                                <Input
                                                    type="date"
                                                    className="h-12 pl-10 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold"
                                                    value={newStudentData.dob}
                                                    onChange={(e) => setNewStudentData({ ...newStudentData, dob: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Documents & Location Section */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-rose-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900">Documents & Location</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 space-y-2">
                                            <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">Aadhaar Number</Label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-300" />
                                                    <Input
                                                        placeholder="0000 0000 0000"
                                                        className="h-12 pl-10 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold"
                                                        value={newStudentData.aadhaarNumber}
                                                        onChange={(e) => setNewStudentData({ ...newStudentData, aadhaarNumber: e.target.value })}
                                                    />
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="h-12 rounded-xl border-dashed border-2 border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs"
                                                    onClick={() => document.getElementById('aadhaar-upload')?.click()}
                                                >
                                                    <UploadCloud className="h-4 w-4 mr-2" />
                                                    {aadhaarFile ? "Uploaded" : "Upload PDF"}
                                                </Button>
                                                <input
                                                    type="file"
                                                    id="aadhaar-upload"
                                                    className="hidden"
                                                    accept=".pdf,image/*"
                                                    onChange={(e) => setAadhaarFile(e.target.files?.[0] || null)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">State</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-300" />
                                                <Input
                                                    placeholder="Delhi"
                                                    className="h-12 pl-10 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold"
                                                    value={newStudentData.state}
                                                    onChange={(e) => setNewStudentData({ ...newStudentData, state: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">Area</Label>
                                            <Input
                                                placeholder="Mukherjee Nagar"
                                                className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold"
                                                value={newStudentData.area}
                                                onChange={(e) => setNewStudentData({ ...newStudentData, area: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">Detailed Address</Label>
                                            <Input
                                                placeholder="Flat no, Street, Landmark..."
                                                className="h-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white font-bold"
                                                value={newStudentData.address}
                                                onChange={(e) => setNewStudentData({ ...newStudentData, address: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info Section - Full Width */}
                                <div className="col-span-1 md:col-span-2 space-y-8 pt-6 border-t border-dashed">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                            <Plus className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900">Additional Insights</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">About Student (Optional)</Label>
                                            <textarea
                                                placeholder="Aspirations, background, or special needs..."
                                                className="w-full min-h-[120px] p-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white font-medium text-sm outline-none transition-all resize-none"
                                                value={newStudentData.about}
                                                onChange={(e) => setNewStudentData({ ...newStudentData, about: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-[11px] font-black uppercase text-gray-400 tracking-widest ml-1">Interests / Focus (Optional)</Label>
                                            <div className="space-y-4">
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="e.g. NEET-PG, UPSC"
                                                        className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold"
                                                        value={interestInput}
                                                        onChange={(e) => setInterestInput(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                                                    />
                                                    <Button
                                                        variant="secondary"
                                                        className="h-12 rounded-xl px-4 bg-amber-100 text-amber-700 font-bold hover:bg-amber-200"
                                                        onClick={addInterest}
                                                    >
                                                        Add
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {newStudentData.interests.map((interest, idx) => (
                                                        <Badge key={idx} className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none font-bold py-1.5 px-3 flex items-center gap-2">
                                                            {interest}
                                                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeInterest(idx)} />
                                                        </Badge>
                                                    ))}
                                                    {newStudentData.interests.length === 0 && (
                                                        <p className="text-xs text-gray-400 font-medium italic">No interests added yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}

// --- PLAN STEP ---
function PlanStep({ plans, selectedPlan, setSelectedPlan, isLoading }: any) {
    if (isLoading) return <div className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Choose a Plan</h2>
                <p className="text-gray-500">Select the plan the student wants to subscribe to.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan: any) => (
                    <Card
                        key={plan.id}
                        className={cn(
                            "cursor-pointer transition-all border-2 rounded-3xl overflow-hidden hover:shadow-xl group",
                            selectedPlan?.id === plan.id ? "border-blue-600 bg-blue-50/20" : "border-gray-100 hover:border-blue-200"
                        )}
                        onClick={() => setSelectedPlan(plan)}
                    >
                        <CardContent className="p-0">
                            <div className={cn(
                                "p-6 flex justify-between items-start",
                                selectedPlan?.id === plan.id ? "bg-blue-600 text-white" : "bg-gray-50 group-hover:bg-blue-50/50"
                            )}>
                                <div className="space-y-1">
                                    <Badge variant="outline" className={cn("mb-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full", selectedPlan?.id === plan.id ? "text-white border-white/30" : "text-blue-600 border-blue-200")}>
                                        {plan.planType} Plan
                                    </Badge>
                                    <CardTitle className="text-xl font-bold">{plan.planName}</CardTitle>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-black">₹{plan.price}</span>
                                    <span className="text-[10px] opacity-70">per month</span>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-1 border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</p>
                                        <p className="text-sm font-bold text-gray-800">{plan.hours} Hours</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-1 border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Allocation</p>
                                        <p className="text-sm font-bold text-gray-800">{plan.planType === 'Fixed' ? 'Fixed Seat' : 'Any Flexible'}</p>
                                    </div>
                                </div>

                                {plan.description && (
                                    <p className="text-sm text-gray-500 leading-relaxed italic">{plan.description}</p>
                                )}

                                <div className="pt-2">
                                    <div className={cn(
                                        "h-10 w-full rounded-xl flex items-center justify-center font-bold text-sm transition-all",
                                        selectedPlan?.id === plan.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600"
                                    )}>
                                        {selectedPlan?.id === plan.id ? <Check className="h-5 w-5 mr-2" /> : null}
                                        {selectedPlan?.id === plan.id ? "Selected Plan" : "Choose this Plan"}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// --- SEAT STEP ---
function SeatStep({ seats, selectedSeat, setSelectedSeat, isLoading }: any) {
    if (isLoading) return <div className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>;

    const availableSeats = seats.filter((s: any) => s.currentAvailability === "AVAILABLE");

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Select Fixed Seat</h2>
                <p className="text-gray-500">Choose a permanent seat for this student subscription.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <Card className="flex-1 border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden min-h-[400px]">
                    <CardHeader className="border-b bg-gray-50/50 p-6">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-blue-600" />
                                Floor Map
                            </CardTitle>
                            <Badge variant="outline" className="bg-white border-green-200 text-green-700 font-bold px-3">
                                {availableSeats.length} Seats Available
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 place-items-center">
                            {seats.map((seat: any) => (
                                <button
                                    key={seat.id}
                                    disabled={seat.currentAvailability !== "AVAILABLE"}
                                    onClick={() => setSelectedSeat(seat)}
                                    className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all border-2 relative group",
                                        seat.currentAvailability === "AVAILABLE"
                                            ? (selectedSeat?.id === seat.id
                                                ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-200 -translate-y-1 scale-110"
                                                : "bg-white border-green-400 text-green-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50")
                                            : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed grayscale opacity-50"
                                    )}
                                >
                                    {seat.seatNumber}
                                    {selectedSeat?.id === seat.id && (
                                        <div className="absolute -top-1 -right-1 bg-white rounded-full shadow-sm">
                                            <Check className="h-4 w-4 text-blue-600 scale-75" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-12 flex items-center justify-center gap-8 text-xs font-bold text-gray-500 uppercase tracking-widest border-t pt-8">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span>Free</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-600" />
                                <span>Selected</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-50">
                                <div className="h-3 w-3 rounded-full bg-gray-300" />
                                <span>Booked</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="w-full lg:w-72 space-y-4">
                    {selectedSeat ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <Card className="border-blue-100 bg-blue-50/50 shadow-lg shadow-blue-100/50">
                                <CardHeader className="p-6 pb-0">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Selection Status</p>
                                    <CardTitle className="text-3xl font-black text-gray-900">Seat {selectedSeat.seatNumber}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm text-gray-600 font-medium bg-white/60 p-3 rounded-xl border border-blue-100">
                                            <Check className="h-4 w-4 text-green-500" />
                                            Confirmed Available
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 font-medium bg-white/60 p-3 rounded-xl border border-blue-100">
                                            <MapPin className="h-4 w-4 text-blue-500" />
                                            Main Hall Section
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="p-10 text-center border-2 border-dashed rounded-3xl text-gray-400 space-y-4">
                            <LayoutGrid className="h-10 w-10 mx-auto opacity-20" />
                            <p className="text-xs font-medium px-4">Click a green seat on the map to continue</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- LOCKER STEP ---
function LockerStep({ lockers, selectedLocker, setSelectedLocker, isLoading }: any) {
    if (isLoading) return <div className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" /></div>;

    const skipLocker = () => setSelectedLocker(null);

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Add a Locker?</h2>
                <p className="text-gray-500">Optional storage space for the student's personal belongings.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card
                    className={cn(
                        "cursor-pointer transition-all border-2 rounded-3xl flex flex-col items-center justify-center p-8 space-y-4 hover:shadow-xl",
                        selectedLocker === null ? "border-blue-600 bg-blue-50/20" : "border-gray-100 hover:border-blue-200"
                    )}
                    onClick={skipLocker}
                >
                    <div className={cn(
                        "h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold transition-all",
                        selectedLocker === null ? "bg-blue-600 text-white shadow-lg" : "bg-gray-100 text-gray-400"
                    )}>
                        {selectedLocker === null ? <Check className="h-8 w-8" /> : "X"}
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-lg">No Locker</p>
                        <p className="text-xs text-gray-500">Just Study Space</p>
                    </div>
                </Card>

                {lockers.map((locker: any) => (
                    <Card
                        key={locker.id}
                        className={cn(
                            "cursor-pointer transition-all border-2 rounded-3xl overflow-hidden hover:shadow-xl",
                            selectedLocker?.id === locker.id ? "border-blue-600 bg-blue-50/20" : "border-gray-100 hover:border-blue-200 hover:bg-gray-50/30"
                        )}
                        onClick={() => setSelectedLocker(locker)}
                    >
                        <div className={cn(
                            "p-6 flex flex-col items-center text-center space-y-2 border-b",
                            selectedLocker?.id === locker.id ? "bg-blue-600 text-white" : "bg-gray-50/50"
                        )}>
                            <Box className="h-10 w-10 mb-2 opacity-80" />
                            <CardTitle className="text-lg">{locker.lockerType}</CardTitle>
                        </div>
                        <CardContent className="p-6 text-center space-y-4">
                            <div className="space-y-1">
                                <p className="text-2xl font-black text-gray-900">₹{locker.price}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Additional Fee</p>
                            </div>
                            <div className={cn(
                                "h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all shadow-sm",
                                selectedLocker?.id === locker.id ? "bg-blue-600 text-white ring-4 ring-blue-100" : "bg-white border text-gray-400"
                            )}>
                                {selectedLocker?.id === locker.id ? <Check className="h-4 w-4 mr-2" /> : "Select Locker"}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// --- REVIEW STEP ---
function ReviewStep({ student, plan, seat, locker, isSubmitting, onSubmit }: any) {
    const totalAmount = plan.price + (locker?.price || 0);

    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-2">
                <Badge className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-2 border-green-200">Final Step</Badge>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Assignment Review</h2>
                <p className="text-gray-500">Please confirm the details before finalize the assignment.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <Card className="rounded-3xl border-none shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
                        <CardHeader className="bg-gray-900 text-white p-8">
                            <CardTitle className="text-xl flex items-center gap-2 font-bold">
                                <Check className="h-6 w-6 text-green-400" />
                                Assignment Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-10">
                            {/* Identity Summary */}
                            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                <div className="h-20 w-20 rounded-3xl bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-black shadow-lg shadow-blue-50 border-4 border-white ring-1 ring-blue-50">
                                    {(student.firstName || student.username)?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl font-black text-gray-900">{student.firstName} {student.lastName}</h3>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-bold px-3">Student</Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500">
                                        <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-blue-500" /> {student.phoneNumber}</span>
                                        <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-blue-500" /> {student.email}</span>
                                        {student.age && <span className="flex items-center gap-1.5"><Cake className="h-3.5 w-3.5 text-blue-500" /> {student.age} yrs</span>}
                                        {student.gender && <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest">{student.gender}</Badge>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-dashed">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5" /> Residency & Identity
                                    </p>
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2 border border-blue-50">
                                        <p className="text-sm font-bold text-gray-800">{student.address || "N/A"}</p>
                                        <p className="text-xs text-gray-400 font-medium">{student.area}, {student.state}</p>
                                        {student.aadhaarNumber && (
                                            <div className="pt-2 flex items-center gap-2">
                                                <Shield className="h-3 w-3 text-rose-500" />
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aadhaar:</span>
                                                <span className="text-[10px] font-mono font-bold text-gray-600">{student.aadhaarNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Smile className="h-3.5 w-3.5" /> Interests & Bio
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {student.interests?.length > 0 ? student.interests.map((interest: string, i: number) => (
                                                <Badge key={i} className="bg-amber-100 text-amber-700 border-none font-bold text-[10px]">
                                                    {interest}
                                                </Badge>
                                            )) : <span className="text-xs text-gray-400 italic">No interests specified</span>}
                                        </div>
                                        {student.about && (
                                            <p className="text-xs text-gray-500 line-clamp-2 italic">"{student.about}"</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 border-t border-dashed pt-10">
                                <div className="space-y-4">
                                    <p className="text-[11px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-widest leading-none">
                                        <CreditCard className="h-3.5 w-3.5" /> Study Plan
                                    </p>
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900 text-lg leading-none">{plan.planName}</p>
                                        <p className="text-xs text-gray-400 font-medium">₹{plan.price}/month</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[11px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-widest leading-none">
                                        <LayoutGrid className="h-3.5 w-3.5" /> Seat Selection
                                    </p>
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900 text-lg leading-none">{seat ? `Seat ${seat.seatNumber}` : "Flexible Allocation"}</p>
                                        <p className="text-xs text-gray-400 font-medium">{seat ? "Fixed Permanent" : "Daily Floating"}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[11px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-widest leading-none">
                                        <Box className="h-3.5 w-3.5" /> Locker Add-on
                                    </p>
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-900 text-lg leading-none">{locker ? locker.lockerType : "No Locker"}</p>
                                        <p className="text-xs text-gray-400 font-medium">{locker ? `+₹${locker.price}` : "Zero Extra"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-3xl border-none shadow-2xl overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-bold opacity-80">Payment Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm opacity-80 font-medium">
                                    <span>Base Plan Price</span>
                                    <span>₹{plan.price}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm opacity-80 font-medium">
                                    <span>Locker Rental</span>
                                    <span>₹{locker?.price || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm opacity-80 font-medium">
                                    <span>Other Taxes (Inclusive)</span>
                                    <span>₹0</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-60">Grand Total</p>
                                        <p className="text-4xl font-black tabular-nums tracking-tight">₹{totalAmount}</p>
                                    </div>
                                    <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-3 py-1">INR</Badge>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 pt-2">
                            <Button
                                onClick={onSubmit}
                                disabled={isSubmitting}
                                className="w-full h-14 rounded-2xl bg-white text-blue-900 hover:bg-gray-100 font-black text-lg shadow-xl shadow-blue-500/20 transition-all border-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Confirm & Assign 🚀"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-3">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                            <Info className="h-3.5 w-3.5" /> Librarian Note
                        </p>
                        <p className="text-xs text-amber-800/70 font-medium leading-relaxed italic">
                            Subscription will be active immediately. Fixed seats cannot be reassigned until current plan expires.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

