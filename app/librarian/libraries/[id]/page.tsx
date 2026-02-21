"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetDetailedLibrarySeatsQuery } from "@/state/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutGrid, Users, Info, Settings, MapPin } from "lucide-react";
import LiveSeatPlan from "@/components/librarian/LiveSeatPlan";
import StudentManagement from "@/components/librarian/StudentManagement";
import { Skeleton } from "@/components/ui/skeleton";

import { useSearchParams } from "next/navigation";

export default function LibraryManagementPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "seats";
    const libraryId = Array.isArray(id) ? id[0] : id;

    const { data, isLoading, error } = useGetDetailedLibrarySeatsQuery(libraryId, {
        skip: !libraryId,
    });

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

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Library Header Card */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{library.libraryName}</h1>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        {library.address}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-lg h-10 px-4 border-gray-200 hover:bg-gray-50 text-sm font-semibold transition-all">
                        <Settings className="mr-2 h-4 w-4 text-gray-400" /> Configure
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 rounded-lg h-10 px-4 text-sm font-semibold shadow-md shadow-blue-100 transition-all">
                        <Info className="mr-2 h-4 w-4" /> Details
                    </Button>
                </div>
            </div>

            {/* Main Content Area - Toggled by Sidebar */}
            <div className="mt-8 transition-all duration-300">
                {activeTab === "seats" ? (
                    <LiveSeatPlan seats={seats} libraryName={library.libraryName} />
                ) : (
                    <div className="bg-white rounded-3xl border shadow-sm p-4 md:p-8">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b">
                            <Users className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-800">Student Directory</h2>
                        </div>
                        <StudentManagement seats={seats} />
                    </div>
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
