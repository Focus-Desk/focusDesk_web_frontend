"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    Plus,
    Tag,
    Clock,
    Calendar,
    Edit3,
    Trash2,
    Save,
    X,
    LayoutGrid,
    Search,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    useGetPlansQuery,
    useUpdatePlanMutation,
    useDeletePlanMutation,
    useGetSlotConfigsByLibraryIdQuery,
} from "@/state/api";
import { toast } from "sonner";

interface LibraryPlansProps {
    libraryId: string;
}

export default function LibraryPlans({ libraryId }: LibraryPlansProps) {
    // Category-specific states
    const [fixedSearch, setFixedSearch] = useState("");
    const [fixedDuration, setFixedDuration] = useState<string>("all");
    const [floatSearch, setFloatSearch] = useState("");
    const [floatDuration, setFloatDuration] = useState<string>("all");

    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<string>("");
    const [activeActionPlanId, setActiveActionPlanId] = useState<string | null>(null);

    const { data: plans, isLoading: isLoadingPlans, refetch: refetchPlans } = useGetPlansQuery(libraryId);
    const { data: configsResponse, isLoading: isLoadingConfigs } = useGetSlotConfigsByLibraryIdQuery(libraryId);

    const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
    const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation();

    // Group plans by Fixed and Float
    const categorizedPlans = useMemo(() => {
        const groups = {
            Fixed: [] as any[],
            Float: [] as any[]
        };

        if (!plans) return groups;

        plans.forEach((plan: any) => {
            const type = plan.planType.charAt(0).toUpperCase() + plan.planType.slice(1).toLowerCase();
            if (type === "Fixed") groups.Fixed.push(plan);
            else if (type === "Float") groups.Float.push(plan);
        });

        return groups;
    }, [plans]);

    // Get unique available durations for filters
    const availableDurations = useMemo(() => {
        if (!plans) return [];
        const hours = new Set<number>();
        plans.forEach((p: any) => hours.add(p.hours));
        return Array.from(hours).sort((a, b) => a - b);
    }, [plans]);

    const handleToggleStatus = async (planId: string, currentStatus: boolean) => {
        try {
            setActiveActionPlanId(planId);
            await updatePlan({
                id: planId,
                data: { isActive: !currentStatus }
            }).unwrap();
            toast.success(`Plan ${!currentStatus ? "activated" : "deactivated"} successfully`);
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to update status");
        } finally {
            setActiveActionPlanId(null);
        }
    };

    const handleStartEdit = (plan: any) => {
        setEditingPlanId(plan.id);
        setEditPrice(plan.price.toString());
    };

    const handleCancelEdit = () => {
        setEditingPlanId(null);
        setEditPrice("");
    };

    const handleSavePrice = async (planId: string) => {
        try {
            const priceNum = parseFloat(editPrice);
            if (isNaN(priceNum)) {
                toast.error("Please enter a valid price");
                return;
            }

            setActiveActionPlanId(planId);
            await updatePlan({
                id: planId,
                data: { price: priceNum }
            }).unwrap();

            setEditingPlanId(null);
            toast.success("Price updated successfully");
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to update price");
        } finally {
            setActiveActionPlanId(null);
        }
    };

    const handleDelete = async (planId: string) => {
        if (!confirm("Are you sure you want to delete this plan? This action cannot be undone.")) return;
        try {
            setActiveActionPlanId(planId);
            await deletePlan(planId).unwrap();
            toast.success("Plan deleted successfully");
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to delete plan");
        } finally {
            setActiveActionPlanId(null);
        }
    };

    const renderPlanSection = (title: string, groupPlans: any[], search: string, setSearch: (v: string) => void, duration: string, setDuration: (v: string) => void) => {
        const filtered = groupPlans.filter(p => {
            const matchesSearch = !search ||
                p.planName.toLowerCase().includes(search.toLowerCase()) ||
                p.hours.toString().includes(search);
            const matchesDuration = duration === "all" || p.hours.toString() === duration;
            return matchesSearch && matchesDuration;
        });

        return (
            <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-10 w-10 rounded-2xl flex items-center justify-center shadow-sm",
                            title === "Fixed" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                            <LayoutGrid className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">{title} Plans</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filtered.length} Plans found</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Duration Filter */}
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="h-10 px-3 rounded-xl border-gray-200 bg-white text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer border"
                        >
                            <option value="all">All Durations</option>
                            {availableDurations.map(h => (
                                <option key={h} value={h.toString()}>{h} Hours</option>
                            ))}
                        </select>

                        {/* Search Box */}
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                placeholder={`Search ${title}...`}
                                className="pl-9 pr-4 h-10 w-full sm:w-48 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white text-sm font-medium transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {filtered.length === 0 ? (
                    <div className="bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[2rem] p-12 text-center">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No plans match your filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.map((plan) => (
                            <motion.div
                                key={plan.id}
                                layout
                                className={cn(
                                    "group relative bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 p-6 flex flex-col gap-5",
                                    !plan.isActive && "opacity-75 grayscale-[0.5]"
                                )}
                            >
                                {/* Loading Overlay */}
                                {(isUpdating || isDeleting) && activeActionPlanId === plan.id && (
                                    <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] rounded-[2rem] flex items-center justify-center animate-in fade-in duration-200">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Updating...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Plan Header */}
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1.5 group-hover:translate-x-1 transition-transform">
                                        <h4 className="text-lg font-black text-gray-900 leading-tight">
                                            {plan.planName}
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            <Badge className={cn(
                                                "rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase",
                                                plan.planType === "Fixed" ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            )}>
                                                {plan.planType}
                                            </Badge>
                                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 text-[10px] font-bold text-gray-500 border border-gray-100">
                                                <Clock className="h-3 w-3" />
                                                {plan.hours} Hours
                                            </div>
                                        </div>
                                    </div>

                                    <Switch
                                        checked={plan.isActive}
                                        onCheckedChange={() => handleToggleStatus(plan.id, plan.isActive)}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </div>

                                {/* Slot Pools / Timing */}
                                {plan.slotPools && plan.slotPools.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {plan.slotPools.map((pool: string) => (
                                            <span key={pool} className="px-2 py-1 rounded-md bg-blue-50/50 text-blue-600 text-[9px] font-black uppercase tracking-wider border border-blue-100/50">
                                                {pool}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Description */}
                                {plan.description && (
                                    <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">
                                        {plan.description}
                                    </p>
                                )}

                                {/* Pricing Section */}
                                <div className="mt-auto pt-5 border-t border-gray-50 flex items-end justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pricing</span>
                                        {editingPlanId === plan.id ? (
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
                                                    <Input
                                                        className="w-24 h-9 pl-6 rounded-lg font-bold text-lg"
                                                        value={editPrice}
                                                        onChange={(e) => setEditPrice(e.target.value)}
                                                        autoFocus
                                                    />
                                                </div>
                                                <Button size="sm" onClick={() => handleSavePrice(plan.id)} className="h-9 w-9 p-0 bg-blue-600 rounded-lg">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-9 w-9 p-0 text-gray-400 rounded-lg">
                                                    <X className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-2xl font-black text-gray-900 tracking-tighter">₹{plan.price}</span>
                                                <span className="text-xs font-bold text-gray-400">/mo</span>
                                            </div>
                                        )}
                                    </div>

                                    {editingPlanId !== plan.id && (
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleStartEdit(plan)}
                                                className="h-9 w-9 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(plan.id)}
                                                className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Status Badge */}
                                {!plan.isActive && (
                                    <div className="absolute top-4 left-1/2 -translate-x-1/2 -translate-y-full group-hover:translate-y-0 transition-transform bg-gray-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg pointer-events-none z-10">
                                        Plan is Hidden
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        );
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header / Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Library Plans</h2>
                    <p className="text-sm text-gray-500 font-medium">Manage your subscription models and pricing</p>
                </div>
            </div>

            {/* Plans List */}
            <div className="space-y-16">
                {isLoadingPlans ? (
                    <div className="space-y-12">
                        {[1, 2].map(i => (
                            <div key={i} className="space-y-6">
                                <div className="h-10 w-48 bg-gray-100 animate-pulse rounded-xl" />
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <div key={j} className="h-64 bg-gray-50/50 animate-pulse rounded-[2rem] border border-gray-100" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !plans || plans.length === 0 ? (
                    <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center">
                        <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Tag className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No Plans Yet</h3>
                        <p className="text-gray-500 mt-1 max-w-sm mx-auto">Create your first subscription plan to start accepting bookings.</p>
                    </div>
                ) : (
                    <>
                        {renderPlanSection("Fixed", categorizedPlans.Fixed, fixedSearch, setFixedSearch, fixedDuration, setFixedDuration)}
                        {renderPlanSection("Float", categorizedPlans.Float, floatSearch, setFloatSearch, floatDuration, setFloatDuration)}
                    </>
                )}
            </div>

            {/* Stats / Summary Footer */}
            {!isLoadingPlans && plans && plans.length > 0 && (
                <div className="bg-gray-50 rounded-[2.5rem] p-8 flex flex-wrap gap-12 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-xl text-gray-900 border border-gray-100">
                            {plans.length}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Total Plans</span>
                            <span className="text-lg font-black text-gray-700 tracking-tight">Configured</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-l border-gray-200 pl-12">
                        <div className="h-14 w-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-100 flex items-center justify-center font-black text-xl text-white">
                            {plans.filter(p => p.isActive).length}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Active Plans</span>
                            <span className="text-lg font-black text-gray-700 tracking-tight">Live Today</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
