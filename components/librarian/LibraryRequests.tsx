"use client";

import React from 'react';
import { useGetChangeRequestsByLibraryQuery } from '@/state/api';
import { Loader2, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function LibraryRequests({ libraryId }: { libraryId: string }) {
    const { data: requestsRes, isLoading } = useGetChangeRequestsByLibraryQuery(libraryId);
    const requests = requestsRes?.data || [];

    const getStatusColor = (status: string) => {
        if (status === 'PENDING') return 'bg-amber-100 text-amber-800 border-amber-200';
        if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (status === 'REJECTED') return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status: string) => {
        if (status === 'PENDING') return <Clock className="w-4 h-4 mr-1.5" />;
        if (status === 'APPROVED') return <CheckCircle className="w-4 h-4 mr-1.5" />;
        if (status === 'REJECTED') return <XCircle className="w-4 h-4 mr-1.5" />;
        return <FileText className="w-4 h-4 mr-1.5" />;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Requests</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {requests.length} Configuration Change Requests
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : requests.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-gray-900">No requests found</h4>
                    <p className="text-gray-500 mt-2 font-medium text-sm">You haven't submitted any configuration changes yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req: any) => (
                        <div key={req.id} className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-600 border-gray-200 py-1.5 px-3">
                                        {req.targetTable}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border-blue-200 py-1.5 px-3">
                                        {req.actionType}
                                    </Badge>
                                </div>
                                <div className={`flex items-center px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-black border ${getStatusColor(req.status)}`}>
                                    {getStatusIcon(req.status)}
                                    {req.status}
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-2xl p-5 mb-5 overflow-x-auto border border-gray-100">
                                <pre className="text-xs text-gray-700 font-mono leading-relaxed">
                                    {JSON.stringify(req.payload, null, 2)}
                                </pre>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                                <span>Requested {format(new Date(req.createdAt), 'MMM d, yyyy • h:mm a')}</span>
                                {req.resolvedAt && (
                                    <span>Resolved {format(new Date(req.resolvedAt), 'MMM d, yyyy • h:mm a')}</span>
                                )}
                            </div>

                            {req.rejectionReason && (
                                <div className="mt-5 bg-red-50 text-red-700 text-sm p-5 rounded-2xl border border-red-100 font-medium flex gap-3 items-start">
                                    <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                                    <div>
                                        <strong className="block text-red-900 mb-1">Reason for rejection</strong>
                                        <p className="opacity-90">{req.rejectionReason}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
