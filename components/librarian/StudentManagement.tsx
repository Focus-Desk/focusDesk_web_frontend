"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DetailedSeat,
    useLazyGetStudentBookingsQuery,
} from "@/state/api";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
    const [bookingHistory, setBookingHistory] = useState<any[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);

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
        setIsLoadingBookings(true);
        try {
            const result = await triggerGetBookings({ studentId: student.id }).unwrap();
            if (result.success) {
                setBookingHistory(result.data.bookings || []);
            }
        } catch {
            setBookingHistory([]);
        } finally {
            setIsLoadingBookings(false);
        }
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
                                                    onClick={() => router.push(`?tab=onboarding`)}
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
                        onClick={() => setSelectedStudent(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
                        >
                            {/* Header with close */}
                            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-2xl">
                                <p className="text-xs text-gray-400 font-medium">
                                    Booking Id: {selectedStudent.id.slice(0, 16)}
                                </p>
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="h-8 w-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Student Info Header */}
                            <div className="px-6 py-6 flex gap-6">
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

                                {/* Info */}
                                <div className="flex-1 space-y-1.5 text-sm">
                                    <InfoRow label="Name" value={`${selectedStudent.firstName} ${selectedStudent.lastName}`} />
                                    {selectedStudent.dob && (
                                        <InfoRow label="Age" value={`${calculateAge(selectedStudent.dob)}`} />
                                    )}
                                    <InfoRow label="Gender" value={selectedStudent.gender || "N/A"} />
                                    <InfoRow label="Email" value={selectedStudent.email} />
                                    {selectedStudent.aadhaarNumber && (
                                        <InfoRow label="Aadhaar Number" value={selectedStudent.aadhaarNumber} />
                                    )}
                                    {selectedStudent.targetExam && (
                                        <InfoRow label="Target Exam" value={selectedStudent.targetExam} />
                                    )}
                                    {selectedStudent.address && (
                                        <InfoRow label="Area/Address" value={selectedStudent.address} />
                                    )}
                                </div>
                            </div>

                            {/* Plan History Section */}
                            <div className="px-6 pb-6">
                                <h3 className="text-lg font-extrabold text-gray-900 mb-4">Plan History</h3>

                                {isLoadingBookings ? (
                                    <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="font-medium">Loading bookings...</span>
                                    </div>
                                ) : bookingHistory.length > 0 ? (
                                    <div className="border rounded-xl overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 border-b">
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Period</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Plan Name</th>
                                                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
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
                                                            <td className="px-4 py-3 text-gray-600 font-medium">
                                                                {isActive
                                                                    ? "Current"
                                                                    : validFrom.toLocaleDateString("en-IN", {
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    })}
                                                            </td>
                                                            <td className="px-4 py-3 font-semibold text-gray-800">
                                                                {booking.plan?.planName || "Standard"}{slotInfo}{seatInfo}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className={cn(
                                                                    "text-xs font-bold px-3 py-1 rounded-full",
                                                                    isActive
                                                                        ? "bg-green-100 text-green-700"
                                                                        : booking.bookingDetails?.status === "COMPLETED"
                                                                            ? "bg-gray-100 text-gray-600"
                                                                            : booking.bookingDetails?.status === "EXPIRED"
                                                                                ? "bg-amber-100 text-amber-600"
                                                                                : "bg-red-100 text-red-600"
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
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        No booking history available.
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="px-6 pb-6 flex items-center gap-4">
                                <Button variant="outline" className="rounded-xl font-bold px-6 h-10">
                                    <FileText className="h-4 w-4 mr-2" /> View Form
                                </Button>
                                <Button variant="outline" className="rounded-xl font-bold px-6 h-10">
                                    <Upload className="h-4 w-4 mr-2" /> Upload Form
                                </Button>
                                <div className="ml-auto">
                                    <Button
                                        variant="outline"
                                        className="rounded-xl font-bold px-6 h-10 text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => setShowRemoveConfirm(true)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" /> Remove Student
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
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
