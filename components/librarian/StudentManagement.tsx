"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Search,
    User,
    Phone,
    Mail,
    Calendar,
    UserPlus,
    X,
    FileText,
    Upload,
    Trash2,
    AlertTriangle,
    ChevronUp,
    Loader2,
    Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DetailedSeat,
    useLazyGetStudentBookingsQuery,
    useUpdateStudentMutation,
} from "@/state/api";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import UpgradePlanModal from "./UpgradePlanModal";
import { toast } from "sonner";

interface StudentManagementProps {
    seats: DetailedSeat[];
}

interface StudentInfo {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    gender?: string;
    status: "ACTIVE" | "DUES" | "INACTIVE" | "OLD";
    lastBookingDate?: string;
    currentSeat?: number;
    currentPlan?: string;
    profilePhoto?: string;
    aadhaarNumber?: string;
    age?: number;
    targetExam?: string;
    address?: string;
    dob?: string;
}

type TabId = "ALL" | "ACTIVE" | "INACTIVE" | "OLD" | "DUES";

const TABS: { id: TabId; label: string }[] = [
    { id: "ALL", label: "All Students" },
    { id: "ACTIVE", label: "Active Students" },
    { id: "INACTIVE", label: "Inactive Students" },
    { id: "OLD", label: "Old Students" },
    { id: "DUES", label: "Dues" },
];

export default function StudentManagement({ seats }: StudentManagementProps) {
    const { id } = useParams();
    const router = useRouter();
    const libraryId = Array.isArray(id) ? id[0] : id;
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<TabId>("ALL");
    const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [removeReason, setRemoveReason] = useState("");

    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [studentToUpgrade, setStudentToUpgrade] = useState<StudentInfo | null>(null);
    const [activeBookingForUpgrade, setActiveBookingForUpgrade] = useState<any>(null);
    const [activeBooking, setActiveBooking] = useState<any>(null);
    const [bookingHistory, setBookingHistory] = useState<any[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);
    const [modalView, setModalView] = useState<"MAIN" | "PLAN_HISTORY" | "TRANSACTIONS">("MAIN");
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState<Partial<StudentInfo>>({});
    const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

    const [triggerGetBookings] = useLazyGetStudentBookingsQuery();

    // Derive students from seats data
    const students = useMemo(() => {
        const studentMap = new Map<string, StudentInfo>();
        const now = new Date();

        seats.forEach((seat) => {
            seat.bookings.forEach((booking) => {
                const student = booking.student;
                if (!student) return;

                const validFrom = new Date(booking.validFrom);
                const validTo = new Date(booking.validTo);
                const isActive = booking.status === "ACTIVE" && validFrom <= now && validTo >= now;

                const existing = studentMap.get(student.id);

                if (!existing) {
                    studentMap.set(student.id, {
                        id: student.id,
                        firstName: student.firstName || "",
                        lastName: student.lastName || "",
                        email: student.email,
                        phoneNumber: student.phoneNumber,
                        gender: (student as any).gender || "N/A",
                        status: isActive ? "ACTIVE" : "OLD",
                        lastBookingDate: booking.createdAt,
                        currentSeat: isActive ? seat.seatNumber : undefined,
                        currentPlan: (booking as any).plan?.planName || "—",
                        profilePhoto: (student as any).profilePhoto,
                        aadhaarNumber: (student as any).aadhaarNumber,
                        dob: (student as any).dob,
                        targetExam: (student as any).targetExam,
                        address: (student as any).address,
                    });
                } else {
                    if (isActive) {
                        existing.status = "ACTIVE";
                        existing.currentSeat = seat.seatNumber;
                        existing.currentPlan = (booking as any).plan?.planName || existing.currentPlan;
                    }
                    if (new Date(booking.createdAt) > new Date(existing.lastBookingDate!)) {
                        existing.lastBookingDate = booking.createdAt;
                    }
                }
            });
        });

        return Array.from(studentMap.values());
    }, [seats]);

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesSearch =
                `${student.firstName} ${student.lastName}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                student.phoneNumber?.includes(searchTerm) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesTab = activeTab === "ALL" || student.status === activeTab;
            return matchesSearch && matchesTab;
        });
    }, [students, searchTerm, activeTab]);

    const stats: Record<TabId, number> = useMemo(() => ({
        ALL: students.length,
        ACTIVE: students.filter((s) => s.status === "ACTIVE").length,
        INACTIVE: students.filter((s) => s.status === "INACTIVE").length,
        OLD: students.filter((s) => s.status === "OLD").length,
        DUES: students.filter((s) => s.status === "DUES").length,
    }), [students]);

    const handleViewDetails = async (student: StudentInfo) => {
        setSelectedStudent(student);
        setEditedData(student);
        setIsEditing(false);
        setModalView("MAIN");
        setIsLoadingBookings(true);
        try {
            const result = await triggerGetBookings({ studentId: student.id }).unwrap();
            if (result.success) {
                const bookings = result.data.bookings || [];
                setBookingHistory(bookings);
                const now = new Date();
                const active = bookings.find((b: any) => {
                    const validFrom = new Date(b.bookingDetails?.validFrom);
                    const validTo = new Date(b.bookingDetails?.validTo);
                    return b.bookingDetails?.status === "ACTIVE" && validFrom <= now && validTo >= now;
                });
                // Fallback to the first active booking if no strict current one is found
                setActiveBooking(active || bookings.find((b: any) => b.bookingDetails?.status === "ACTIVE"));
            }
        } catch {
            setBookingHistory([]);
        } finally {
            setIsLoadingBookings(false);
        }
    };

    const handleUpdateStudent = async () => {
        if (!selectedStudent) return;
        try {
            await updateStudent({
                id: selectedStudent.id,
                data: editedData as any
            }).unwrap();
            setSelectedStudent({ ...selectedStudent, ...editedData });
            setIsEditing(false);
        } catch (err) {
            // Error toast handled by withToast in api.ts
        }
    };

    const handleOpenUpgradeModal = async (student: StudentInfo) => {
        setStudentToUpgrade(student);
        setIsLoadingBookings(true);
        try {
            const result = await triggerGetBookings({ studentId: student.id }).unwrap();
            const active = result.data.bookings?.find((b: any) => b.bookingDetails?.status === "ACTIVE");
            setActiveBookingForUpgrade(active);
            setIsUpgradeModalOpen(true);
        } catch {
            toast.error("Failed to fetch student bookings");
        } finally {
            setIsLoadingBookings(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedStudent(null);
        setActiveBooking(null);
        setBookingHistory([]);
        setModalView("MAIN");
    };

    const handleRemoveStudent = () => {
        // Backend call will be wired later
        toast.success(`Student ${selectedStudent?.firstName} ${selectedStudent?.lastName} removed.`);
        setShowRemoveConfirm(false);
        setSelectedStudent(null);
        setRemoveReason("");
    };

    return (
        <div className="space-y-0">
            {/* Blue Header */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-t-3xl px-8 py-6 flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Students List</h2>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search students..."
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Subtabs */}
            <div className="bg-white border-b px-6 pt-3 flex items-center gap-1">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px",
                            activeTab === tab.id
                                ? "border-blue-600 text-blue-700"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
                {/* Add Student button on the right */}
                <div className="ml-auto pb-2">
                    <Button
                        size="sm"
                        onClick={() => router.push(`?tab=onboarding`)}
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-sm"
                    >
                        <UserPlus className="h-4 w-4 mr-2" /> Add Student
                    </Button>
                </div>
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-b-3xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50/50">
                                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-10">#</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile No</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Gender</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Current Plan</th>
                                <th className="text-right px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <tr
                                        key={student.id}
                                        className={cn(
                                            "border-b transition-colors hover:bg-blue-50/30",
                                            student.status === "DUES" && "bg-red-50/40"
                                        )}
                                    >
                                        <td className="px-6 py-4 text-sm font-bold text-gray-400">{index + 1}.</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-gray-900">
                                                    {student.firstName} {student.lastName}
                                                </span>
                                                <StatusBadge status={student.status} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            {student.phoneNumber ? `+91 ${student.phoneNumber}` : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{student.gender || "N/A"}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-gray-800">{student.currentPlan || "—"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3 justify-end">
                                                <Button
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-xs px-5 h-8 shadow-sm"
                                                    onClick={() => handleViewDetails(student)}
                                                >
                                                    View Details
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-lg font-bold text-xs px-5 h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                                                    onClick={() => handleOpenUpgradeModal(student)}
                                                >
                                                    Upgrade Plan
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-gray-400">
                                        <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                        <p className="font-bold">No students found</p>
                                        <p className="text-sm mt-1">Try adjusting your search or filter.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ====================== STUDENT DETAIL MODAL ====================== */}
            <AnimatePresence>
                {selectedStudent && !showRemoveConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
                        >
                            {/* Header with Title and Close */}
                            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-2xl">
                                <h3 className="text-lg font-extrabold text-gray-900">
                                    {modalView === "MAIN" ? "Student Details" :
                                        modalView === "PLAN_HISTORY" ? "Plan History" : "Transactions"}
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="h-8 w-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {modalView === "MAIN" && (
                                <>
                                    {/* Student Info Header (Image 2 style) */}
                                    <div className="px-6 py-6 border-b">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-xs text-gray-400 font-medium">
                                                Booking Id: {selectedStudent.id.slice(0, 16)}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={cn("font-bold hover:bg-blue-50", isEditing ? "text-red-600" : "text-blue-600")}
                                                onClick={() => {
                                                    if (isEditing) {
                                                        setEditedData(selectedStudent);
                                                        setIsEditing(false);
                                                    } else {
                                                        setIsEditing(true);
                                                    }
                                                }}
                                            >
                                                {isEditing ? "Cancel Edit" : "Edit Profile"}
                                            </Button>
                                        </div>
                                        <div className="flex gap-6">
                                            {/* Photo */}
                                            <div className="flex-shrink-0">
                                                {selectedStudent.profilePhoto ? (
                                                    <img
                                                        src={selectedStudent.profilePhoto}
                                                        alt={selectedStudent.firstName}
                                                        className="h-36 w-28 rounded-xl object-cover border shadow-sm"
                                                    />
                                                ) : (
                                                    <div className="h-36 w-28 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border">
                                                        <User className="h-12 w-12 text-blue-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Info List */}
                                            <div className="flex-1 space-y-1.5 text-sm">
                                                {isEditing ? (
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] font-bold uppercase text-gray-400">First Name</Label>
                                                                <Input value={editedData.firstName} onChange={e => setEditedData({ ...editedData, firstName: e.target.value })} className="h-9 px-3 text-sm" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px] font-bold uppercase text-gray-400">Last Name</Label>
                                                                <Input value={editedData.lastName} onChange={e => setEditedData({ ...editedData, lastName: e.target.value })} className="h-9 px-3 text-sm" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] font-bold uppercase text-gray-400">Mobile Number</Label>
                                                            <Input value={editedData.phoneNumber} onChange={e => setEditedData({ ...editedData, phoneNumber: e.target.value })} className="h-9 px-3 text-sm" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] font-bold uppercase text-gray-400">Gender</Label>
                                                            <select
                                                                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                                                                value={editedData.gender}
                                                                onChange={e => setEditedData({ ...editedData, gender: e.target.value })}
                                                            >
                                                                <option value="Male">Male</option>
                                                                <option value="Female">Female</option>
                                                                <option value="Other">Other</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] font-bold uppercase text-gray-400">Interests</Label>
                                                            <Input
                                                                placeholder="e.g. UPSC, SPSC, SSC"
                                                                value={Array.isArray(editedData.interests) ? editedData.interests.join(", ") : (editedData as any).interests || ""}
                                                                onChange={e => setEditedData({ ...editedData, interests: e.target.value.split(",").map(i => i.trim()) })}
                                                                className="h-9 px-3 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] font-bold uppercase text-gray-400">About / Target Exam</Label>
                                                            <Input value={editedData.targetExam} onChange={e => setEditedData({ ...editedData, targetExam: e.target.value })} className="h-9 px-3 text-sm" />
                                                        </div>
                                                        <Button onClick={handleUpdateStudent} disabled={isUpdating} className="w-full bg-blue-600 hover:bg-blue-700 h-10 font-bold mt-2">
                                                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1.5">
                                                        <InfoRow label="Name" value={`${selectedStudent.firstName} ${selectedStudent.lastName}`} />
                                                        <InfoRow label="Mobile" value={selectedStudent.phoneNumber || "N/A"} />
                                                        {selectedStudent.dob && (
                                                            <InfoRow label="Age" value={`${calculateAge(selectedStudent.dob)}`} />
                                                        )}
                                                        <InfoRow label="Gender" value={selectedStudent.gender || "N/A"} />
                                                        <InfoRow label="Email" value={selectedStudent.email} />
                                                        <InfoRow label="Interests" value={Array.isArray(selectedStudent.interests) ? selectedStudent.interests.join(", ") : (selectedStudent as any).interests || "N/A"} />
                                                        {selectedStudent.aadhaarNumber && (
                                                            <InfoRow label="Aadhaar Number" value={`XXXX-XXXX-${selectedStudent.aadhaarNumber.slice(-4)}`} />
                                                        )}
                                                        {selectedStudent.targetExam && (
                                                            <InfoRow label="Target Exam" value={selectedStudent.targetExam} />
                                                        )}
                                                        {selectedStudent.address && (
                                                            <InfoRow label="Area/Address" value={selectedStudent.address} />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current Plan Section (Image 1 style) */}
                                    <div className="px-6 py-6 border-b bg-blue-50/30">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-bold text-gray-700">Current Plan:</h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
                                                onClick={() => handleOpenUpgradeModal(selectedStudent)}
                                            >
                                                Upgrade Plan
                                            </Button>
                                        </div>

                                        {activeBooking ? (
                                            <div className="relative overflow-hidden bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl p-5 shadow-sm group">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-400" />
                                                <div className="flex items-end justify-between">
                                                    <div>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-2xl font-black text-gray-900 leading-none">
                                                                Rs. {activeBooking.bookingDetails?.totalAmount || activeBooking.plan?.price}
                                                            </span>
                                                            <span className="text-sm font-bold text-gray-400">/ month</span>
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Badge variant="outline" className="bg-orange-100 text-orange-700 border-none font-black text-[10px] px-2 py-0.5 rounded-md">
                                                                {activeBooking.plan?.hours} hrs/ day
                                                            </Badge>
                                                            <span className="italic text-[10px] font-bold text-gray-800 uppercase">
                                                                {activeBooking.bookingDetails?.seatMode || activeBooking.plan?.planType} Seat
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 text-[10px] font-bold text-blue-600">
                                                            Valid till: {format(new Date(activeBooking.bookingDetails?.validTo), "dd MMM, yyyy")}
                                                        </div>
                                                    </div>
                                                    <div className="px-4 py-1 border border-blue-400 rounded-lg text-blue-600 font-bold text-sm bg-white uppercase">
                                                        {activeBooking.plan?.planName}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-400 italic text-sm border-2 border-dashed border-gray-100 rounded-2xl">
                                                No active plan found for this student.
                                            </div>
                                        )}
                                    </div>

                                    {/* Next Plans Section */}
                                    {bookingHistory.filter((b: any) => {
                                        const isFuture = new Date(b.bookingDetails?.validFrom) > new Date();
                                        const isNotActiveDisplayed = b.id !== activeBooking?.id;
                                        return isFuture && isNotActiveDisplayed && (b.bookingDetails?.status === "PENDING" || b.bookingDetails?.status === "ACTIVE");
                                    }).length > 0 && (
                                            <div className="px-6 py-6 border-b bg-green-50/20">
                                                <h4 className="text-sm font-bold text-gray-700 mb-4">Next Plans:</h4>
                                                <div className="space-y-4">
                                                    {bookingHistory
                                                        .filter((b: any) => {
                                                            const isFuture = new Date(b.bookingDetails?.validFrom) > new Date();
                                                            const isNotActiveDisplayed = b.id !== activeBooking?.id;
                                                            return isFuture && isNotActiveDisplayed && (b.bookingDetails?.status === "PENDING" || b.bookingDetails?.status === "ACTIVE");
                                                        })
                                                        .map((plan: any, idx: number) => (
                                                            <div key={idx} className="relative overflow-hidden bg-white/60 backdrop-blur-sm border border-green-100 rounded-2xl p-5 shadow-sm group">
                                                                <div className="absolute top-0 left-0 w-1 h-full bg-green-400" />
                                                                <div className="flex items-end justify-between">
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-baseline gap-1">
                                                                            <span className="text-2xl font-black text-gray-900 leading-none">
                                                                                Rs. {plan.bookingDetails?.totalAmount || plan.plan?.price}
                                                                            </span>
                                                                            <span className="text-sm font-bold text-gray-400">/ month</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge variant="outline" className="bg-green-100 text-green-700 border-none font-black text-[10px] px-2 py-0.5 rounded-md">
                                                                                {plan.plan?.hours} hrs/ day
                                                                            </Badge>
                                                                            <span className="italic text-[10px] font-bold text-gray-800 uppercase">
                                                                                {plan.bookingDetails?.seatMode || plan.plan?.planType} Seat ({plan.seat?.seatNumber || "—"})
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex flex-col gap-1 text-[10px] font-bold text-green-600 uppercase tracking-tight">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <Calendar className="h-3 w-3" />
                                                                                <span>Starts: {format(new Date(plan.bookingDetails?.validFrom), "dd MMM, yyyy")}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <Clock className="h-3 w-3" />
                                                                                <span>Ends: {format(new Date(plan.bookingDetails?.validTo), "dd MMM, yyyy")}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col items-end gap-3">
                                                                        <Badge className="bg-green-100 text-green-700 border-none font-black text-[9px] px-3 py-0.5 rounded-full">
                                                                            UPCOMING
                                                                        </Badge>
                                                                        <div className="px-4 py-1 border border-green-400 rounded-lg text-green-600 font-bold text-sm bg-white uppercase">
                                                                            {plan.plan?.planName}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                    {/* Navigation Buttons (Bottom Image 2) */}
                                    <div className="px-6 py-6 grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            className="rounded-xl font-extrabold h-12 bg-blue-500 text-white hover:bg-blue-600 border-none shadow-md"
                                            onClick={() => setModalView("PLAN_HISTORY")}
                                        >
                                            View Plan History
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="rounded-xl font-extrabold h-12 bg-gray-100 text-gray-800 hover:bg-gray-200 border-none"
                                            onClick={() => setModalView("TRANSACTIONS")}
                                        >
                                            Transactions
                                        </Button>
                                    </div>

                                    {/* Final Footer Actions */}
                                    <div className="px-6 pb-6 pt-2 flex items-center gap-4">
                                        <Button variant="outline" className="rounded-xl font-bold px-6 h-10 border-gray-200">
                                            <FileText className="h-4 w-4 mr-2" /> View Form
                                        </Button>
                                        <Button variant="outline" className="rounded-xl font-bold px-6 h-10 border-gray-200">
                                            <Upload className="h-4 w-4 mr-2" /> Upload Form
                                        </Button>
                                        <div className="ml-auto">
                                            <Button
                                                variant="outline"
                                                className="rounded-xl font-bold px-6 h-10 text-red-600 border-red-100 hover:bg-red-50"
                                                onClick={() => setShowRemoveConfirm(true)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" /> Remove
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {modalView === "PLAN_HISTORY" && (
                                <div className="px-6 py-6 pb-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 rounded-full p-0"
                                            onClick={() => setModalView("MAIN")}
                                        >
                                            <ChevronUp className="h-5 w-5 -rotate-90" />
                                        </Button>
                                        <h3 className="text-xl font-extrabold text-gray-900">Plan History</h3>
                                    </div>

                                    {isLoadingBookings ? (
                                        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
                                            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                                        </div>
                                    ) : bookingHistory.length > 0 ? (
                                        <div className="border rounded-2xl overflow-hidden shadow-sm">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b">
                                                        <th className="text-left px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</th>
                                                        <th className="text-left px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Name</th>
                                                        <th className="text-left px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bookingHistory.map((booking: any, i: number) => {
                                                        const isActive = booking.bookingDetails?.status === "ACTIVE";
                                                        const validFrom = new Date(booking.bookingDetails?.validFrom);
                                                        const seatInfo = booking.seat ? ` – Seat ${booking.seat.seatNumber}` : "";
                                                        const slotInfo = booking.timeSlot?.name ? ` (${booking.timeSlot.name})` : "";

                                                        return (
                                                            <tr
                                                                key={booking.id || i}
                                                                className={cn(
                                                                    "border-b last:border-b-0 transition-colors",
                                                                    isActive && "bg-green-50/40"
                                                                )}
                                                            >
                                                                <td className="px-5 py-4 text-gray-500 font-bold whitespace-nowrap">
                                                                    {format(new Date(booking.bookingDetails?.validFrom), "dd MMM")} - {format(new Date(booking.bookingDetails?.validTo), "dd MMM, yyyy")}
                                                                </td>
                                                                <td className="px-5 py-4 font-extrabold text-gray-800">
                                                                    {booking.plan?.planName || "Standard"}{slotInfo}{seatInfo}
                                                                </td>
                                                                <td className="px-5 py-4">
                                                                    <span className={cn(
                                                                        "text-[10px] font-black px-3 py-1 rounded-md",
                                                                        isActive
                                                                            ? "text-green-600"
                                                                            : "text-gray-400"
                                                                    )}>
                                                                        {isActive ? "Active" : booking.bookingDetails?.status || "Completed"}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 text-gray-300 font-bold italic border-2 border-dashed rounded-3xl">
                                            No plan history found.
                                        </div>
                                    )}
                                </div>
                            )}

                            {modalView === "TRANSACTIONS" && (
                                <div className="px-6 py-6 flex flex-col h-full overflow-hidden">
                                    <div className="flex items-center gap-4 mb-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 rounded-full p-0"
                                            onClick={() => setModalView("MAIN")}
                                        >
                                            <ChevronUp className="h-5 w-5 -rotate-90" />
                                        </Button>
                                        <div className="flex items-center gap-4">
                                            {selectedStudent.profilePhoto ? (
                                                <img src={selectedStudent.profilePhoto} className="h-10 w-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center"><User className="h-6 w-6 text-blue-400" /></div>
                                            )}
                                            <div>
                                                <h3 className="text-sm font-black text-gray-900">{selectedStudent.firstName} {selectedStudent.lastName}</h3>
                                                <p className="text-[10px] font-bold text-gray-400">Phone no: +91 {selectedStudent.phoneNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 overflow-y-auto pr-1 flex-1 min-h-[300px]">
                                        {bookingHistory.length > 0 ? (
                                            bookingHistory.map((booking: any, i: number) => (
                                                <div key={booking.id || i} className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Transaction ID: {booking.id?.slice(0, 12).toUpperCase() || "FDX-TRX-102"}</span>
                                                        <Badge className="bg-blue-800 text-white font-black text-[9px] px-4 py-0.5 rounded-full">Completed</Badge>
                                                    </div>
                                                    <div className="pb-3 mb-3 border-b flex justify-between items-center">
                                                        <h4 className="font-extrabold text-gray-900 text-sm">
                                                            {booking.plan?.planName || "Standard Plan"} (Morning Shift - Seat {booking.seat?.seatNumber || "B04"})
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-gray-400">
                                                            Dec 1, 2025 - Jan 1, 2026 (1 month)
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-gray-400">Rs. 600/ Month</span>
                                                        <Badge className="bg-green-700 text-white font-black text-[9px] px-6 py-0.5 rounded-md">Paid</Badge>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-16 text-gray-300 font-bold italic border-2 border-dashed rounded-3xl">
                                                No transactions found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isUpgradeModalOpen && studentToUpgrade && (
                    <UpgradePlanModal
                        student={studentToUpgrade}
                        libraryId={libraryId as string}
                        activeBooking={activeBookingForUpgrade}
                        onClose={() => {
                            setIsUpgradeModalOpen(false);
                            setStudentToUpgrade(null);
                            setActiveBookingForUpgrade(null);
                        }}
                        onSuccess={() => {
                            // Optionally refresh student list or show global success
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ====================== REMOVE CONFIRMATION DIALOG ====================== */}
            <AnimatePresence>
                {showRemoveConfirm && selectedStudent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => setShowRemoveConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-2xl w-full max-w-md p-6"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-gray-900">
                                        Are you sure you want to remove this Student?
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        This will deactivate <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong>&apos;s account.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <Label className="text-sm font-bold text-gray-700">Confirm by</Label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="radio" name="confirmType" className="accent-red-500" defaultChecked />
                                        <span>Email a cancellation or withdrawal for a partial approval</span>
                                    </label>
                                </div>
                                <div className="mt-3">
                                    <Label className="text-sm font-bold text-gray-700">Reason (optional)</Label>
                                    <Input
                                        placeholder="Enter reason for removal..."
                                        className="mt-1 rounded-xl bg-white"
                                        value={removeReason}
                                        onChange={(e) => setRemoveReason(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl font-bold h-10"
                                    onClick={() => setShowRemoveConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 rounded-xl font-bold h-10 bg-red-500 hover:bg-red-600 text-white"
                                    onClick={handleRemoveStudent}
                                >
                                    PROCEED WITH DELETION
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Helper Components ---

function StatusBadge({ status }: { status: StudentInfo["status"] }) {
    const config: Record<string, { bg: string; text: string; label: string }> = {
        ACTIVE: { bg: "bg-green-100 border-green-200", text: "text-green-700", label: "Active" },
        DUES: { bg: "bg-red-100 border-red-200", text: "text-red-700", label: "Payment Due" },
        INACTIVE: { bg: "bg-gray-100 border-gray-200", text: "text-gray-600", label: "Inactive" },
        OLD: { bg: "bg-amber-100 border-amber-200", text: "text-amber-700", label: "Old" },
    };

    const c = config[status] || config.INACTIVE;
    return (
        <Badge className={cn("font-bold text-[10px] px-2.5 py-0.5 rounded-md border", c.bg, c.text)}>
            {c.label}
        </Badge>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex">
            <span className="font-bold text-gray-900 min-w-[140px]">{label}:</span>
            <span className="text-gray-600">{value}</span>
        </div>
    );
}

function calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
