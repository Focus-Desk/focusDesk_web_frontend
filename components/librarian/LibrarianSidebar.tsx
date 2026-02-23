"use client";

import * as React from "react";
import {
    LayoutDashboard,
    PlusCircle,
    Users,
    LayoutGrid,
    Library as LibraryIcon,
    ChevronRight,
    LogOut,
    Settings,
    MessageSquareText
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    useSidebar
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    useGetAuthUserQuery,
    useGetLibrariesByLibrarianQuery
} from "@/state/api";
import { signOut } from "aws-amplify/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function LibrarianSidebar() {
    const { id } = useParams();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const libraryId = Array.isArray(id) ? id[0] : id;
    const { data: authData } = useGetAuthUserQuery();
    const librarian = authData?.userRole === "librarian" ? authData.userInfo : null;

    const { data: libraries } = useGetLibrariesByLibrarianQuery(librarian?.id ?? "", {
        skip: !librarian?.id,
    });

    const { state } = useSidebar();

    const handleSignOut = async () => {
        await signOut();
        window.location.href = "/";
    };

    const isActive = (path: string) => pathname === path;
    const isLibraryRoute = pathname.includes("/librarian/libraries/");

    // Library specific navigation
    const isLibrarySelected = !!libraryId;

    return (
        <Sidebar collapsible="icon" className="border-r bg-white shadow-xl">
            <SidebarHeader className="h-20 flex items-center px-6 border-b">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                        <LibraryIcon className="h-6 w-6 text-white" />
                    </div>
                    {state === "expanded" && (
                        <span className="font-bold text-xl text-gray-800 tracking-tight whitespace-nowrap">
                            Focus Desk
                        </span>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="px-3 py-6">
                {/* Main Navigation */}
                <SidebarGroup>
                    <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                        Main Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive("/librarian/dashboard")}
                                    tooltip="Dashboard"
                                    className={cn(
                                        "h-11 px-4 rounded-xl transition-all cursor-pointer",
                                        isActive("/librarian/dashboard")
                                            ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <Link href="/librarian/dashboard">
                                        <LayoutDashboard className="h-5 w-5" />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive("/librarian/add-library")}
                                    tooltip="Add Library"
                                    className={cn(
                                        "h-11 px-4 rounded-xl transition-all cursor-pointer",
                                        isActive("/librarian/add-library")
                                            ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <Link href="/librarian/add-library">
                                        <PlusCircle className="h-5 w-5" />
                                        <span>Add Library</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-6">
                    <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center justify-between">
                        <span>Management</span>
                        {!libraryId && <span className="text-[9px] text-amber-500 lowercase font-normal tracking-normal animate-pulse">Select library</span>}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isLibraryRoute && !searchParams.get("tab")}
                                    tooltip="Live Seat Map"
                                    className={cn(
                                        "h-11 px-4 rounded-xl transition-all cursor-pointer",
                                        (isLibraryRoute && !searchParams.get("tab"))
                                            ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50",
                                        !libraryId && "opacity-50 grayscale"
                                    )}
                                >
                                    <Link
                                        href={libraryId ? `/librarian/libraries/${libraryId}` : "/librarian/dashboard"}
                                        onClick={(e) => {
                                            if (!libraryId) {
                                                toast.info("Please select a library first");
                                            }
                                        }}
                                    >
                                        <LayoutGrid className="h-5 w-5" />
                                        <span>Live Seat Map</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isLibraryRoute && searchParams.get("tab") === "students"}
                                    tooltip="Student Manager"
                                    className={cn(
                                        "h-11 px-4 rounded-xl transition-all cursor-pointer",
                                        (isLibraryRoute && searchParams.get("tab") === "students")
                                            ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50",
                                        !libraryId && "opacity-50 grayscale"
                                    )}
                                >
                                    <Link
                                        href={libraryId ? `/librarian/libraries/${libraryId}?tab=students` : "/librarian/dashboard"}
                                        onClick={(e) => {
                                            if (!libraryId) {
                                                toast.info("Please select a library first");
                                            }
                                        }}
                                    >
                                        <Users className="h-5 w-5" />
                                        <span>Student Manager</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isLibraryRoute && searchParams.get("tab") === "queries"}
                                    tooltip="Queries"
                                    className={cn(
                                        "h-11 px-4 rounded-xl transition-all cursor-pointer",
                                        (isLibraryRoute && searchParams.get("tab") === "queries")
                                            ? "bg-blue-50 text-blue-600 font-semibold shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50",
                                        !libraryId && "opacity-50 grayscale"
                                    )}
                                >
                                    <Link
                                        href={libraryId ? `/librarian/libraries/${libraryId}?tab=queries` : "/librarian/dashboard"}
                                        onClick={(e) => {
                                            if (!libraryId) {
                                                toast.info("Please select a library first");
                                            }
                                        }}
                                    >
                                        <MessageSquareText className="h-5 w-5" />
                                        <span>Queries</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Libraries List */}
                {libraries && libraries.length > 0 && (
                    <SidebarGroup className="mt-6">
                        <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                            Your Libraries
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {libraries.map((lib) => (
                                    <SidebarMenuItem key={lib.id}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={libraryId === lib.id}
                                            tooltip={lib.libraryName}
                                            className={cn(
                                                "h-10 px-4 rounded-xl transition-all text-xs font-medium cursor-pointer",
                                                libraryId === lib.id
                                                    ? "text-blue-600 bg-blue-50/50"
                                                    : "text-gray-500 hover:bg-gray-50"
                                            )}
                                        >
                                            <Link href={`/librarian/libraries/${lib.id}`}>
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full mr-3",
                                                    lib.reviewStatus === "APPROVED" ? "bg-green-500" : "bg-amber-500"
                                                )} />
                                                <span className="truncate">{lib.libraryName}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="p-4 border-t">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="h-14 px-2 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-between"
                            tooltip="Profile Settings"
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-gray-100 italic font-bold">
                                    <AvatarImage src={librarian?.profilePhoto} />
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                        {librarian?.username?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {state === "expanded" && (
                                    <div className="flex flex-col text-left overflow-hidden">
                                        <span className="text-sm font-bold text-gray-800 truncate">
                                            {librarian?.username}
                                        </span>
                                        <span className="text-[10px] text-gray-500 truncate">
                                            Librarian
                                        </span>
                                    </div>
                                )}
                            </div>
                            {state === "expanded" && <ChevronRight className="h-4 w-4 text-gray-400 mr-1" />}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleSignOut}
                            tooltip="Log Out"
                            className="h-11 px-4 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Sign Out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
