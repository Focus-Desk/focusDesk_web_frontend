"use client";

import React, { useState, useMemo } from "react";
import {
    Lock,
    Plus,
    Edit3,
    Trash2,
    Shield,
    Box,
    Sparkles,
    Loader2,
    ChevronRight,
    LayoutGrid,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useGetLockersQuery, useCreateLockerMutation } from "@/state/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface LibraryLockersProps {
    libraryId: string;
}

export default function LibraryLockers({ libraryId }: LibraryLockersProps) {
    const { data: lockers, isLoading } = useGetLockersQuery(libraryId);
    const [createLocker] = useCreateLockerMutation();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        lockerType: "Standard",
        numberOfLockers: "",
        charge: "",
        description: "",
    });

    // Group lockers by category (lockerType)
    const groupedLockers = useMemo(() => {
        if (!lockers) return {};
        return lockers.reduce((acc: any, locker: any) => {
            const type = locker.lockerType || "Uncategorized";
            if (!acc[type]) acc[type] = [];
            acc[type].push(locker);
            return acc;
        }, {});
    }, [lockers]);

    const handleCreateLocker = async () => {
        try {
            if (!formData.lockerType || !formData.numberOfLockers || !formData.charge) {
                toast.error("Please fill in all required fields");
                return;
            }

            const payload = {
                libraryId,
                groups: [{
                    lockerType: formData.lockerType,
                    numberOfLockers: parseInt(formData.numberOfLockers),
                    price: parseFloat(formData.charge),
                    description: formData.description,
                }]
            };

            await createLocker(payload as any).unwrap();
            toast.success(`${formData.numberOfLockers} ${formData.lockerType} lockers created!`);
            setIsCreateModalOpen(false);
            setFormData({ lockerType: "Standard", numberOfLockers: "", charge: "", description: "" });
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to create lockers");
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-[1.5rem] bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100">
                        <Lock className="h-7 w-7" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Security Vaults</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lockers?.length || 0} Total Units across {Object.keys(groupedLockers).length} Categories</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input 
                            placeholder="Find units..." 
                            className="pl-11 h-11 w-64 rounded-xl border-gray-100 bg-white/50 focus:bg-white shadow-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-100 px-6 transition-all hover:scale-[1.02]">
                        <Plus className="w-5 h-5" /> New Batch
                    </Button>
                </div>
            </div>

            {/* Content Section */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-gray-50 animate-pulse rounded-[3rem] border border-gray-100" />
                    ))}
                </div>
            ) : Object.keys(groupedLockers).length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-20 text-center">
                    <div className="h-24 w-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                        <Shield className="h-12 w-12 text-gray-200" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">No lockers configured yet</h4>
                    <p className="text-gray-500 mt-3 max-w-sm mx-auto text-sm leading-relaxed font-medium">Define your library's storage categories and populate your inventory to start generating additional revenue.</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {Object.entries(groupedLockers).map(([category, items]: [string, any]) => (
                        <div key={category} className="space-y-8">
                            <div className="flex items-center gap-4 px-2">
                                <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    {category} Units
                                </Badge>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{items.length} Units</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {items.filter((l: any) => 
                                    l.lockerNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    l.code?.toLowerCase().includes(searchQuery.toLowerCase())
                                ).map((locker: any) => (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={locker.id}
                                        className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-7 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
                                    >
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="h-14 w-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-black text-xl shadow-xl group-hover:bg-emerald-600 transition-colors duration-500">
                                                {locker.lockerNumber || "L"}
                                            </div>
                                            <Badge className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                                locker.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-gray-400 border-gray-100"
                                            )}>
                                                {locker.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </div>

                                        <div className="space-y-1 mb-6">
                                            <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-tight">Access Code</h4>
                                            <code className="text-lg font-black text-emerald-600 tracking-tighter">{locker.code}</code>
                                        </div>

                                        <div className="mt-auto space-y-6">
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{locker.price}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">/ Mo</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="ghost" className="h-11 rounded-xl font-bold bg-gray-50 text-gray-600 border border-transparent hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all text-xs">
                                                    Details
                                                </Button>
                                                <Button variant="ghost" className="h-11 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Creation Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] rounded-[2rem] sm:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none flex flex-col">
                    <div className="bg-emerald-600 p-8 sm:p-10 text-white relative shrink-0">
                        <Sparkles className="absolute top-4 right-4 h-20 sm:h-24 w-20 sm:w-24 opacity-10 -rotate-12" />
                        <DialogHeader>
                            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter">
                                Expand Storage
                            </DialogTitle>
                            <DialogDescription className="text-emerald-100 font-medium mt-1">
                                Add a new batch of lockers to your library inventory.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 sm:p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Locker Category</Label>
                                <select
                                    value={formData.lockerType}
                                    onChange={e => setFormData({ ...formData, lockerType: e.target.value })}
                                    className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50 px-5 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="Standard">Standard</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Large">Large Vault</option>
                                    <option value="Mini">Mini Locker</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Batch Size</Label>
                                <Input
                                    type="number"
                                    value={formData.numberOfLockers}
                                    onChange={e => setFormData({ ...formData, numberOfLockers: e.target.value })}
                                    placeholder="e.g. 10"
                                    className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm px-5"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Monthly Charge (₹)</Label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                <Input
                                    type="number"
                                    value={formData.charge}
                                    onChange={e => setFormData({ ...formData, charge: e.target.value })}
                                    placeholder="200"
                                    className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm pl-10 pr-5"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description (Optional)</Label>
                            <Textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Details about size, features, etc."
                                className="min-h-[100px] rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm p-5 resize-none"
                            />
                        </div>
                    </div>

                    <div className="p-8 sm:p-10 bg-gray-50 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="h-14 px-8 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all order-2 sm:order-1">
                            Dismiss
                        </Button>
                        <Button onClick={handleCreateLocker} className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-100 transition-all hover:scale-[1.02] order-1 sm:order-2">
                            Initialize Batch
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
