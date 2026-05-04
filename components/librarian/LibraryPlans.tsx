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
    CheckCircle2,
    Sparkles,
    Zap,
    TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    useGetPlansQuery,
    useUpdatePlanMutation,
    useDeletePlanMutation,
} from "@/state/api";
import { toast } from "sonner";

interface LibraryPlansProps {
    libraryId: string;
}

export default function LibraryPlans({ libraryId }: LibraryPlansProps) {
    const [fixedSearch, setFixedSearch] = useState("");
    const [fixedDuration, setFixedDuration] = useState<string>("all");
    const [floatSearch, setFloatSearch] = useState("");
    const [floatDuration, setFloatDuration] = useState<string>("all");

    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<string>("");
    const [activeActionPlanId, setActiveActionPlanId] = useState<string | null>(null);

    const { data: plans, isLoading: isLoadingPlans } = useGetPlansQuery(libraryId);
    const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
    const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation();

    const categorizedPlans = useMemo(() => {
        const groups = { Fixed: [] as any[], Float: [] as any[] };
        if (!plans) return groups;
        plans.forEach((plan: any) => {
            const type = plan.planType.charAt(0).toUpperCase() + plan.planType.slice(1).toLowerCase();
            if (type === "Fixed") groups.Fixed.push(plan);
            else if (type === "Float") groups.Float.push(plan);
        });
        return groups;
    }, [plans]);

    const availableDurations = useMemo(() => {
        if (!plans) return [];
        const hours = new Set<number>();
        plans.forEach((p: any) => hours.add(p.hours));
        return Array.from(hours).sort((a, b) => a - b);
    }, [plans]);

    const handleToggleStatus = async (planId: string, currentStatus: boolean) => {
        try {
            setActiveActionPlanId(planId);
            await updatePlan({ id: planId, data: { isActive: !currentStatus } }).unwrap();
            toast.success(`Plan ${!currentStatus ? "activated" : "deactivated"} successfully`);
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to update status");
        } finally {
            setActiveActionPlanId(null);
        }
    };

    const handleSavePrice = async (planId: string) => {
        try {
            const priceNum = parseFloat(editPrice);
            if (isNaN(priceNum)) {
                toast.error("Please enter a valid price");
                return;
            }
            setActiveActionPlanId(planId);
            await updatePlan({ id: planId, data: { price: priceNum } }).unwrap();
            setEditingPlanId(null);
            toast.success("Price updated successfully");
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to update price");
        } finally {
            setActiveActionPlanId(null);
        }
    };

    const handleDelete = async (planId: string) => {
        if (!confirm("Are you sure you want to delete this plan?")) return;
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
            const matchesSearch = !search || p.planName.toLowerCase().includes(search.toLowerCase());
            const matchesDuration = duration === "all" || p.hours.toString() === duration;
            return matchesSearch && matchesDuration;
        });

        return (
            <section className="space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border",
                            title === "Fixed" ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        )}>
                            {title === "Fixed" ? <Zap className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{title} Plans</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filtered.length} Active Configurations</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="h-11 px-4 rounded-xl border-gray-200 bg-white text-xs font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer border shadow-sm"
                        >
                            <option value="all">Any Duration</option>
                            {availableDurations.map(h => <option key={h} value={h.toString()}>{h} Hours</option>)}
                        </select>
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                placeholder={`Find ${title.toLowerCase()}...`}
                                className="pl-10 pr-4 h-11 w-full sm:w-56 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none bg-white text-xs font-bold transition-all shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filtered.map((plan) => (
                        <motion.div
                            key={plan.id}
                            layout
                            className={cn(
                                "group relative bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 p-8 flex flex-col gap-6 overflow-hidden",
                                !plan.isActive && "opacity-60 grayscale-[0.5]"
                            )}
                        >
                            {/* Popular Badge */}
                            {plan.isPopular && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-amber-400 text-amber-900 text-[9px] font-black uppercase px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1.5">
                                        <TrendingUp className="h-3 w-3" /> Best Seller
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                                        {plan.planName}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge className="bg-gray-900 text-white border-none rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                                            {plan.hours} Hours
                                        </Badge>
                                        {(plan.months > 0 || plan.days > 0) && (
                                            <Badge variant="outline" className="text-gray-500 border-gray-100 rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                                                Validity: {plan.months > 0 && `${plan.months}m `}{plan.days > 0 && `${plan.days}d`}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <Switch
                                    checked={plan.isActive}
                                    onCheckedChange={() => handleToggleStatus(plan.id, plan.isActive)}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                            <div className="mt-auto pt-8 border-t border-gray-50">
                                <div className="flex items-end justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Subscription Rate</span>
                                        {editingPlanId === plan.id ? (
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400">₹</span>
                                                    <Input
                                                        className="w-28 h-11 pl-7 rounded-xl font-black text-xl border-blue-100 focus:ring-blue-500/20"
                                                        value={editPrice}
                                                        onChange={(e) => setEditPrice(e.target.value)}
                                                        autoFocus
                                                    />
                                                </div>
                                                <Button size="sm" onClick={() => handleSavePrice(plan.id)} className="h-11 w-11 p-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </Button>
                                                <Button variant="ghost" onClick={() => setEditingPlanId(null)} className="h-11 w-11 p-0 text-gray-400">
                                                    <X className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-4xl font-black text-gray-900 tracking-tighter">₹{plan.price}</span>
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">/ MONTH</span>
                                            </div>
                                        )}
                                    </div>

                                    {editingPlanId !== plan.id && (
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                            <Button
                                                variant="ghost"
                                                onClick={() => { setEditingPlanId(plan.id); setEditPrice(plan.price.toString()); }}
                                                className="h-11 w-11 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                                            >
                                                <Edit3 className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleDelete(plan.id)}
                                                className="h-11 w-11 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        );
    };

    return (
        <div className="space-y-16 animate-in fade-in duration-1000">
            {isLoadingPlans ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-72 bg-gray-50 animate-pulse rounded-[3rem] border border-gray-100" />)}
                </div>
            ) : !plans || plans.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-16 text-center">
                    <Tag className="h-16 w-16 text-gray-200 mx-auto mb-6" />
                    <h3 className="text-xl font-black text-gray-900">No Revenue Models</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto text-sm">Design your first subscription plan to start accepting member bookings and revenue.</p>
                </div>
            ) : (
                <>
                    {categorizedPlans.Fixed.length > 0 && renderPlanSection("Fixed", categorizedPlans.Fixed, fixedSearch, setFixedSearch, fixedDuration, setFixedDuration)}
                    {categorizedPlans.Float.length > 0 && renderPlanSection("Float", categorizedPlans.Float, floatSearch, setFloatSearch, floatDuration, setFloatDuration)}
                </>
            )}
        </div>
    );
}
