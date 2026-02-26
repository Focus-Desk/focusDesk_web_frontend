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
    MessageSquareText,
    ClipboardList,
    Tag,
    Home,
    ArrowLeft
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
            <SidebarHeader className="h-20 flex items-center justify-center p-2 border-b">
                <div className="flex items-center gap-3 overflow-hidden w-full group-data-[collapsible=icon]:justify-center px-4 group-data-[collapsible=icon]:px-0">
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

            <SidebarContent className="p-0 py-6 group-data-[collapsible=icon]:py-4">
                {/* Main Navigation */}
                <SidebarGroup className="p-0 group-data-[collapsible=icon]:items-center">
                    <SidebarGroupLabel className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 px-6 transition-all duration-300",
                        state === "collapsed" ? "opacity-0 invisible h-0 m-0 p-0" : "opacity-100 visible h-auto mb-4"
                    )}>
                        {isLibrarySelected ? "Library Control" : "Main Menu"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="p-0 w-full">
                        <SidebarMenu className="gap-1.5 px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
                            {isLibrarySelected ? (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={searchParams.get("tab") === "home" || !searchParams.get("tab")}
                                            tooltip="Overview"
                                            size="lg"
                                            className={cn(
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-center",
                                                (searchParams.get("tab") === "home" || !searchParams.get("tab"))
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href={`/librarian/libraries/${libraryId}?tab=home`} className="flex items-center justify-center w-full">
                                                <Home className="h-5 w-5" />
                                                {state === "expanded" && <span className="ml-3">Library Home</span>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={searchParams.get("tab") === "seats"}
                                            tooltip="Seat Plan"
                                            size="lg"
                                            className={cn(
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-center",
                                                searchParams.get("tab") === "seats"
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href={`/librarian/libraries/${libraryId}?tab=seats`} className="flex items-center justify-center w-full">
                                                <LayoutGrid className="h-5 w-5" />
                                                {state === "expanded" && <span className="ml-3">Live Seat Map</span>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={searchParams.get("tab") === "students"}
                                            tooltip="Students"
                                            size="lg"
                                            className={cn(
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-center",
                                                searchParams.get("tab") === "students"
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href={`/librarian/libraries/${libraryId}?tab=students`} className="flex items-center justify-center w-full">
                                                <Users className="h-5 w-5" />
                                                {state === "expanded" && <span className="ml-3">Student Manager</span>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={searchParams.get("tab") === "queries"}
                                            tooltip="Queries"
                                            size="lg"
                                            className={cn(
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-center",
                                                searchParams.get("tab") === "queries"
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href={`/librarian/libraries/${libraryId}?tab=queries`} className="flex items-center justify-center w-full">
                                                <MessageSquareText className="h-5 w-5" />
                                                {state === "expanded" && <span className="ml-3">Queries</span>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={searchParams.get("tab") === "bookings"}
                                            tooltip="Bookings"
                                            size="lg"
                                            className={cn(
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-center",
                                                searchParams.get("tab") === "bookings"
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href={`/librarian/libraries/${libraryId}?tab=bookings`} className="flex items-center justify-center w-full">
                                                <ClipboardList className="h-5 w-5" />
                                                {state === "expanded" && <span className="ml-3">Bookings</span>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={searchParams.get("tab") === "plans"}
                                            tooltip="Plans"
                                            size="lg"
                                            className={cn(
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-center",
                                                searchParams.get("tab") === "plans"
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href={`/librarian/libraries/${libraryId}?tab=plans`} className="flex items-center justify-center w-full">
                                                <Tag className="h-5 w-5" />
                                                {state === "expanded" && <span className="ml-3">Plans</span>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            ) : (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive("/librarian/dashboard")}
                                            tooltip="Overview"
                                            size="lg"
                                            className={cn(
                                                "rounded-2xl transition-all flex items-center justify-center",
                                                isActive("/librarian/dashboard")
                                                    ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-100"
                                                    : "text-gray-500 hover:bg-gray-50"
                                            )}
                                        >
                                            <Link href="/librarian/dashboard" className="flex items-center justify-center w-full">
                                                <LayoutDashboard className="h-5 w-5" />
                                                {state === "expanded" && <span className="ml-3">Overview</span>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive("/librarian/libraries")}
                                            tooltip="My Libraries"
                                            size="lg"
                                            className={cn(
                                                "rounded-2xl transition-all flex items-center justify-center",
                                                isActive("/librarian/libraries")
                                                    ? "bg-blue-600 text-white font-bold shadow-lg shadow-blue-100"
                                                    : "text-gray-500 hover:bg-gray-50"
                                            )}
                                        >
                                            <Link href="/librarian/libraries" className="flex items-center justify-center w-full">
                                                <LibraryIcon className="h-5 w-5" />
                                                {state === "expanded" && <span className="ml-3">My Libraries</span>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Secondary Actions */}
                <SidebarGroup className="mt-auto border-t border-gray-100/50 p-0 py-6 group-data-[collapsible=icon]:py-4">
                    <SidebarGroupContent className="p-0">
                        <SidebarMenu className="px-3 group-data-[collapsible=icon]:px-0 gap-1.5 group-data-[collapsible=icon]:items-center">
                            {isLibrarySelected && (
                                <SidebarMenuItem className="w-full flex justify-center">
                                    <SidebarMenuButton
                                        asChild
                                        tooltip="Change Library"
                                        size="lg"
                                        className="rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-medium text-xs flex items-center justify-center"
                                    >
                                        <Link href="/librarian/dashboard" className="flex items-center justify-center w-full">
                                            <ArrowLeft className="h-4 w-4" />
                                            {state === "expanded" && <span className="ml-2">Back to Dashboard</span>}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                            {(!libraries || libraries.length === 0) && (
                                <SidebarMenuItem className="w-full flex justify-center">
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive("/librarian/add-library")}
                                        tooltip="Add Library"
                                        size="lg"
                                        className={cn(
                                            "rounded-xl transition-all text-xs font-medium flex items-center justify-center",
                                            isActive("/librarian/add-library")
                                                ? "bg-blue-50 text-blue-600 shadow-sm"
                                                : "text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        <Link href="/librarian/add-library" className="flex items-center justify-center w-full">
                                            <PlusCircle className="h-4 w-4" />
                                            {state === "expanded" && <span className="ml-2">Add Library</span>}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-2 border-t group-data-[collapsible=icon]:px-0">
                <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                    <SidebarMenuItem className="w-full flex justify-center">
                        <SidebarMenuButton
                            size="lg"
                            className="rounded-xl hover:bg-gray-50 transition-all flex items-center justify-between group-data-[collapsible=icon]:justify-center"
                            tooltip="Profile Settings"
                        >
                            <div className="flex items-center gap-3 overflow-hidden group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                                <Avatar className={cn(
                                    "border-2 border-white shadow-sm ring-1 ring-gray-100 italic font-bold transition-all",
                                    state === "collapsed" ? "h-7 w-7" : "h-10 w-10"
                                )}>
                                    <AvatarImage src={librarian?.profilePhoto} />
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px]">
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
                    <SidebarMenuItem className="w-full flex justify-center">
                        <SidebarMenuButton
                            onClick={handleSignOut}
                            tooltip="Log Out"
                            size="lg"
                            className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium flex items-center justify-center"
                        >
                            <LogOut className="h-5 w-5" />
                            {state === "expanded" && <span className="ml-3">Sign Out</span>}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar >
    );
}
