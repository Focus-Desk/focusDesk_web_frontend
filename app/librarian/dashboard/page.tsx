"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
    useGetAuthUserQuery, 
    useGetLibrariesByLibrarianQuery,
    useGetDetailedLibrarySeatsQuery
} from "@/state/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";
import LiveSeatPlan from "@/components/librarian/LiveSeatPlan";
import StudentManagement from "@/components/librarian/StudentManagement";
import StudentOnboardingFlow from "@/components/librarian/StudentOnboardingFlow";
import LibraryQueries from "@/components/librarian/LibraryQueries";
import LibraryBookings from "@/components/librarian/LibraryBookings";
import LibraryPlans from "@/components/librarian/LibraryPlans";
import LibraryHome from "@/components/librarian/LibraryHome";
import LibraryAttendance from "@/components/librarian/LibraryAttendance";
import LibraryHardware from "@/components/librarian/LibraryHardware";
import LibrarianProfile from "@/components/librarian/LibrarianProfile";
import LibraryTransactions from "@/components/librarian/LibraryTransactions";
import { Skeleton } from "@/components/ui/skeleton";

export default function LibrarianDashboard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "home";

    const { data: authData, isLoading: authLoading } = useGetAuthUserQuery();
    const librarian = authData?.userRole === "librarian" ? authData.userInfo : null;

    const { data: librariesData, isLoading: librariesLoading } = useGetLibrariesByLibrarianQuery(
        (librarian as any)?.userId ?? "",
        { skip: !librarian }
    );

    const libraryId = librariesData && librariesData.length > 0 ? librariesData[0].id : null;

    const [selectedSlotId, setSelectedSlotId] = React.useState<string>("all");

    const { data: detailedData, isLoading: detailedLoading, error } = useGetDetailedLibrarySeatsQuery(
        { id: libraryId as string, slotId: selectedSlotId },
        { skip: !libraryId }
    );

    if (authLoading || librariesLoading || (libraryId && detailedLoading)) {
        return <LibraryManagementSkeleton />;
    }

    if (!libraryId) {
        return (
            <div className="p-8 text-center space-y-4 pt-10">
                <div className="text-gray-500 font-medium">You don't have any libraries registered yet.</div>
                <Button onClick={() => router.push("/librarian/add-library")}>
                    Register New Library
                </Button>
            </div>
        );
    }

    if (error || !detailedData?.success) {
        return (
            <div className="p-8 text-center space-y-4 pt-10">
                <div className="text-red-600 font-medium">Failed to load library data.</div>
            </div>
        );
    }

    const { library, seats } = detailedData.data;

    return (
        <div className="transition-all duration-700">
            {activeTab === "home" && <LibraryHome libraryId={libraryId} />}
            
            {activeTab === "seats" && (
                <LiveSeatPlan
                    seats={seats}
                    libraryName={library.libraryName}
                    libraryId={libraryId}
                    selectedSlotId={selectedSlotId}
                    onSlotChange={setSelectedSlotId}
                    onStudentClick={(studentId) => router.replace(`?tab=seats&studentId=${studentId}`, { scroll: false })}
                />
            )}
            
            {activeTab === "onboarding" && (
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
            )}
            
            {activeTab === "queries" && <LibraryQueries libraryId={libraryId} />}
            {activeTab === "bookings" && <LibraryBookings libraryId={libraryId} />}
            {activeTab === "plans" && <LibraryPlans libraryId={libraryId} />}
            {activeTab === "attendance" && <LibraryAttendance libraryId={libraryId} />}
            {activeTab === "hardware" && <LibraryHardware libraryId={libraryId} />}
            {activeTab === "transactions" && <LibraryTransactions libraryId={libraryId} />}
            {activeTab === "profile" && <LibrarianProfile />}
            
            <StudentManagement seats={seats} mainTab={activeTab} libraryId={libraryId as string} />
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
