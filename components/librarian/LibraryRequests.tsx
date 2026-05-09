"use client";

import React from 'react';
import { useGetChangeRequestsByLibraryQuery } from '@/state/api';
import { Loader2, Clock, CheckCircle, XCircle, FileText, LayoutGrid, Tag, Box, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const formatKey = (key: string) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
};

const PayloadRenderer = ({ payload }: { payload: any }) => {
    if (!payload || typeof payload !== 'object') return null;

    const entries = Object.entries(payload).filter(([key]) => key !== 'libraryId');

    if (entries.length === 0) return <div className="text-sm text-gray-500">No details provided.</div>;

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <tbody className="divide-y divide-gray-200 bg-white">
                    {entries.map(([key, value]) => {
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
                            <tr key={key}>
                                <td className="py-2 px-4 bg-gray-50 font-medium text-gray-600 w-1/3 border-r border-gray-200">
                                    {formatKey(key)}
                                </td>
                                <td className="py-2 px-4 text-gray-900 truncate max-w-xs" title={String(displayValue)}>
                                    {String(displayValue)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default function LibraryRequests({ libraryId }: { libraryId: string }) {
    const { data: requestsRes, isLoading } = useGetChangeRequestsByLibraryQuery({ libraryId });
    const requests = requestsRes?.data || [];

    const getStatusStyle = (status: string) => {
        if (status === 'PENDING') return 'bg-amber-100 text-amber-800 border-amber-200';
        if (status === 'APPROVED') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (status === 'REJECTED') return 'bg-red-100 text-red-800 border-red-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getActionStyle = (action: string) => {
        if (action === 'CREATE') return "bg-indigo-50 text-indigo-700 border-indigo-200";
        if (action === 'UPDATE') return "bg-blue-50 text-blue-700 border-blue-200";
        if (action === 'DELETE') return "bg-red-50 text-red-700 border-red-200";
        return "bg-gray-50 text-gray-700 border-gray-200";
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Change Requests</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Review the status of your configuration changes.
                    </p>
                </div>
                <div className="text-sm font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-md">
                    Total: {requests.length}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : requests.length === 0 ? (
                <div className="border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center bg-gray-50">
                    <FileText className="w-8 h-8 text-gray-400 mb-3" />
                    <h4 className="text-base font-semibold text-gray-900">No requests found</h4>
                    <p className="text-sm text-gray-500 mt-1">
                        Configuration changes will appear here while pending approval.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req: any) => {
                        return (
                            <div key={req.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-semibold text-gray-900">{req.targetTable}</h4>
                                                <Badge variant="outline" className={`text-xs px-2 py-0 font-medium ${getActionStyle(req.actionType)}`}>
                                                    {req.actionType}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Requested on {format(new Date(req.createdAt), 'MMM d, yyyy h:mm a')}
                                            </p>
                                        </div>
                                    </div>

                                    <Badge variant="outline" className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusStyle(req.status)}`}>
                                        {req.status}
                                    </Badge>
                                </div>

                                <div className="mb-4">
                                    <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                        Payload Details
                                    </h5>
                                    <PayloadRenderer payload={req.payload} />
                                </div>

                                {(req.resolvedAt || req.rejectionReason) && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm">
                                        {req.resolvedAt && (
                                            <p className="text-gray-600 mb-2">
                                                <span className="font-semibold text-gray-900">Resolved at: </span>
                                                {format(new Date(req.resolvedAt), 'MMM d, yyyy h:mm a')}
                                            </p>
                                        )}
                                        {req.rejectionReason && (
                                            <div className="flex items-start gap-2 text-red-700 bg-red-50 p-3 rounded border border-red-100 mt-2">
                                                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-semibold block">Rejection Reason</span>
                                                    <span>{req.rejectionReason}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
