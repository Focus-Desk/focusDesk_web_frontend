"use client";

import React, { useMemo } from "react";
import {
    useGetAuthUserQuery,
    useGetLibraryBookingsQuery,
    useGetComplaintsByLibraryQuery,
    useGetLibraryReviewsForLibrarianQuery
} from "@/state/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Calendar,
    MessageCircle,
    Clock,
    User,
    TrendingUp,
    ChevronRight,
    AlertCircle,
    Star,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays, isAfter, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface LibraryHomeProps {
    libraryId: string;
}

export default function LibraryHome({ libraryId }: LibraryHomeProps) {
    const { data: authData } = useGetAuthUserQuery();
    const librarian = authData?.userRole === "librarian" ? authData.userInfo : null;

    // Fetch data
    const { data: bookingsData, isLoading: isLoadingBookings } = useGetLibraryBookingsQuery({ libraryId });
    const { data: complaintsData, isLoading: isLoadingComplaints } = useGetComplaintsByLibraryQuery(libraryId);
    const { data: reviewsData, isLoading: isLoadingReviews } = useGetLibraryReviewsForLibrarianQuery(libraryId);

    const bookings = bookingsData?.data || [];
    const activeBookings = bookings.filter((b: any) => b.bookingDetails?.status === "ACTIVE");
    const complaints = complaintsData?.data || [];
    const reviews = reviewsData?.data || [];

    // Section 1: Welcome Box
    const WelcomeBox = () => (
        <div className="relative bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-blue-50/50 overflow-hidden group">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-4 max-w-xl">
                <h1 className="text-4xl font-black text-blue-900 tracking-tight leading-tight">
                    Hello {librarian?.username || "Librarian"}!<br />
                    <span className="text-blue-600">Welcome back.</span>
                </h1>
                <p className="text-gray-500 font-bold text-lg leading-relaxed">
                    Everything you need to manage today's library operations is right here.
                </p>
                <div className="pt-4 flex gap-4">
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-blue-900">{activeBookings.length}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Active Students</span>
                    </div>
                    <div className="w-px h-10 bg-gray-100 mx-2 self-center" />
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-orange-500">
                            {complaints.filter((c: any) => c.status === "PENDING").length || 0}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Pending Queries</span>
                    </div>
                </div>
            </div>

            {/* Simple placeholder for the illustration in image 2 */}
            <div className="absolute right-0 bottom-0 w-80 h-80 opacity-20 lg:opacity-100 pointer-events-none transition-transform group-hover:scale-105 duration-700">
                <div className="relative w-full h-full flex items-end justify-center">
                    <div className="w-64 h-64 bg-blue-100 rounded-full blur-[100px] absolute bottom-0 right-0" />
                    <img
                        src="https://img.freepik.com/free-vector/modern-working-environment-with-character_23-2148107779.jpg"
                        alt="Workspace Illustration"
                        className="w-full h-auto relative bottom-0 filter drop-shadow-2xl"
                    />
                </div>
            </div>
        </div>
    );

    // Section 2: Library Bookings (Style: Image 3)
    const BookingsList = () => {
        const displayBookings = activeBookings.slice(0, 5);

        return (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50/50 flex flex-col h-full overflow-hidden">
                <div className="bg-blue-50/50 p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-blue-900 text-lg uppercase tracking-tight">Library Bookings</h3>
                        <Button variant="ghost" size="sm" className="text-blue-600 font-black text-[10px] uppercase">View All</Button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoadingBookings ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="p-6 border-b border-gray-50 space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        ))
                    ) : displayBookings.length > 0 ? (
                        displayBookings.map((booking: any, index: number) => {
                            const daysLeft = differenceInDays(new Date(booking.bookingDetails?.validTo), new Date());
                            return (
                                <div key={booking.id} className={cn(
                                    "p-6 flex justify-between items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors",
                                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                                )}>
                                    <div>
                                        <div className="font-black text-gray-800 text-base">{booking.student?.firstName} {booking.student?.lastName}</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student ID: {booking.student?.id?.slice(0, 6)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-gray-800 text-sm">{format(new Date(booking.validFrom), "do MMM, yyyy")}</div>
                                        <div className="text-[10px] font-black">
                                            Days Left: <span className={cn(daysLeft <= 3 ? "text-red-500" : "text-green-500")}>{daysLeft}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-gray-400">
                            <Calendar className="h-12 w-12 mb-3 opacity-20" />
                            <p className="font-black text-sm uppercase">No active bookings</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Section 3: Queries List (Style: Image 4)
    const QueriesList = () => {
        // Combine and prioritize pending items
        const combined = [
            ...complaints.map((c: any) => ({ ...c, type: 'complaint' })),
            ...reviews.map((r: any) => ({ ...r, type: 'review' }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

        return (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50/50 flex flex-col h-full overflow-hidden">
                <div className="bg-blue-50/50 p-6 border-b border-gray-100">
                    <h3 className="font-black text-blue-900 text-lg uppercase tracking-tight">Queries</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoadingComplaints || isLoadingReviews ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="p-6 border-b border-gray-50 flex justify-between">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-8 w-24 rounded-lg" />
                            </div>
                        ))
                    ) : combined.length > 0 ? (
                        combined.map((item: any, index: number) => (
                            <div key={item.id} className={cn(
                                "p-6 flex justify-between items-center border-b border-gray-50 group hover:bg-gray-50/50 transition-colors",
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                            )}>
                                <div>
                                    <div className="font-black text-gray-800 text-base">
                                        {item.type === 'complaint' ? (item.student?.firstName + " " + item.student?.lastName) : (item.student?.firstName || "Anonymous")}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student ID: {item.studentId?.slice(0, 6)}</div>
                                </div>
                                <Button
                                    className={cn(
                                        "rounded-xl h-10 px-5 font-black text-[10px] uppercase shadow-sm transition-all hover:scale-105",
                                        item.type === 'complaint'
                                            ? "bg-blue-900 text-white hover:bg-blue-800"
                                            : "bg-orange-400 text-white hover:bg-orange-500"
                                    )}
                                >
                                    {item.type === 'complaint' ? "View Complaint" : "View Review"}
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-gray-400">
                            <MessageCircle className="h-12 w-12 mb-3 opacity-20" />
                            <p className="font-black text-sm uppercase">All clear! No queries.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Right Section: Booking Graph
    const BookingGraph = () => {
        const days = useMemo(() => {
            const start = startOfMonth(new Date());
            const end = endOfMonth(new Date());
            return eachDayOfInterval({ start, end });
        }, []);

        const stats = useMemo(() => {
            const counts = new Map();
            bookings.forEach((b: any) => {
                const dateKey = format(new Date(b.createdAt), "yyyy-MM-dd");
                counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
            });
            return counts;
        }, [bookings]);

        const maxCount = Math.max(...Array.from(stats.values()), 1);

        return (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-50/50 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-black text-blue-900 uppercase tracking-tight text-sm">Library Trends</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Monthly Bookings</p>
                    </div>
                </div>

                <div className="h-48 flex items-end justify-between gap-1 group/graph">
                    {days.filter((_, i) => i % 2 === 0).map((day, i) => {
                        const count = stats.get(format(day, "yyyy-MM-dd")) || 0;
                        const height = (count / maxCount) * 100;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="w-full relative h-32 flex items-end justify-center">
                                    <div
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                        className={cn(
                                            "w-2 rounded-full transition-all duration-500",
                                            count > 0 ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]" : "bg-blue-50"
                                        )}
                                    />
                                    <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[8px] font-black px-2 py-1 rounded-md whitespace-nowrap z-10">
                                        {count} Bookings
                                    </div>
                                </div>
                                <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter truncate w-full text-center">{format(day, "dd")}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>{format(startOfMonth(new Date()), "MMM dd")}</span>
                    <span className="text-blue-600">Peak: {maxCount}</span>
                    <span>{format(endOfMonth(new Date()), "MMM dd")}</span>
                </div>
            </div>
        );
    };

    // Right Section: Recent Student
    const RecentStudent = () => {
        const sorted = [...bookings].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const lastStudent = sorted[0];

        if (!lastStudent) return null;

        return (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-xl shadow-gray-50/50 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                        <h4 className="font-black text-blue-900 uppercase tracking-tight text-sm">Recent Activity</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Last Check-in</p>
                    </div>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-5 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-blue-600 text-lg shadow-sm">
                        {lastStudent.student?.firstName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-black text-gray-800 truncate">{lastStudent.student?.firstName} {lastStudent.student?.lastName}</div>
                        <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{lastStudent.plan?.planName}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black text-gray-400 uppercase">{format(new Date(lastStudent.createdAt), "h:mm a")}</div>
                        <div className="flex items-center justify-end gap-1 text-[8px] font-black text-green-500 uppercase tracking-widest">
                            <CheckCircle2 className="h-2 w-2" /> Verified
                        </div>
                    </div>
                </div>

                <Button variant="outline" className="w-full rounded-2xl h-12 border-gray-200 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 hover:text-gray-600 transition-all group">
                    View Activity Log <ChevronRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Left Column: Welcome + Bookings + Queries */}
            <div className="lg:col-span-8 space-y-8 flex flex-col">
                <WelcomeBox />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 min-h-[450px]">
                    <BookingsList />
                    <QueriesList />
                </div>
            </div>

            {/* Right Column: Trends + Recent Activity */}
            <div className="lg:col-span-4 space-y-8">
                <BookingGraph />
                <RecentStudent />
            </div>
        </div>
    );
}
