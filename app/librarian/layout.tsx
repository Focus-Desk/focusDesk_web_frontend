"use client";

import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LibrarianSidebar } from "@/components/librarian/LibrarianSidebar";
import LibrarySSEProvider from "@/components/librarian/LibrarySSEProvider";
import { usePathname } from "next/navigation";
import { Library as LibraryIcon } from "lucide-react";

export default function LibrarianLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <SidebarProvider>
            <LibrarySSEProvider>
                <div className="flex h-screen w-full bg-gray-50/50 overflow-hidden">
                    <LibrarianSidebar />
                    <SidebarInset className="flex flex-col flex-1 h-full min-h-0">
                        {/* Header/Breadcrumb bar */}
                        <header className="h-20 flex items-center px-6 border-b bg-white sticky top-0 z-30 justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3 mr-2">
                                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                                        <LibraryIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="font-bold text-xl text-gray-800 tracking-tight whitespace-nowrap hidden sm:block">
                                        Focus Desk
                                    </span>
                                </div>
                                <div className="h-6 w-[1px] bg-gray-200 mx-2" />
                                <SidebarTrigger className="h-9 w-9 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" />
                                <div className="h-6 w-[1px] bg-gray-200 mx-2 hidden md:block" />
                                <h2 className="text-xs font-bold text-gray-400 hidden md:block tracking-widest uppercase">
                                    {pathname === "/librarian/dashboard" ? "Dashboard Overview" :
                                        pathname === "/librarian/add-library" ? "Add New Library" :
                                            pathname.includes("/libraries") ? "Library Management" : "Librarian Portal"}
                                </h2>
                            </div>
                        </header>

                        <main className="flex-1 overflow-y-auto scrollbar-hide">
                            <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-full">
                                {children}
                            </div>
                        </main>
                    </SidebarInset>
                </div>
            </LibrarySSEProvider>
        </SidebarProvider>
    );
}
