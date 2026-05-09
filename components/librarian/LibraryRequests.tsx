"use client";

import React, { useMemo } from 'react';
import { useGetChangeRequestsByLibraryQuery } from '@/state/api';
import { Loader2, Clock, CheckCircle, XCircle, FileText, ChevronRight, Layers, LayoutGrid, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// Helper to format camelCase to Title Case
const formatKey = (key: string) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
};

const PayloadRenderer = ({ payload }: { payload: any }) => {
    if (!payload || typeof payload !== 'object') return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(payload).map(([key, value]: [string, any]) => {
                // Skip internal IDs if not useful, or render them normally
                if (key === 'libraryId') return null;

                let displayValue = value;
                
                if (Array.isArray(value)) {
                    if (value.length === 0) displayValue = "None";
                    else if (typeof value[0] === 'object') {
                        displayValue = `${value.length} items`;
                    } else {
                        displayValue = value.join(', ');
                    }
                } else if (typeof value === 'boolean') {
                    displayValue = value ? "Yes" : "No";
                } else if (typeof value === 'object' && value !== null) {
                    displayValue = "Complex Object";
                } else if (value === null || value === undefined) {
                    displayValue = "N/A";
                }

                return (
                    <div key={key} className="bg-white/60 p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{formatKey(key)}</span>
                        <span className="text-sm font-bold text-gray-900 truncate" title={String(displayValue)}>
                            {String(displayValue)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default function LibraryRequests({ libraryId }: { libraryId: string }) {
    const { data: requestsRes, isLoading } = useGetChangeRequestsByLibraryQuery({ libraryId });
    const requests = requestsRes?.data || [];

    const getStatusTheme = (status: string) => {
        if (status === 'PENDING') return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200/50', dot: 'bg-amber-500', icon: Clock };
        if (status === 'APPROVED') return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200/50', dot: 'bg-emerald-500', icon: CheckCircle };
        if (status === 'REJECTED') return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200/50', dot: 'bg-rose-500', icon: XCircle };
        return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-500', icon: FileText };
    };

    const getActionColor = (action: string) => {
        if (action === 'CREATE') return "bg-indigo-50 text-indigo-600 border-indigo-100";
        if (action === 'UPDATE') return "bg-blue-50 text-blue-600 border-blue-100";
        if (action === 'DELETE') return "bg-red-50 text-red-600 border-red-100";
        return "bg-gray-50 text-gray-600 border-gray-100";
    };

    const getTableIcon = (table: string) => {
        if (table === 'Locker') return Box;
        if (table === 'LibraryPlan') return Tag;
        if (table === 'Slot' || table === 'SlotConfiguration') return Clock;
        if (table === 'Seat') return LayoutGrid;
        return Layers;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">Requests History</h3>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Track the approval status of your configuration changes.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{requests.length} Total</span>
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-[2rem] border border-gray-100" />
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <div className="bg-gradient-to-b from-gray-50 to-white border-2 border-dashed border-gray-200 rounded-[3rem] p-20 text-center flex flex-col items-center justify-center">
                    <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 flex items-center justify-center mb-6">
                        <FileText className="w-10 h-10 text-gray-300" />
                    </div>
                    <h4 className="text-xl font-black text-gray-900">Queue is Empty</h4>
                    <p className="text-gray-500 mt-3 font-medium max-w-sm text-center leading-relaxed">
                        Any configuration changes you make will appear here while they wait for administrative approval.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {requests.map((req: any, index: number) => {
                        const theme = getStatusTheme(req.status);
                        const StatusIcon = theme.icon;
                        const TableIcon = getTableIcon(req.targetTable);

                        return (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={req.id} 
                                className="group bg-white border border-gray-100 rounded-[2rem] p-2 sm:p-3 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden"
                            >
                                {/* Decorative background gradient for the card */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gray-50 to-transparent rounded-full blur-3xl -z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="bg-gray-50/50 rounded-[1.5rem] p-6 sm:p-8">
                                    {/* Header */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-gray-100 shrink-0 group-hover:scale-105 transition-transform">
                                                <TableIcon className="w-6 h-6 text-gray-700" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="text-lg font-black text-gray-900 tracking-tight">{req.targetTable}</h4>
                                                    <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest py-1 px-2.5 ${getActionColor(req.actionType)}`}>
                                                        {req.actionType}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                    {format(new Date(req.createdAt), 'MMM d, yyyy • h:mm a')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border ${theme.bg} ${theme.border} shrink-0`}>
                                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm">
                                                <div className={`w-2 h-2 rounded-full ${theme.dot}`} />
                                            </div>
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${theme.text}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Payload Representation */}
                                    <div className="mb-6">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Layers className="w-3.5 h-3.5" /> Proposed Configuration
                                        </h5>
                                        <PayloadRenderer payload={req.payload} />
                                    </div>

                                    {/* Resolution Info & Rejection Reason */}
                                    {(req.resolvedAt || req.rejectionReason) && (
                                        <div className="mt-6 pt-6 border-t border-gray-200/60">
                                            {req.resolvedAt && (
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                                    Resolved {format(new Date(req.resolvedAt), 'MMM d, yyyy • h:mm a')}
                                                </p>
                                            )}
                                            {req.rejectionReason && (
                                                <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm shadow-rose-50 flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                                                        <XCircle className="w-5 h-5 text-rose-500" />
                                                    </div>
                                                    <div>
                                                        <strong className="block text-sm font-black text-gray-900 mb-1">Rejection Reason</strong>
                                                        <p className="text-sm font-medium text-gray-600 leading-relaxed">{req.rejectionReason}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
