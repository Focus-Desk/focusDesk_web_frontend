"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    MessageSquare,
    Star,
    AlertTriangle,
    CreditCard,
    ClipboardList,
    Clock,
    CheckCircle2,
    XCircle,
    Flag,
    ChevronRight,
    User,
    Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LibraryQueriesProps {
    libraryId: string;
}

type QueryType = "ALL" | "REVIEW" | "COMPLAINT" | "PLAN_REQUEST" | "PAYMENT_REQUEST";
type QueryStatus = "UNRESOLVED" | "IN_PROGRESS" | "RESOLVED";

interface Query {
    id: string;
    type: QueryType;
    studentName: string;
    studentId: string;
    message: string;
    status: QueryStatus;
    createdAt: string;
}

// Mock data — will be replaced by API calls later
const MOCK_QUERIES: Query[] = [
    {
        id: "1",
        type: "COMPLAINT",
        studentName: "Piyush Gupta",
        studentId: "STU-7823",
        message:
            "The Wi-Fi connection becomes extremely slow during evening hours. It is difficult to attend online lectures or download study material when the library is crowded. Please look into improving the network stability during peak hours.",
        status: "UNRESOLVED",
        createdAt: "2026-01-18T15:40:00+05:30",
    },
    {
        id: "2",
        type: "REVIEW",
        studentName: "Ananya Sharma",
        studentId: "STU-4512",
        message:
            "The library environment is amazing. The AC works perfectly and the seats are very comfortable. Would love to see more power outlets near the window seats though!",
        status: "RESOLVED",
        createdAt: "2026-01-20T10:15:00+05:30",
    },
    {
        id: "3",
        type: "PLAN_REQUEST",
        studentName: "Rohit Verma",
        studentId: "STU-9034",
        message:
            "I would like to switch from the Morning Fixed plan to the Full Day Flexi plan. Can you please help me with the plan change and let me know the price difference?",
        status: "UNRESOLVED",
        createdAt: "2026-01-22T09:30:00+05:30",
    },
    {
        id: "4",
        type: "PAYMENT_REQUEST",
        studentName: "Kavya Joshi",
        studentId: "STU-6241",
        message:
            "I made a payment of ₹2500 yesterday for my subscription renewal but it's not reflecting in the system. My transaction ID is TXN-9283746. Please verify and update my booking status.",
        status: "IN_PROGRESS",
        createdAt: "2026-01-23T14:05:00+05:30",
    },
    {
        id: "5",
        type: "COMPLAINT",
        studentName: "Arjun Mehta",
        studentId: "STU-3178",
        message:
            "The washroom on the second floor has been out of order for the past 3 days. Students have to go all the way down to the ground floor. Please fix this urgently.",
        status: "UNRESOLVED",
        createdAt: "2026-01-24T11:20:00+05:30",
    },
    {
        id: "6",
        type: "REVIEW",
        studentName: "Meera Nair",
        studentId: "STU-8456",
        message:
            "Great study space! The noise management is excellent and the lighting is perfect for long study sessions. Five stars!",
        status: "RESOLVED",
        createdAt: "2026-02-01T16:45:00+05:30",
    },
    {
        id: "7",
        type: "PAYMENT_REQUEST",
        studentName: "Deepak Singh",
        studentId: "STU-2890",
        message:
            "I need a refund for the locker add-on I purchased. I haven't used it even once and it was accidentally added to my plan. The amount is ₹300.",
        status: "UNRESOLVED",
        createdAt: "2026-02-05T08:50:00+05:30",
    },
];

const TAB_CONFIG = [
    { id: "ALL" as QueryType, label: "All", icon: MessageSquare, color: "bg-blue-600" },
    { id: "REVIEW" as QueryType, label: "Reviews", icon: Star, color: "bg-blue-700" },
    { id: "COMPLAINT" as QueryType, label: "Complaints", icon: AlertTriangle, color: "bg-blue-700" },
    { id: "PLAN_REQUEST" as QueryType, label: "Plan Requests", icon: ClipboardList, color: "bg-blue-700" },
    { id: "PAYMENT_REQUEST" as QueryType, label: "Payment Requests", icon: CreditCard, color: "bg-blue-700" },
];

const STATUS_STYLES: Record<QueryStatus, { bg: string; text: string; label: string }> = {
    UNRESOLVED: { bg: "bg-red-50 border-red-200", text: "text-red-600", label: "Unresolved" },
    IN_PROGRESS: { bg: "bg-amber-50 border-amber-200", text: "text-amber-600", label: "In Progress" },
    RESOLVED: { bg: "bg-green-50 border-green-200", text: "text-green-600", label: "Resolved" },
};

const TYPE_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
    REVIEW: { icon: Star, color: "text-yellow-500" },
    COMPLAINT: { icon: AlertTriangle, color: "text-red-500" },
    PLAN_REQUEST: { icon: ClipboardList, color: "text-blue-500" },
    PAYMENT_REQUEST: { icon: CreditCard, color: "text-green-500" },
};

export default function LibraryQueries({ libraryId }: LibraryQueriesProps) {
    const [activeTab, setActiveTab] = useState<QueryType>("ALL");

    const filteredQueries = useMemo(() => {
        if (activeTab === "ALL") return MOCK_QUERIES;
        return MOCK_QUERIES.filter((q) => q.type === activeTab);
    }, [activeTab]);

    const counts = useMemo(() => ({
        ALL: MOCK_QUERIES.length,
        REVIEW: MOCK_QUERIES.filter((q) => q.type === "REVIEW").length,
        COMPLAINT: MOCK_QUERIES.filter((q) => q.type === "COMPLAINT").length,
        PLAN_REQUEST: MOCK_QUERIES.filter((q) => q.type === "PLAN_REQUEST").length,
        PAYMENT_REQUEST: MOCK_QUERIES.filter((q) => q.type === "PAYMENT_REQUEST").length,
    }), []);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            time: date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
        };
    };

    return (
        <div className="space-y-0">
            {/* Blue Header */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-t-3xl px-8 py-6">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Queries</h2>
            </div>

            {/* Subtabs */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-4 flex flex-wrap gap-3">
                {TAB_CONFIG.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-2",
                            activeTab === tab.id
                                ? "bg-blue-500 text-white shadow-lg shadow-blue-900/30 scale-105"
                                : "bg-blue-600/50 text-blue-100 hover:bg-blue-500/70 hover:text-white"
                        )}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                        <span className={cn(
                            "ml-1 text-xs px-2 py-0.5 rounded-full",
                            activeTab === tab.id ? "bg-white/20" : "bg-white/10"
                        )}>
                            {counts[tab.id]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Query Cards */}
            <div className="bg-gray-50 rounded-b-3xl p-6 space-y-4 min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                    >
                        {filteredQueries.length > 0 ? (
                            filteredQueries.map((query) => {
                                const status = STATUS_STYLES[query.status];
                                const typeInfo = TYPE_ICONS[query.type];
                                const { date, time } = formatDate(query.createdAt);

                                return (
                                    <div
                                        key={query.id}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Card Header */}
                                        <div className="px-6 pt-5 pb-3 flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                {typeInfo && (
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-full flex items-center justify-center bg-gray-50 border",
                                                        typeInfo.color
                                                    )}>
                                                        <typeInfo.icon className="h-5 w-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-extrabold text-gray-900 text-lg">
                                                        Name: {query.studentName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                                                        <User className="h-3.5 w-3.5" />
                                                        Student ID: {query.studentId}
                                                    </div>
                                                </div>
                                            </div>

                                            <Badge
                                                className={cn(
                                                    "font-bold px-4 py-1.5 rounded-full border text-xs",
                                                    status.bg,
                                                    status.text
                                                )}
                                            >
                                                {status.label}
                                            </Badge>
                                        </div>

                                        {/* Message Body */}
                                        <div className="mx-6 p-5 bg-gray-50 rounded-xl border border-gray-100">
                                            <p className="text-gray-700 text-sm leading-relaxed font-medium">
                                                {query.message}
                                            </p>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="px-6 py-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {date}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {time}
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                {query.status !== "RESOLVED" && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xs px-5 h-9 shadow-sm"
                                                    >
                                                        Take Action
                                                    </Button>
                                                )}
                                                {query.status === "RESOLVED" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="rounded-xl font-bold text-xs px-5 h-9 text-green-600 border-green-200 bg-green-50"
                                                        disabled
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Resolved
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-xl font-bold text-xs px-5 h-9 text-red-500 border-red-200 hover:bg-red-50"
                                                >
                                                    <Flag className="h-3.5 w-3.5 mr-1.5" /> Report
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <MessageSquare className="h-16 w-16 mb-4 opacity-30" />
                                <p className="text-lg font-bold">No queries found</p>
                                <p className="text-sm font-medium">No {activeTab.toLowerCase().replace("_", " ")} queries to display.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
