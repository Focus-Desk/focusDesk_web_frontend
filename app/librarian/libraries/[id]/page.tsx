"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetDetailedLibrarySeatsQuery } from "@/state/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutGrid, Users, Info, Settings, MapPin, UserPlus, MessageSquareText, Home, ClipboardList, Tag } from "lucide-react";
import LiveSeatPlan from "@/components/librarian/LiveSeatPlan";
import StudentManagement from "@/components/librarian/StudentManagement";
import StudentOnboardingFlow from "@/components/librarian/StudentOnboardingFlow";
import LibraryQueries from "@/components/librarian/LibraryQueries";
import LibraryBookings from "@/components/librarian/LibraryBookings";
import LibraryPlans from "@/components/librarian/LibraryPlans";
import LibraryHome from "@/components/librarian/LibraryHome";
import { Skeleton } from "@/components/ui/skeleton";

import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LibraryManagementPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "home";
    const libraryId = Array.isArray(id) ? id[0] : id;

    const [selectedSlotId, setSelectedSlotId] = React.useState<string>("all");

    const { data, isLoading, error } = useGetDetailedLibrarySeatsQuery(
        { id: libraryId, slotId: selectedSlotId },
        { skip: !libraryId }
    );

    if (isLoading) {
        return <LibraryManagementSkeleton />;
    }

    if (error || !data?.success) {
        return (
            <div className="p-8 text-center space-y-4 pt-10">
                <div className="text-red-600 font-medium">Failed to load library data.</div>
                <Button onClick={() => router.push("/librarian/dashboard")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </div>
        );
    }

    const { library, seats } = data.data;

    const tabs = [
        { id: "home", label: "Overview", icon: Home },
        { id: "seats", label: "Seat Plan", icon: LayoutGrid },
        { id: "students", label: "Students", icon: Users },
        { id: "queries", label: "Queries", icon: MessageSquareText },
        { id: "bookings", label: "Bookings", icon: ClipboardList },
        { id: "plans", label: "Plans", icon: Tag },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Horizontal Sub-Navigation (Modern Floating Style) */}
            <div className="sticky top-0 z-30 pt-2 -mt-2">
                <div className="bg-white/70 backdrop-blur-xl p-1.5 rounded-2xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => router.push(`/librarian/libraries/${libraryId}?tab=${tab.id}`)}
                                className={cn(
                                    "flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all duration-500 whitespace-nowrap group relative",
                                    isActive
                                        ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 scale-[1.02]"
                                        : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm"
                                )}
                            >
                                <Icon className={cn(
                                    "h-4 w-4 transition-all duration-500 group-hover:scale-110",
                                    isActive ? "text-white" : "text-gray-400 group-hover:text-blue-500"
                                )} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{tab.label}</span>
                                {isActive && (
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-50" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="transition-all duration-700">
                {activeTab === "home" ? (
                    <LibraryHome libraryId={libraryId} />
                ) : activeTab === "seats" ? (
                    <LiveSeatPlan
                        seats={seats}
                        libraryName={library.libraryName}
                        libraryId={libraryId}
                        selectedSlotId={selectedSlotId}
                        onSlotChange={setSelectedSlotId}
                    />
                ) : activeTab === "onboarding" ? (
                    <div className="bg-white rounded-3xl border shadow-sm p-4 md:p-8">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b">
                            <div className="flex items-center gap-3">
                                <UserPlus className="h-6 w-6 text-blue-600" />
                                <h2 className="text-2xl font-bold text-gray-800">Student Onboarding</h2>
                            </div>
                            <Button
                                variant="ghost"
                                onClick={() => router.push(`?tab=students`)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
                            </Button>
                        </div>
                        <StudentOnboardingFlow libraryId={libraryId} />
                    </div>
                ) : activeTab === "queries" ? (
                    <LibraryQueries libraryId={libraryId} />
                ) : activeTab === "bookings" ? (
                    <LibraryBookings libraryId={libraryId} />
                ) : activeTab === "plans" ? (
                    <LibraryPlans libraryId={libraryId} />
                ) : (
                    <StudentManagement seats={seats} />
                )}
            </div>
        </div>
    );
}

function LibraryManagementSkeleton() {
    return (
        <div className="space-y-8 pt-4">
            <div className="bg-white p-8 rounded-3xl border h-48 space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <div className="mt-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-96 lg:col-span-2 rounded-3xl" />
                    <Skeleton className="h-96 rounded-3xl" />
                </div>
            </div>
        </div>
    );
}
