"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LibrarianSidebar } from "@/components/librarian/LibrarianSidebar";
import LibrarySSEProvider from "@/components/librarian/LibrarySSEProvider";
import { usePathname, useSearchParams } from "next/navigation";
import { Library as LibraryIcon } from "lucide-react";

export default function LibrarianLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = searchParams.get("tab") || "home";

    const getTabTitle = () => {
        if (pathname !== "/librarian/dashboard") {
            if (pathname === "/librarian/add-library") return "Add New Library";
            if (pathname.includes("/libraries")) return "Library Management";
            return "Librarian Portal";
        }

        const titles: Record<string, string> = {
            home: "Library Overview",
            seats: "Live Seat Map",
            students: "Student Manager",
            queries: "Support Queries",
            bookings: "Booking Requests",
            plans: "Library Plans",
            attendance: "Daily Attendance",
            hardware: "Hardware Devices",
            transactions: "Transaction History",
            profile: "Profile Settings",
            onboarding: "Student Onboarding",
        };

        return titles[activeTab] || "Dashboard Overview";
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <LibrarySSEProvider>
                <div className="flex flex-col h-screen w-full bg-white overflow-hidden">
                    {/* Full-width Navbar */}
                    <header className="h-20 w-full flex items-center px-6 border-b bg-white relative z-50 justify-between shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 mr-2">
                                <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" />
                                <span className="font-bold text-xl text-gray-800 tracking-tight whitespace-nowrap hidden sm:block">
                                    Focus Desk
                                </span>
                            </div>
                            <div className="h-6 w-[1px] bg-gray-200 mx-2" />
                            <SidebarTrigger className="h-9 w-9 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" />
                            <div className="h-6 w-[1px] bg-gray-200 mx-2 hidden md:block" />
                            <h2 className="text-xs font-bold text-gray-400 hidden md:block tracking-widest uppercase">
                                {getTabTitle()}
                            </h2>
                        </div>
                    </header>

                    <div className="flex flex-1 overflow-hidden relative">
                        <LibrarianSidebar />
                        <main className="flex-1 overflow-y-auto bg-gray-50/50 relative">
                            <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-full">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </LibrarySSEProvider>
        </SidebarProvider>
    );
}
