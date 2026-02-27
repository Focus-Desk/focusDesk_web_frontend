"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    MessageSquare,
    Star,
    AlertTriangle,
    ClipboardList,
    Clock,
    CheckCircle2,
    XCircle,
    Flag,
    User,
    Calendar,
    X,
    Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    useGetComplaintsByLibraryQuery,
    useUpdateComplaintStatusMutation,
    useGetLibraryReviewsForLibrarianQuery,
    useUpdateReviewStatusMutation,
    useReplyToReviewMutation,
    useGetPauseRequestsByLibraryQuery,
    useUpdatePauseRequestStatusMutation,
} from "@/state/api";
import { toast } from "sonner";

interface LibraryQueriesProps {
    libraryId: string;
}

type QueryTab = "ALL" | "REVIEW" | "COMPLAINT" | "PLAN_REQUEST";

const TAB_CONFIG = [
    { id: "ALL" as QueryTab, label: "All", icon: MessageSquare },
    { id: "REVIEW" as QueryTab, label: "Reviews", icon: Star },
    { id: "COMPLAINT" as QueryTab, label: "Complaints", icon: AlertTriangle },
    { id: "PLAN_REQUEST" as QueryTab, label: "Plan Requests", icon: ClipboardList },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: "bg-red-50 border-red-200", text: "text-red-600", label: "Pending" },
    IN_PROGRESS: { bg: "bg-amber-50 border-amber-200", text: "text-amber-600", label: "In Progress" },
    RESOLVED: { bg: "bg-green-50 border-green-200", text: "text-green-600", label: "Resolved" },
    APPROVED: { bg: "bg-green-50 border-green-200", text: "text-green-600", label: "Approved" },
    REJECTED: { bg: "bg-gray-50 border-gray-200", text: "text-gray-600", label: "Rejected" },
};

export default function LibraryQueries({ libraryId }: LibraryQueriesProps) {
    const [activeTab, setActiveTab] = useState<QueryTab>("ALL");
    const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
    const [selectedPauseRequest, setSelectedPauseRequest] = useState<any | null>(null);
    const [showPauseReason, setShowPauseReason] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectionInput, setShowRejectionInput] = useState(false);

    // Reporting state
    const [reportingComplaint, setReportingComplaint] = useState<any | null>(null);
    const [reportReason, setReportReason] = useState("");
    const [reportDetails, setReportDetails] = useState("");

    // Review action state
    const [replyingToReview, setReplyingToReview] = useState<any | null>(null);
    const [reviewReply, setReviewReply] = useState("");

    // Form states for Take Action Modal
    const [allotment, setAllotment] = useState<string>("Manager");
    const [otherPersonName, setOtherPersonName] = useState("");
    const [otherPersonPhone, setOtherPersonPhone] = useState("");
    const [complaintStatus, setComplaintStatus] = useState<string>("PENDING");
    const [resolutionDays, setResolutionDays] = useState<string>("");

    // API calls
    const { data: complaintsData, isLoading: isLoadingComplaints } = useGetComplaintsByLibraryQuery(libraryId);
    const { data: reviewsData, isLoading: isLoadingReviews } = useGetLibraryReviewsForLibrarianQuery(libraryId);
    const { data: pauseRequestsData, isLoading: isLoadingPauseRequests } = useGetPauseRequestsByLibraryQuery(libraryId);

    const [updateComplaintStatus, { isLoading: isUpdatingComplaint }] = useUpdateComplaintStatusMutation();
    const [updatePauseRequestStatus, { isLoading: isUpdatingPause }] = useUpdatePauseRequestStatusMutation();
    const [updateReviewStatus, { isLoading: isUpdatingReviewStatus }] = useUpdateReviewStatusMutation();
    const [replyToReviewMut, { isLoading: isReplying }] = useReplyToReviewMutation();

    const complaints = Array.isArray(complaintsData) ? complaintsData : complaintsData?.data || [];
    const reviews = Array.isArray(reviewsData) ? reviewsData : reviewsData?.data || [];
    const pauseRequests = Array.isArray(pauseRequestsData) ? pauseRequestsData : pauseRequestsData?.data || [];

    const allQueries = useMemo(() => {
        const coal: any[] = [
            ...complaints.map((c: any) => ({ ...c, qType: "COMPLAINT" })),
            ...reviews.map((r: any) => ({ ...r, qType: "REVIEW" })),
            ...pauseRequests.map((p: any) => ({ ...p, qType: "PLAN_REQUEST" })),
        ];
        return coal.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [complaints, reviews, pauseRequests]);

    const filteredQueries = useMemo(() => {
        if (activeTab === "ALL") return allQueries;
        return allQueries.filter((q) => q.qType === activeTab);
    }, [activeTab, allQueries]);

    const counts = {
        ALL: allQueries.length,
        REVIEW: reviews.length,
        COMPLAINT: complaints.length,
        PLAN_REQUEST: pauseRequests.length,
    };

    const handleActionSubmit = async () => {
        if (!selectedComplaint) return;
        try {
            await updateComplaintStatus({
                id: selectedComplaint.id,
                status: complaintStatus,
                allottedTo: allotment === "Others" ? `${otherPersonName} (${otherPersonPhone})` : allotment,
                resolutionDays: parseInt(resolutionDays) || undefined,
            }).unwrap();
            toast.success("Complaint updated successfully");
            setSelectedComplaint(null);
        } catch (err) {
            toast.error("Failed to update complaint");
        }
    };

    const handlePauseDecision = async (status: "APPROVED" | "REJECTED") => {
        if (!selectedPauseRequest) return;
        if (status === "REJECTED" && !showRejectionInput) {
            setShowRejectionInput(true);
            return;
        }
        if (status === "REJECTED" && !rejectionReason) {
            toast.error("Please provide a rejection reason");
            return;
        }

        try {
            await updatePauseRequestStatus({
                id: selectedPauseRequest.id,
                status,
                rejectionReason: status === "REJECTED" ? rejectionReason : undefined,
            }).unwrap();
            toast.success(`Request ${status === "APPROVED" ? "approved" : "rejected"}`);
            setShowPauseReason(false);
            setSelectedPauseRequest(null);
            setShowRejectionInput(false);
            setRejectionReason("");
        } catch (err) {
            toast.error("Failed to update request");
        }
    };

    const handleReportComplaint = async () => {
        if (!reportingComplaint || !reportReason) return;
        try {
            await updateComplaintStatus({
                id: reportingComplaint.id,
                status: "REPORTED",
                reportReason,
                reportDetails,
            }).unwrap();
            toast.success("Complaint reported successfully");
            setReportingComplaint(null);
            setReportReason("");
            setReportDetails("");
        } catch (err) {
            toast.error("Failed to report complaint");
        }
    };

    const handleReviewAction = async (review: any, action: "READ" | "REPORT") => {
        try {
            await updateReviewStatus({
                id: review.id,
                status: action === "REPORT" ? "REPORTED" : undefined,
                isRead: action === "READ" ? true : undefined,
            }).unwrap();
            toast.success(action === "READ" ? "Marked as read" : "Review reported");
        } catch (err) {
            toast.error("Action failed");
        }
    };

    const handleReplySubmit = async () => {
        if (!replyingToReview || !reviewReply) return;
        try {
            await replyToReviewMut({
                id: replyingToReview.id,
                reply: reviewReply,
            }).unwrap();
            toast.success("Reply sent successfully");
            setReplyingToReview(null);
            setReviewReply("");
        } catch (err) {
            toast.error("Failed to send reply");
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            date: date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            time: date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }),
        };
    };

    const isLoading = isLoadingComplaints || isLoadingReviews || isLoadingPauseRequests;

    return (
        <div className="space-y-1">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-t-3xl px-8 py-6!">
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
                            {counts[tab.id as keyof typeof counts]}
                        </span>
                    </button>
                ))}
            </div>

            <div className="bg-gray-50 rounded-b-3xl p-6 space-y-4 min-h-[400px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-500 font-bold">Loading queries...</p>
                    </div>
                ) : (
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
                                filteredQueries.map((query: any) => {
                                    const statusStyle = STATUS_STYLES[query.status] || STATUS_STYLES.PENDING;
                                    const { date, time } = formatDate(query.createdAt);
                                    const student = query.student || {};

                                    return (
                                        <div
                                            key={query.id}
                                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="px-6 pt-5 pb-3 flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-full flex items-center justify-center bg-gray-50 border",
                                                        query.qType === "COMPLAINT" ? "text-red-500" : query.qType === "REVIEW" ? "text-yellow-500" : "text-blue-500"
                                                    )}>
                                                        {query.qType === "COMPLAINT" ? <AlertTriangle className="h-5 w-5" /> : query.qType === "REVIEW" ? <Star className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-gray-900 text-lg">
                                                            {student.firstName || "Unknown"} {student.lastName || ""}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                                                            <User className="h-3.5 w-3.5" />
                                                            STU-{query.studentId.slice(0, 4)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge className={cn("font-bold px-4 py-1.5 rounded-full border text-xs", statusStyle.bg, statusStyle.text)}>
                                                    {statusStyle.label}
                                                </Badge>
                                            </div>

                                            <div className="mx-6 p-5 bg-gray-50 rounded-xl border border-gray-100">
                                                <p className="text-gray-700 text-sm leading-relaxed font-medium">
                                                    {query.qType === "REVIEW" ? query.comment : query.qType === "COMPLAINT" ? query.complaint : `Plan Pause Request for ${query.requestedDays || "—"} days`}
                                                </p>
                                                {query.qType === "REVIEW" && (
                                                    <div className="flex gap-1 mt-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={cn("h-4 w-4", i < query.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="px-6 py-4 flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-sm text-gray-400 font-medium">
                                                    <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{date}</div>
                                                    <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{time}</div>
                                                </div>

                                                <div className="flex gap-3">
                                                    {query.qType === "COMPLAINT" && query.status !== "RESOLVED" && query.status !== "REPORTED" && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xs px-5 h-9 shadow-sm"
                                                            onClick={() => setSelectedComplaint(query)}
                                                        >
                                                            Take Action
                                                        </Button>
                                                    )}
                                                    {query.qType === "REVIEW" && (
                                                        <>
                                                            {!query.isRead && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="bg-blue-900 border-0 text-white hover:bg-blue-800 rounded-lg font-bold text-xs px-4 h-9 shadow-sm flex items-center gap-2"
                                                                    onClick={() => handleReviewAction(query, "READ")}
                                                                >
                                                                    <MessageSquare className="h-4 w-4" /> Mark as Read
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="bg-blue-800 border-0 text-white hover:bg-blue-700 rounded-lg font-bold text-xs px-4 h-9 shadow-sm flex items-center gap-2"
                                                                onClick={() => setReplyingToReview(query)}
                                                            >
                                                                <motion.svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                                                </motion.svg>
                                                                Reply
                                                            </Button>
                                                        </>
                                                    )}
                                                    {query.qType === "PLAN_REQUEST" && query.status === "PENDING" && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xs px-5 h-9 shadow-sm"
                                                            onClick={() => {
                                                                setSelectedPauseRequest(query);
                                                                setShowPauseReason(true);
                                                            }}
                                                        >
                                                            View Reason
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        className="bg-red-600 hover:bg-red-700 border-0 text-white rounded-lg font-bold text-xs px-4 h-9 shadow-sm flex items-center gap-2"
                                                        onClick={() => {
                                                            if (query.qType === "COMPLAINT") {
                                                                setReportingComplaint(query);
                                                            } else if (query.qType === "REVIEW") {
                                                                handleReviewAction(query, "REPORT");
                                                            }
                                                        }}
                                                    >
                                                        <Flag className="h-4 w-4" /> Report
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
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            {/* TAKE ACTION MODAL (COMPLAINTS) */}
            <AnimatePresence>
                {selectedComplaint && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedComplaint(null)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 space-y-8"
                        >
                            <div className="space-y-6">
                                <section>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4">Allotment:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {["Manager", "Library Owner", "Student", "Others"].map((role) => (
                                            <button
                                                key={role}
                                                onClick={() => setAllotment(role)}
                                                className={cn(
                                                    "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                                    allotment === role ? "bg-blue-800 text-white shadow-md shadow-blue-200" : "bg-white border text-gray-600 hover:bg-gray-50"
                                                )}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                    {allotment === "Others" && (
                                        <div className="mt-4 space-y-2">
                                            <Input placeholder="Enter Person's Name" value={otherPersonName} onChange={(e) => setOtherPersonName(e.target.value)} />
                                            <Input placeholder="Enter Phone No." value={otherPersonPhone} onChange={(e) => setOtherPersonPhone(e.target.value)} />
                                        </div>
                                    )}
                                </section>

                                <section>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4">Complaint Status:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: "RESOLVED", label: "Resolved" },
                                            { id: "IN_PROGRESS", label: "Unresolved" },
                                            { id: "PENDING", label: "Pending Approval" },
                                        ].map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => setComplaintStatus(s.id)}
                                                className={cn(
                                                    "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                                    complaintStatus === s.id ? "bg-blue-800 text-white shadow-md shadow-blue-200" : "bg-white border text-gray-600 hover:bg-gray-50"
                                                )}
                                            >
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                <section className="flex items-center gap-3">
                                    <h4 className="text-lg font-bold text-gray-900">Resolution in:</h4>
                                    <Input className="w-20 text-center" placeholder="0" value={resolutionDays} onChange={(e) => setResolutionDays(e.target.value)} />
                                    <span className="font-bold text-gray-900">Days</span>
                                </section>
                            </div>

                            <div className="flex justify-end">
                                <Button className="bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 px-10 font-bold h-11" onClick={handleActionSubmit} disabled={isUpdatingComplaint}>
                                    {isUpdatingComplaint ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* VIEW REASON MODAL (PLAN PAUSE) */}
            <AnimatePresence>
                {showPauseReason && selectedPauseRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowPauseReason(false)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 space-y-6"
                        >
                            <h4 className="text-xl font-bold text-gray-900">Reason:</h4>
                            <p className="text-gray-700 font-medium leading-relaxed">
                                {selectedPauseRequest.reason}
                            </p>

                            {showRejectionInput && (
                                <div className="space-y-2 mt-4">
                                    <Label className="font-bold">Rejection Reason:</Label>
                                    <Input placeholder="Enter why this request is rejected..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <Button className="flex-1 bg-blue-800 hover:bg-blue-900 text-white font-bold h-11" onClick={() => handlePauseDecision("APPROVED")} disabled={isUpdatingPause}>
                                    {isUpdatingPause ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                                </Button>
                                <Button variant="destructive" className="flex-1 font-bold h-11" onClick={() => handlePauseDecision("REJECTED")} disabled={isUpdatingPause}>
                                    {showRejectionInput ? "Submit Rejection" : "Reject"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* REPORT COMPLAINT MODAL */}
            <AnimatePresence>
                {reportingComplaint && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-100/40 backdrop-blur-sm p-4" onClick={() => setReportingComplaint(null)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-red-50 rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden p-8 pt-10 relative"
                        >
                            <button onClick={() => setReportingComplaint(null)} className="absolute top-6 right-6 text-gray-900 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>

                            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Report Complaint</h3>
                            <p className="text-gray-600 font-medium mb-8">
                                Tell us what went wrong. This will help us resolve your problem faster
                            </p>

                            <div className="bg-white rounded-3xl border border-red-200 overflow-hidden mb-8 shadow-sm">
                                <div className="bg-red-600 px-6 py-4">
                                    <h4 className="text-white font-bold text-lg">What happened?</h4>
                                </div>
                                <div className="p-2 space-y-0 text-gray-700">
                                    {[
                                        "Spam Complaint",
                                        "Wrong Information",
                                        "Inappropriate words used",
                                        "Other"
                                    ].map((reason, idx) => (
                                        <label key={reason} className={cn(
                                            "flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors",
                                            idx < 3 && "border-b border-gray-100"
                                        )}>
                                            <input
                                                type="radio"
                                                name="reportReason"
                                                className="w-5 h-5 accent-red-600"
                                                checked={reportReason === reason}
                                                onChange={() => setReportReason(reason)}
                                            />
                                            <span className="font-bold text-lg">{reason}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <Label className="text-lg font-bold text-gray-900">Additional Details: <span className="text-gray-400 font-normal">(Optional)</span></Label>
                                <textarea
                                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-red-500/20 font-medium text-gray-700"
                                    placeholder="Type here..."
                                    value={reportDetails}
                                    onChange={(e) => setReportDetails(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-full font-extrabold text-lg px-12 py-6 h-auto shadow-lg shadow-red-200"
                                    onClick={handleReportComplaint}
                                    disabled={isUpdatingComplaint}
                                >
                                    {isUpdatingComplaint ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Report"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* REPLY MODAL */}
            <AnimatePresence>
                {replyingToReview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setReplyingToReview(null)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xl font-bold text-gray-900">Replying to {replyingToReview.student?.firstName}'s Review</h4>
                                <button onClick={() => setReplyingToReview(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 italic text-gray-600 text-sm mb-4">
                                "{replyingToReview.comment}"
                            </div>

                            <textarea
                                className="w-full bg-white border border-gray-200 rounded-2xl p-4 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium text-gray-700"
                                placeholder="Type your response here..."
                                value={reviewReply}
                                onChange={(e) => setReviewReply(e.target.value)}
                            />

                            <div className="flex gap-4">
                                <Button className="flex-1 bg-blue-800 hover:bg-blue-900 text-white font-bold h-12 rounded-xl" onClick={handleReplySubmit} disabled={isReplying}>
                                    {isReplying ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reply"}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
