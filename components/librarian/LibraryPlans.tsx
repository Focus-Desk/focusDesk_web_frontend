"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
    TrendingUp,
    Check
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    useGetPlansQuery,
    useUpdatePlanMutation,
    useDeletePlanMutation,
    useCreatePlanMutation,
    useGetSlotConfigsByLibraryIdQuery
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
    const { data: configsRes } = useGetSlotConfigsByLibraryIdQuery(libraryId);
    const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();
    const [deletePlan, { isLoading: isDeleting }] = useDeletePlanMutation();
    const [createPlan, { isLoading: isCreating }] = useCreatePlanMutation();

    const configs = configsRes?.data || [];

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [planForm, setPlanForm] = useState({
        planName: "",
        planType: "Fixed" as "Fixed" | "Float",
        price: "",
        hours: "12",
        selectedConfigIds: [] as string[],
        description: ""
    });

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

    const handleCreatePlan = async () => {
        try {
            if (!planForm.planName || !planForm.price || !planForm.hours || planForm.selectedConfigIds.length === 0) {
                toast.error("Please fill in all required fields and select at least one shift pattern");
                return;
            }

            const payload = {
                libraryId,
                planName: planForm.planName,
                planType: planForm.planType,
                price: parseFloat(planForm.price),
                hours: parseInt(planForm.hours),
                slotIds: planForm.selectedConfigIds,
                description: planForm.description
            };

            await createPlan(payload).unwrap();
            toast.success("Subscription plan created successfully!");
            setIsCreateModalOpen(false);
            setPlanForm({
                planName: "",
                planType: "Fixed",
                price: "",
                hours: "12",
                selectedConfigIds: [],
                description: ""
            });
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to create plan");
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
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{title} Plans</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filtered.length} Active Plans</p>
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
                                "group relative bg-white rounded-[1rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 p-8 flex flex-col gap-6 overflow-hidden",
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
                                <div className="flex items-center gap-2">
                                    {(isUpdating && activeActionPlanId === plan.id) && <Loader2 className="h-3 w-3 animate-spin text-blue-600" />}
                                    <Switch
                                        checked={plan.isActive}
                                        onCheckedChange={() => handleToggleStatus(plan.id, plan.isActive)}
                                        disabled={isUpdating && activeActionPlanId === plan.id}
                                        className="data-[state=checked]:bg-blue-600"
                                    />
                                </div>
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
                                                <Button size="sm" onClick={() => handleSavePrice(plan.id)} disabled={isUpdating && activeActionPlanId === plan.id} className="h-11 w-11 p-0 bg-blue-600 rounded-xl shadow-lg shadow-blue-100">
                                                    {(isUpdating && activeActionPlanId === plan.id) ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    )}
                                                </Button>
                                                <Button variant="ghost" onClick={() => setEditingPlanId(null)} disabled={isUpdating && activeActionPlanId === plan.id} className="h-11 w-11 p-0 text-gray-400">
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
                                                disabled={(isUpdating || isDeleting) && activeActionPlanId === plan.id}
                                                className="h-11 w-11 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                                            >
                                                <Edit3 className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleDelete(plan.id)}
                                                disabled={(isUpdating || isDeleting) && activeActionPlanId === plan.id}
                                                className="h-11 w-11 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                            >
                                                {(isDeleting && activeActionPlanId === plan.id) ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-5 w-5" />
                                                )}
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
            {/* Header with Search and Create */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Revenue Models</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{plans?.length || 0} active subscriptions</p>
                </div>
                <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 px-6 transition-all hover:scale-[1.02]"
                >
                    <Plus className="w-5 h-5" /> New Plan
                </Button>
            </div>

            <div className="space-y-20">
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

            {/* Creation Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] rounded-[23px] sm:rounded-[23px] p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none flex flex-col">
                    <div className="bg-blue-600 p-8 sm:p-10 text-white relative shrink-0">
                        <Sparkles className="absolute top-4 right-4 h-20 sm:h-24 w-20 sm:w-24 opacity-10 rotate-12" />
                        <DialogHeader>
                            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter">
                                Design New Plan
                            </DialogTitle>
                            <DialogDescription className="text-blue-100 font-medium mt-1">
                                Create a tailored subscription model for your library members.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 sm:p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Plan Identity</Label>
                                <Input
                                    value={planForm.planName}
                                    onChange={e => setPlanForm({ ...planForm, planName: e.target.value })}
                                    placeholder="e.g. Executive Full Day"
                                    className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm px-5"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Allocation Type</Label>
                                <div className="flex p-1.5 bg-gray-100 rounded-2xl gap-1">
                                    {(["Fixed", "Float"] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setPlanForm({ ...planForm, planType: type })}
                                            className={cn(
                                                "flex-1 h-11 rounded-xl text-xs font-black transition-all",
                                                planForm.planType === type ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                            )}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Monthly Pricing (₹)</Label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                    <Input
                                        type="number"
                                        value={planForm.price}
                                        onChange={e => setPlanForm({ ...planForm, price: e.target.value })}
                                        placeholder="1500"
                                        className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm pl-10 pr-5"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Usage Duration (Hrs)</Label>
                                <select
                                    value={planForm.hours}
                                    onChange={e => setPlanForm({ ...planForm, hours: e.target.value })}
                                    className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50 px-5 font-bold text-sm outline-none appearance-none cursor-pointer"
                                >
                                    <option value="6">6 Hours</option>
                                    <option value="8">8 Hours</option>
                                    <option value="10">10 Hours</option>
                                    <option value="12">12 Hours (Standard)</option>
                                    <option value="14">14 Hours</option>
                                    <option value="24">24 Hours (Full Cycle)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Available Shift Patterns</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {configs.map((config: any) => (
                                    <button
                                        key={config.id}
                                        onClick={() => {
                                            const updated = planForm.selectedConfigIds.includes(config.id)
                                                ? planForm.selectedConfigIds.filter(id => id !== config.id)
                                                : [...planForm.selectedConfigIds, config.id];
                                            setPlanForm({ ...planForm, selectedConfigIds: updated });
                                        }}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                                            planForm.selectedConfigIds.includes(config.id)
                                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]"
                                                : "bg-white border-gray-100 text-gray-400 hover:border-blue-200"
                                        )}
                                    >
                                        <div className="text-left">
                                            <div className={cn("text-[10px] font-black uppercase tracking-widest", planForm.selectedConfigIds.includes(config.id) ? "text-blue-100" : "text-gray-900")}>
                                                {config.name}
                                            </div>
                                            <div className={cn("text-[8px] font-bold", planForm.selectedConfigIds.includes(config.id) ? "text-blue-200" : "text-gray-400")}>
                                                {config.slots?.length || 0} time windows linked
                                            </div>
                                        </div>
                                        {planForm.selectedConfigIds.includes(config.id) && <Check className="h-5 w-5 text-white" />}
                                    </button>
                                ))}
                                {configs.length === 0 && (
                                    <p className="col-span-2 text-[10px] font-bold text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                        Warning: No shift patterns found. Please define shift configurations first in the Schedule tab.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Plan Highlights (Optional)</Label>
                            <Input
                                value={planForm.description}
                                onChange={e => setPlanForm({ ...planForm, description: e.target.value })}
                                placeholder="e.g. Complimentary Wi-Fi, Coffee, Dedicated Locker"
                                className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm px-5"
                            />
                        </div>
                    </div>

                    <div className="p-8 sm:p-10 bg-gray-50 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={isCreating}
                            className="h-14 px-8 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all order-2 sm:order-1"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleCreatePlan}
                            disabled={isCreating}
                            className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100 transition-all hover:scale-[1.02] order-1 sm:order-2"
                        >
                            {isCreating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                            Deploy Plan
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
