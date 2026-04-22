"use client";

import * as React from "react";
import {
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
    CalendarCheck
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
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
    useGetLibrariesByLibrarianQuery,
    useLogoutMutation
} from "@/state/api";
import { cn } from "@/lib/utils";

export function LibrarianSidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const { data: authData } = useGetAuthUserQuery();
    const librarian = authData?.userRole === "librarian" ? authData.userInfo : null;

    const { data: libraries } = useGetLibrariesByLibrarianQuery(librarian?.id ?? "", {
        skip: !librarian?.id,
    });

    const hasLibrary = libraries && libraries.length > 0;
    const [logoutMutation] = useLogoutMutation();
    const { state } = useSidebar();

    const handleSignOut = async () => {
        const loadingToast = toast.loading("Signing you out...");
        try {
            // Attempt backend logout (invalidates tags and handles server-side session if any)
            await logoutMutation().unwrap();
        } catch (error) {
            console.error("Logout mutation error:", error);
        } finally {
            localStorage.removeItem("token");
            toast.success("Signed out successfully!", { id: loadingToast });
            setTimeout(() => {
                window.location.href = "/";
            }, 500);
        }
    };

    const isActive = (path: string) => pathname === path;

    return (
        <Sidebar collapsible="icon" className="border-r bg-white shadow-xl">
            <SidebarHeader className="h-20 flex items-center justify-center p-2 border-b">
                <div className="flex items-center gap-3 overflow-hidden w-full group-data-[collapsible=icon]:justify-center px-4 group-data-[collapsible=icon]:px-0">
                    <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                        <LibraryIcon className="h-8 w-8 text-white" />
                    </div>
                    {state === "expanded" && (
                        <span className="font-bold text-xl text-gray-800 tracking-tight whitespace-nowrap">
                            Focus Desk
                        </span>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="p-0 py-6 group-data-[collapsible=icon]:py-4">
                <SidebarGroup className="p-0 group-data-[collapsible=icon]:items-center">
                    <SidebarGroupLabel className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 px-6 transition-all duration-300",
                        state === "collapsed" ? "opacity-0 invisible h-0 m-0 p-0" : "opacity-100 visible h-auto mb-4"
                    )}>
                        Library Control
                    </SidebarGroupLabel>
                    <SidebarGroupContent className="p-0 w-full">
                        <SidebarMenu className="gap-1.5 px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
                            {hasLibrary ? (
                                <>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={searchParams.get("tab") === "home" || (!searchParams.get("tab") && isActive("/librarian/dashboard"))}
                                            tooltip="Overview"
                                            size="lg"
                                            className={cn(
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-start group-data-[collapsible=icon]:justify-center",
                                                (searchParams.get("tab") === "home" || (!searchParams.get("tab") && isActive("/librarian/dashboard")))
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href="/librarian/dashboard?tab=home" className="flex items-center w-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                                                <Home className="h-8 w-8" />
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
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-start group-data-[collapsible=icon]:justify-center",
                                                searchParams.get("tab") === "seats"
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href="/librarian/dashboard?tab=seats" className="flex items-center w-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                                                <LayoutGrid className="h-8 w-8" />
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
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-start group-data-[collapsible=icon]:justify-center",
                                                searchParams.get("tab") === "students"
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href="/librarian/dashboard?tab=students" className="flex items-center w-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                                                <Users className="h-8 w-8" />
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
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-start group-data-[collapsible=icon]:justify-center",
                                                searchParams.get("tab") === "queries"
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href="/librarian/dashboard?tab=queries" className="flex items-center w-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                                                <MessageSquareText className="h-8 w-8" />
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
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-start group-data-[collapsible=icon]:justify-center",
                                                searchParams.get("tab") === "bookings"
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href="/librarian/dashboard?tab=bookings" className="flex items-center w-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                                                <ClipboardList className="h-8 w-8" />
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
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-start group-data-[collapsible=icon]:justify-center",
                                                searchParams.get("tab") === "plans"
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href="/librarian/dashboard?tab=plans" className="flex items-center w-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                                                <Tag className="h-8 w-8" />
                                                {state === "expanded" && <span className="ml-3">Plans</span>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={searchParams.get("tab") === "attendance"}
                                            tooltip="Attendance"
                                            size="lg"
                                            className={cn(
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-start group-data-[collapsible=icon]:justify-center",
                                                searchParams.get("tab") === "attendance"
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href="/librarian/dashboard?tab=attendance" className="flex items-center w-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                                                <CalendarCheck className="h-8 w-8" />
                                                {state === "expanded" && <span className="ml-3">Attendance</span>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={searchParams.get("tab") === "hardware"}
                                            tooltip="Hardware Devices"
                                            size="lg"
                                            className={cn(
                                                "rounded-2xl transition-all duration-300 group flex items-center justify-start group-data-[collapsible=icon]:justify-center",
                                                searchParams.get("tab") === "hardware"
                                                    ? "bg-blue-600 text-white font-bold shadow-xl shadow-blue-100"
                                                    : "text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                                            )}
                                        >
                                            <Link href="/librarian/dashboard?tab=hardware" className="flex items-center w-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                                                <Settings className="h-8 w-8" />
                                                {state === "expanded" && <span className="ml-3">Hardware Devices</span>}
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </>
                            ) : (
                                <SidebarMenuItem>
                                    <div className="px-4 text-xs text-gray-500 text-center py-4">
                                        No library created yet
                                    </div>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto border-t border-gray-100/50 p-0 py-6 group-data-[collapsible=icon]:py-4">
                    <SidebarGroupContent className="p-0">
                        <SidebarMenu className="px-3 group-data-[collapsible=icon]:px-0 gap-1.5 group-data-[collapsible=icon]:items-center">
                            {!hasLibrary && (
                                <SidebarMenuItem className="w-full flex justify-center">
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive("/librarian/onboarding")}
                                        tooltip="Create Library"
                                        size="lg"
                                        className={cn(
                                            "rounded-xl transition-all text-xs font-medium flex items-center justify-start group-data-[collapsible=icon]:justify-center",
                                            isActive("/librarian/onboarding")
                                                ? "bg-blue-50 text-blue-600 shadow-sm"
                                                : "text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        <Link href="/librarian/onboarding" className="flex items-center w-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
                                            <PlusCircle className="h-4 w-4" />
                                            {state === "expanded" && <span className="ml-2">Create Library</span>}
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
                            onClick={() => router.push("/librarian/dashboard?tab=profile")}
                        >
                            <div className="flex items-center gap-3 overflow-hidden group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center">
                                <Avatar className={cn(
                                    "border-2 border-white shadow-sm ring-1 ring-gray-100 italic font-bold transition-all",
                                    state === "collapsed" ? "h-10 w-10" : "h-10 w-10"
                                )}>
                                    <AvatarImage src={librarian?.profilePhoto} />
                                    <AvatarFallback className="bg-blue-100 text-blue-600 text-[10px]">
                                        {librarian?.firstName?.[0]?.toUpperCase() || librarian?.email?.[0]?.toUpperCase() || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                {state === "expanded" && (
                                    <div className="flex flex-col text-left overflow-hidden">
                                        <span className="text-sm font-bold text-gray-800 truncate">
                                            {librarian?.firstName} {librarian?.lastName}
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
                            className="h-12 w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold flex items-center justify-start px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center border border-transparent hover:border-red-100"
                        >
                            <LogOut className="h-6 w-6" />
                            {state === "expanded" && <span className="ml-3">Sign Out</span>}
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar >
    );
}
