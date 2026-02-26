"use client";

import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LibrarianSidebar } from "@/components/librarian/LibrarianSidebar";
import { usePathname } from "next/navigation";

export default function LibrarianLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-gray-50/50 overflow-hidden">
                <LibrarianSidebar />
                <SidebarInset className="flex flex-col flex-1 h-full min-h-0">
                    {/* Header/Breadcrumb bar */}
                    <header className="h-20 flex items-center px-8 border-b bg-white/80 backdrop-blur-md sticky top-0 z-30 justify-between shrink-0">
                        <div className="flex items-center gap-4">
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
        </SidebarProvider>
    );
}
