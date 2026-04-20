"use client";

import React from "react";
import { useGetLibraryMachinesQuery, useToggleMachineStatusMutation } from "@/state/api";
import { Server, Activity, Power, Shield, Settings2, Clock, MapPin, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";

export default function LibraryHardware({ libraryId }: { libraryId: string }) {
    const { data, isLoading, error } = useGetLibraryMachinesQuery({ libraryId }, { skip: !libraryId });
    const [toggleMachineStatus, { isLoading: isToggling }] = useToggleMachineStatusMutation();
    const [searchQuery, setSearchQuery] = React.useState("");

    const handleToggleStatus = async (machineId: string, currentStatus: boolean) => {
        try {
            await toggleMachineStatus({ machineId, isActive: !currentStatus }).unwrap();
            toast.success(`Machine is now ${!currentStatus ? 'Active' : 'Inactive'}`);
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to update machine status");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border shadow-sm">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-6 rounded-3xl border shadow-sm h-48 space-y-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-3xl border border-red-100">
                Failed to load registered hardware machines.
            </div>
        );
    }

    const machines = data.data || [];

    const filteredMachines = machines.filter((m: any) =>
        m.gateNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = machines.filter((m: any) => m.isActive).length;

    return (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Header Section */}
            <div className="rounded-3xl p-8 text-black border border-gray-200 relative overflow-hidden shadow-xl">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Hardware Devices</h1>
                        <p className="max-w-md text-sm leading-relaxed">
                            Manage the physical scan gates running at this library.
                            Toggle their active states to revoke or allow their API access instantly.
                        </p>
                    </div>
                    <div className="flex gap-4 md:justify-end">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center w-32">
                            <div className="text-3xl font-bold mb-1">{machines.length}</div>
                            <div className="text-xs font-medium tracking-wide uppercase">Total Gates</div>
                        </div>
                        <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/30 text-center w-32">
                            <div className="text-3xl font-bold mb-1">{activeCount}</div>
                            <div className="text-xs font-medium tracking-wide uppercase">Active</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter / Search Bar */}
            <div className="bg-white p-4 rounded-full border shadow-sm flex items-center gap-3 px-6">
                <Search className="w-5 h-5 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Search by Gate No. or Machine ID..."
                    className="border-0 bg-transparent focus-visible:ring-0 text-sm w-full p-0 h-auto font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="text-xs font-medium text-gray-400 uppercase tracking-widest whitespace-nowrap">
                    {filteredMachines.length} Devices
                </div>
            </div>

            {/* Devices Grid */}
            {filteredMachines.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border shadow-sm">
                    <Server className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-800">No Devices Found</h3>
                    <p className="text-gray-500 text-sm mt-1">There are no hardware devices matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMachines.map((machine: any) => (
                        <Card key={machine.id} className="rounded-3xl border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                            <div className={`h-2 w-full ${machine.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-2xl ${machine.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            <Server className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                Gate {machine.gateNo}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                                                <Activity className={`w-3 h-3 ${machine.isActive ? 'text-emerald-500' : 'text-red-500'}`} />
                                                {machine.isActive ? "Online & Authorized" : "Access Revoked"}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer group-hover:scale-105 transition-transform">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={machine.isActive}
                                            onChange={() => handleToggleStatus(machine.id, machine.isActive)}
                                            disabled={isToggling}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 disabled:opacity-50"></div>
                                    </label>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                            <Settings2 className="w-3.5 h-3.5" /> Machine ID
                                        </div>
                                        <span className="font-mono text-xs text-gray-700 bg-white px-2 py-1 rounded-md border shadow-sm max-w-[120px] truncate" title={machine.id}>
                                            {machine.id.substring(0, 8)}...{machine.id.substring(machine.id.length - 4)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                            <Clock className="w-3.5 h-3.5" /> Registered On
                                        </div>
                                        <span className="text-xs text-gray-700 font-medium">
                                            {format(new Date(machine.createdAt), "MMM dd, yyyy h:mm a")}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
