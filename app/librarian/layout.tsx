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
            <div className="flex min-h-screen w-full bg-gray-50/50">
                <LibrarianSidebar />
                <SidebarInset className="flex flex-col flex-1 overflow-hidden">
                    {/* Header/Breadcrumb bar if needed */}
                    <header className="h-20 flex items-center px-8 border-b bg-white/80 backdrop-blur-md sticky top-0 z-30 justify-between">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="h-9 w-9 text-gray-500 hover:bg-gray-100 rounded-lg" />
                            <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block" />
                            <h2 className="text-sm font-semibold text-gray-800 hidden md:block tracking-tight italic opacity-60">
                                {pathname === "/librarian/dashboard" ? "Dashboard Overview" :
                                    pathname === "/librarian/add-library" ? "Add New Library" :
                                        pathname.includes("/libraries") ? "Library Management" : "Librarian Portal"}
                            </h2>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Global actions like notifications could go here */}
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
