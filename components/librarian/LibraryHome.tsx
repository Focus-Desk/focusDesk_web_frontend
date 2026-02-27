"use client";

import React, { useMemo } from "react";
import {
    useGetAuthUserQuery,
    useGetLibraryBookingsQuery,
    useGetComplaintsByLibraryQuery,
    useGetLibraryReviewsForLibrarianQuery,
    useGetPauseRequestsByLibraryQuery
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
    CheckCircle2,
    X,
    AlertTriangle,
    ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays, isAfter, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
    const { data: pauseRequestsData, isLoading: isLoadingPauseRequests } = useGetPauseRequestsByLibraryQuery(libraryId);

    const [selectedQuery, setSelectedQuery] = React.useState<any>(null);

    const bookings = bookingsData?.data || [];
    const activeBookings = bookings.filter((b: any) => b.bookingDetails?.status === "ACTIVE");
    const complaints = Array.isArray(complaintsData) ? complaintsData : complaintsData?.data || [];
    const pauseRequests = Array.isArray(pauseRequestsData) ? pauseRequestsData : pauseRequestsData?.data || [];
    const reviews = Array.isArray(reviewsData) ? reviewsData : reviewsData?.data || [];

    const pendingComplaints = complaints.filter((c: any) => c.status === "PENDING").map((c: any) => ({ ...c, qType: "COMPLAINT" }));
    const pendingPauseRequests = pauseRequests.filter((p: any) => p.status === "PENDING").map((p: any) => ({ ...p, qType: "PLAN_REQUEST" }));

    const allPendingRequests = [...pendingComplaints, ...pendingPauseRequests].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Section 1: Welcome Box
    const WelcomeBox = () => {
        const hour = new Date().getHours();
        const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

        return (
            <div className="relative bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-blue-50/50 overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-4 max-w-xl">
                    <h1 className="text-4xl font-black text-blue-900 tracking-tight leading-tight">
                        {greeting}, {librarian?.username || "Sheetal"}...
                    </h1>
                    <p className="text-gray-500 font-medium text-lg italic leading-relaxed">
                        "A library is not a luxury but one of the necessities of life."
                        <br />
                        <span className="text-sm not-italic opacity-60">— Henry Ward Beecher</span>
                    </p>
                    <div className="space-y-2 pt-4">
                        <p className="text-gray-800 font-bold text-lg">Your library, simplified for today.</p>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                            Everything you need to manage today's library operations — thoughtfully organized, effortlessly accessible.
                        </p>
                    </div>
                </div>

                {/* Illustration from image 3 style */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 opacity-20 lg:opacity-100 pointer-events-none">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className="w-64 h-64 bg-green-100 rounded-full blur-[80px] absolute opacity-50" />
                        <div className="relative flex gap-1 items-end">
                            <div className="w-16 h-40 bg-green-500/40 rounded-full rotate-12" />
                            <div className="w-20 h-48 bg-green-400/60 rounded-full -rotate-6 shadow-xl shadow-green-200" />
                            <div className="w-14 h-32 bg-green-300/40 rounded-full rotate-6" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Section 2: Library Bookings
    const BookingsList = () => {
        const displayBookings = bookings.slice(0, 4);
        const router = useRouter();

        // Calculate today's total
        const todayTotal = bookings.reduce((acc: number, b: any) => {
            const isToday = format(new Date(b.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            return isToday ? acc + (b.totalAmount || 0) : acc;
        }, 0);

        return (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50/50 flex flex-col h-full overflow-hidden">
                <div className="p-8">
                    <h3 className="font-bold text-blue-700 text-xl">Library Bookings</h3>
                </div>
                <div className="flex-1 overflow-y-auto px-8 space-y-8">
                    {isLoadingBookings ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        ))
                    ) : displayBookings.length > 0 ? (
                        <>
                            {displayBookings.map((booking: any) => (
                                <div key={booking.id} className="flex items-start justify-between border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <div className="font-bold text-gray-800 text-base">
                                            {booking.student?.firstName} {booking.student?.lastName}
                                        </div>
                                        <div className="text-xs font-medium text-gray-400 uppercase tracking-tight">
                                            STU-{format(new Date(booking.createdAt), "yyyy")}-{booking.studentId?.slice(-4)}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn(
                                            "text-xs font-bold mb-1",
                                            booking.bookingDetails?.status === "PENDING" ? "text-amber-400" :
                                                booking.bookingDetails?.status === "REJECTED" ? "text-red-400" : "text-green-400"
                                        )}>
                                            {booking.bookingDetails?.status || "Success"}
                                        </div>
                                        <div className="font-bold text-blue-900">
                                            Rs. {booking.totalAmount || 0}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                            <Calendar className="h-10 w-10 mb-2 opacity-20" />
                            <p className="font-bold text-sm uppercase tracking-widest">No bookings found</p>
                        </div>
                    )}
                </div>

                {/* Footer: Today's Collection */}
                <div className="bg-blue-50/30 p-8 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-gray-500 font-bold">Today's Collection</span>
                    <span className="text-3xl font-black text-blue-900">Rs. {todayTotal}</span>
                </div>
            </div>
        );
    };

    // Section 3: Queries List
    const QueriesList = () => {
        const router = useRouter();
        const displayQueries = allPendingRequests.slice(0, 4);

        return (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50/50 flex flex-col h-full overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-xl">Requests</h3>
                        <span className="text-red-400 font-medium text-sm">{allPendingRequests.length} Pending</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-8 space-y-8 py-6">
                    {isLoadingComplaints || isLoadingPauseRequests ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        ))
                    ) : displayQueries.length > 0 ? (
                        <>
                            {displayQueries.map((item: any) => (
                                <div key={item.id} className="flex items-start justify-between border-b border-gray-50 pb-6 last:border-0 last:pb-0 group">
                                    <div className="space-y-1">
                                        <div className="font-bold text-gray-800 text-base">
                                            {item.student?.firstName} {item.student?.lastName}
                                        </div>
                                        <div className="text-xs font-medium text-gray-400">
                                            Student ID: {item.studentId?.slice(0, 6).toUpperCase()}
                                        </div>
                                        <div className="text-xs font-medium text-gray-400">
                                            {item.qType === "COMPLAINT" ? "Complaint" : "Plan Pause"}
                                        </div>
                                    </div>
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 text-sm font-bold text-blue-700 hover:no-underline"
                                        onClick={() => setSelectedQuery(item)}
                                    >
                                        View Request
                                    </Button>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                            <MessageCircle className="h-10 w-10 mb-2 opacity-20" />
                            <p className="font-bold text-sm uppercase tracking-widest">All caught up</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Detail Modal
    const RequestDetailModal = () => {
        if (!selectedQuery) return null;

        return (
            <AnimatePresence>
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedQuery(null)}>
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative"
                    >
                        <button onClick={() => setSelectedQuery(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
                            <X className="h-6 w-6" />
                        </button>

                        <div className="bg-blue-50 p-8 border-b border-blue-100">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm",
                                    selectedQuery.qType === "COMPLAINT" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                                )}>
                                    {selectedQuery.qType === "COMPLAINT" ? <AlertTriangle className="h-6 w-6" /> : <ClipboardList className="h-6 w-6" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-blue-900 leading-none">
                                        {selectedQuery.qType === "COMPLAINT" ? "Complaint Details" : "Plan Pause Request"}
                                    </h3>
                                    <p className="text-blue-600/60 font-bold text-[10px] uppercase tracking-widest mt-1">
                                        Pending Approval
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-blue-100/50">
                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center font-black text-blue-600">
                                    {selectedQuery.student?.firstName?.[0]}
                                </div>
                                <div>
                                    <div className="font-black text-gray-800">
                                        {selectedQuery.student?.firstName} {selectedQuery.student?.lastName}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        ID: {selectedQuery.studentId}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Request Details</h4>
                                <div className="bg-gray-50 rounded-2xl p-5 text-gray-700 font-medium leading-relaxed border border-gray-100">
                                    {selectedQuery.qType === "COMPLAINT"
                                        ? selectedQuery.complaint
                                        : `Requesting a plan pause for ${selectedQuery.requestedDays} days. Reason: ${selectedQuery.reason || "Not specified"}`}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Submitted {format(new Date(selectedQuery.createdAt), "MMM dd, yyyy • h:mm a")}
                                </div>
                                <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    STU-{selectedQuery.studentId?.slice(-6).toUpperCase()}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button
                                    className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-widest h-14 rounded-2xl shadow-lg shadow-blue-100"
                                    onClick={() => {
                                        router.push(`/librarian/libraries/${libraryId}?tab=queries`);
                                        setSelectedQuery(null);
                                    }}
                                >
                                    Go to Resolution Center
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-14 w-14 rounded-2xl border-gray-100 text-gray-400 hover:text-gray-600"
                                    onClick={() => setSelectedQuery(null)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>
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
                <RequestDetailModal />
            </div>

            {/* Right Column: Trends + Recent Activity */}
            <div className="lg:col-span-4 space-y-8">
                <BookingGraph />
                <RecentStudent />
            </div>
        </div>
    );
}
