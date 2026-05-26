"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    useGetAuthUserQuery,
    useGetLibrariesByLibrarianQuery,
    api
} from "@/state/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { AlertCircle, User, Clock, X } from "lucide-react";

export default function LibrarySSEProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const { data: authData } = useGetAuthUserQuery();
    const librarian = authData?.userRole === "librarian" ? authData.userInfo : null;

    const { data: librariesData } = useGetLibrariesByLibrarianQuery(
        librarian?.userId ?? "",
        { skip: !librarian?.userId }
    );

    const libraries = (librariesData as any)?.data || librariesData || [];

    useEffect(() => {
        if (!libraries || libraries.length === 0) return;

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/";
        const eventSources: EventSource[] = [];

        const handleNewRequest = (event: MessageEvent, message: string) => {
            let payload: any = {};
            try {
                payload = JSON.parse(event.data);
            } catch (e) {}

            try {
                const audio = new Audio("/sounds/notification.mp3");
                audio.play();
            } catch (err) {
                console.error("Failed to play notification sound", err);
            }

            toast.custom(
                (t) => (
                    <div
                        className="bg-white rounded-[1.5rem] shadow-xl border border-gray-100 p-4 w-full flex items-start gap-4 cursor-pointer"
                        onClick={() => toast.dismiss(t)}
                    >
                        <div className="bg-blue-600/10 rounded-full p-3 text-blue-700 shrink-0 self-center">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black text-gray-900 tracking-tight">
                                {message}
                            </p>
                            {payload?.studentId && (
                                <p className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-2">
                                    <User className="w-3 h-3" />
                                    STU-{payload.studentId.slice(-6).toUpperCase()}
                                </p>
                            )}
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-black tracking-widest uppercase mt-3">
                                <Clock className="w-3 h-3" />
                                {format(new Date(), "MMM dd \u2022 hh:mm a")}
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toast.dismiss(t);
                            }}
                            className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-2"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ),
                { duration: 8000 }
            );

            dispatch(
                api.util.invalidateTags(["Complaints", "PauseRequests", "Bookings"])
            );
        };

        libraries.forEach((lib: any) => {
            const libId = lib.id;
            if (!libId) return;

            const es = new EventSource(`${baseUrl}api/library/${libId}/events`);

            es.addEventListener("NEW_COMPLAINT", (e) =>
                handleNewRequest(e, "New Complaint Received!")
            );
            es.addEventListener("NEW_PLAN_REQUEST", (e) =>
                handleNewRequest(e, "New Plan Pause Request Received!")
            );
            es.addEventListener("NEW_BOOKING_REQUEST", (e) =>
                handleNewRequest(e, "New Booking Approval Request!")
            );

            eventSources.push(es);
        });

        return () => {
            eventSources.forEach((es) => es.close());
        };
    }, [libraries, dispatch]);

    return <>{children}</>;
}
