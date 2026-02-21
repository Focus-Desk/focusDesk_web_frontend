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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, User, Phone, Mail, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DetailedSeat } from "@/state/api";

interface StudentManagementProps {
    seats: DetailedSeat[];
}

interface StudentInfo {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    gender?: string; // Mocked for now
    status: "ACTIVE" | "DUES" | "INACTIVE" | "OLD";
    lastBookingDate?: string;
    currentSeat?: number;
}

export default function StudentManagement({ seats }: StudentManagementProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");

    const students = useMemo(() => {
        const studentMap = new Map<string, StudentInfo>();
        const now = new Date();

        seats.forEach((seat) => {
            seat.bookings.forEach((booking) => {
                const student = booking.student;
                if (!student) return;

                const validFrom = new Date(booking.validFrom);
                const validTo = new Date(booking.validTo);
                const isActive =
                    booking.status === "ACTIVE" && validFrom <= now && validTo >= now;

                const existing = studentMap.get(student.id);

                if (!existing) {
                    studentMap.set(student.id, {
                        id: student.id,
                        firstName: student.firstName || "",
                        lastName: student.lastName || "",
                        email: student.email,
                        phoneNumber: student.phoneNumber,
                        gender: "N/A", // Backend doesn't have this yet
                        status: isActive ? "ACTIVE" : "OLD",
                        lastBookingDate: booking.createdAt,
                        currentSeat: isActive ? seat.seatNumber : undefined,
                    });
                } else {
                    // Update status to ACTIVE if any booking is active
                    if (isActive) {
                        existing.status = "ACTIVE";
                        existing.currentSeat = seat.seatNumber;
                    }
                    // Update last booking date if this one is newer
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

    const stats = {
        ALL: students.length,
        ACTIVE: students.filter((s) => s.status === "ACTIVE").length,
        DUES: students.filter((s) => s.status === "DUES").length,
        OLD: students.filter((s) => s.status === "OLD").length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, phone or email..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                    <TabsList>
                        <TabsTrigger value="ALL">All ({stats.ALL})</TabsTrigger>
                        <TabsTrigger value="ACTIVE">Active ({stats.ACTIVE})</TabsTrigger>
                        <TabsTrigger value="DUES">Dues ({stats.DUES})</TabsTrigger>
                        <TabsTrigger value="OLD">Old ({stats.OLD})</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Gender</TableHead>
                            <TableHead>Current Seat</TableHead>
                            <TableHead>Last Activity</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                                {student.firstName[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {student.firstName} {student.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500">{student.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="h-3 w-3" /> {student.phoneNumber || "N/A"}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="h-3 w-3" /> {student.email}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{student.gender}</TableCell>
                                    <TableCell>
                                        {student.currentSeat ? (
                                            <Badge variant="outline" className="bg-blue-50">
                                                Seat {student.currentSeat}
                                            </Badge>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="h-3 w-3" />
                                            {student.lastBookingDate
                                                ? new Date(student.lastBookingDate).toLocaleDateString()
                                                : "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={student.status} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                                    No students found matching your criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: StudentInfo["status"] }) {
    const styles = {
        ACTIVE: "bg-green-100 text-green-800 border-green-200",
        DUES: "bg-red-100 text-red-800 border-red-200",
        INACTIVE: "bg-gray-100 text-gray-800 border-gray-200",
        OLD: "bg-amber-100 text-amber-800 border-amber-200",
    };

    return (
        <Badge className={`${styles[status]} font-medium`}>
            {status}
        </Badge>
    );
}
