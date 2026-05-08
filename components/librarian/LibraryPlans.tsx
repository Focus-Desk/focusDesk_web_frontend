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

const SLOT_POOLS = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];

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

    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [planForm, setPlanForm] = useState({
        planName: "",
        planType: "Fixed" as "Fixed" | "Float",
        price: "",
        hours: "0",
        selectedConfigId: "",
        selectedSlotIds: [] as string[],
        slotPools: [] as string[],
        description: ""
    });

    const calculateHours = (start: string, end: string) => {
        if (!start || !end) return 0;
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diff < 0) diff += 24 * 60;
        return diff / 60;
    };

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
            const isFixed = planForm.planType === "Fixed";
            const hasRequiredFields = planForm.planName && planForm.price && planForm.hours;
            const hasValidSlots = isFixed ? planForm.selectedSlotIds.length > 0 : true;

            if (!hasRequiredFields || !hasValidSlots) {
                toast.error(isFixed
                    ? "Please fill in all fields and select at least one shift segment"
                    : "Please fill in the plan name, price, and hours");
                return;
            }

            const payload = {
                libraryId,
                planName: planForm.planName,
                planType: planForm.planType,
                price: parseFloat(planForm.price),
                hours: Math.ceil(parseFloat(planForm.hours)),
                slotIds: planForm.selectedSlotIds,
                slotPools: planForm.slotPools,
                description: planForm.description
            };

            await createPlan(payload).unwrap();
            toast.success("Subscription plan created successfully!");
            setIsCreateModalOpen(false);
            setPlanForm({
                planName: "",
                planType: "Fixed",
                price: "",
                hours: "0",
                selectedConfigId: "",
                selectedSlotIds: [],
                slotPools: [],
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
                <div className="relative">
                    <Button
                        onClick={() => setIsTypeSelectorOpen(!isTypeSelectorOpen)}
                        className="h-12 bg-white text-gray-900 border-2 border-gray-400 hover:border-gray-600 hover:text-white bg-gray-50 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 px-6 transition-all hover:scale-[1.02]"
                    >
                        <Plus className="w-5 h-5" /> New Plan
                    </Button>

                    <AnimatePresence>
                        {isTypeSelectorOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsTypeSelectorOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 z-50 overflow-hidden"
                                >
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => {
                                                setPlanForm({ ...planForm, planType: "Fixed", hours: "0", selectedSlotIds: [], selectedConfigId: "" });
                                                setIsCreateModalOpen(true);
                                                setIsTypeSelectorOpen(false);
                                            }}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-50 transition-all text-left group"
                                        >
                                            <div>
                                                <div className="text-sm font-black text-gray-900">Fixed Plan</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">Dedicated Seating</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setPlanForm({ ...planForm, planType: "Float", hours: "12", selectedSlotIds: [], selectedConfigId: "" });
                                                setIsCreateModalOpen(true);
                                                setIsTypeSelectorOpen(false);
                                            }}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-amber-50 transition-all text-left group"
                                        >
                                            <div>
                                                <div className="text-sm font-black text-gray-900">Float Plan</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">Flexible Seating</div>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
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
                    <div className={cn(
                        "p-6 pb-0! sm:p-8 sm:pb-0! relative shrink-0 transition-colors duration-500"
                    )}>
                        <DialogHeader>
                            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter">
                                New {planForm.planType} Plan
                            </DialogTitle>
                            <DialogDescription className="text-gray-900 font-medium mt-1">
                                {planForm.planType === "Fixed"
                                    ? "Design a dedicated seating model with fixed shift segments."
                                    : "Create a flexible seating plan with custom hour allocations."}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 pt-2! space-y-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Plan Name</Label>
                                <Input
                                    value={planForm.planName}
                                    onChange={e => setPlanForm({ ...planForm, planName: e.target.value })}
                                    placeholder="e.g. Executive Full Day"
                                    className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm px-5"
                                />
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
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Total Duration (Hrs)</Label>
                                {planForm.planType === 'Fixed' ? (
                                    <div className="h-14 flex items-center px-5 rounded-2xl bg-gray-100 border border-gray-100 text-sm font-black text-blue-600">
                                        {planForm.hours} Hours
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={planForm.hours}
                                            onChange={e => setPlanForm({ ...planForm, hours: e.target.value })}
                                            placeholder="12"
                                            className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm px-5 pr-12"
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">Hrs</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {planForm.planType === 'Fixed' && (
                            <>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Select Shift Configuration</Label>
                                    <select
                                        value={planForm.selectedConfigId}
                                        onChange={e => {
                                            setPlanForm({
                                                ...planForm,
                                                selectedConfigId: e.target.value,
                                                selectedSlotIds: [],
                                                hours: "0"
                                            });
                                        }}
                                        className="w-full h-14 rounded-2xl border border-gray-100 bg-gray-50 px-5 font-bold text-sm outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select a configuration</option>
                                        {configs.map((config: any) => (
                                            <option key={config.id} value={config.id}>{config.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {planForm.selectedConfigId && (
                                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Included Slot Segments</Label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {(configs.find((c: any) => c.id === planForm.selectedConfigId)?.slots || []).map((slot: any) => {
                                                const isSelected = planForm.selectedSlotIds.includes(slot.id);
                                                return (
                                                    <button
                                                        key={slot.id}
                                                        onClick={() => {
                                                            const updatedIds = isSelected
                                                                ? planForm.selectedSlotIds.filter(id => id !== slot.id)
                                                                : [...planForm.selectedSlotIds, slot.id];

                                                            // Calculate total hours
                                                            const selectedSlots = (configs.find((c: any) => c.id === planForm.selectedConfigId)?.slots || []).filter((s: any) => updatedIds.includes(s.id));
                                                            const totalHours = selectedSlots.reduce((acc: number, s: any) => acc + calculateHours(s.startTime, s.endTime), 0);

                                                            setPlanForm({
                                                                ...planForm,
                                                                selectedSlotIds: updatedIds,
                                                                hours: totalHours.toFixed(1)
                                                            });
                                                        }}
                                                        className={cn(
                                                            "flex flex-col p-4 rounded-2xl border transition-all duration-300 text-left",
                                                            isSelected
                                                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]"
                                                                : "bg-white border-gray-100 text-gray-400 hover:border-blue-200"
                                                        )}
                                                    >
                                                        <div className={cn("text-[10px] font-black uppercase tracking-widest", isSelected ? "text-blue-100" : "text-gray-900")}>
                                                            {slot.tag}
                                                        </div>
                                                        <div className={cn("text-[8px] font-bold", isSelected ? "text-blue-200" : "text-gray-400")}>
                                                            {slot.startTime} - {slot.endTime}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Slot Pools</Label>
                            <div className="flex flex-wrap gap-3">
                                {SLOT_POOLS.map(pool => (
                                    <button
                                        key={pool}
                                        onClick={() => {
                                            const updatedPools = planForm.slotPools.includes(pool)
                                                ? planForm.slotPools.filter(p => p !== pool)
                                                : [...planForm.slotPools, pool];
                                            setPlanForm({ ...planForm, slotPools: updatedPools });
                                        }}
                                        className={cn(
                                            "px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                            planForm.slotPools.includes(pool)
                                                ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                                                : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                        )}
                                    >
                                        {pool}
                                    </button>
                                ))}
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
                            className={cn(
                                "h-14 px-10 rounded-2xl text-white font-bold transition-all hover:scale-[1.02] order-1 sm:order-2",
                                planForm.planType === "Fixed"
                                    ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"
                                    : "bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-100"
                            )}
                        >
                            {isCreating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                            Create {planForm.planType} Plan
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
}
