"use client";

import React, { useState, useMemo } from "react";
import {
    Gift,
    Zap,
    Plus,
    Edit3,
    Trash2,
    Calendar,
    Percent,
    Tag,
    Clock,
    CheckCircle2,
    X,
    Info,
    ChevronRight,
    Sparkles,
    Ticket,
    ShieldCheck,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    useGetOffersQuery,
    useGetPackageRulesByLibraryIdQuery,
    useGetPlansQuery,
    useCreateOfferMutation,
    useUpdateOfferMutation,
    useDeleteOfferMutation,
    useCreatePackageRuleMutation,
    useUpdatePackageRuleMutation,
    useDeletePackageRuleMutation,
} from "@/state/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface LibraryPromotionsProps {
    libraryId: string;
}

const SLOT_POOLS = ["MORNING", "AFTERNOON", "EVENING", "NIGHT"];

export default function LibraryPromotions({ libraryId }: LibraryPromotionsProps) {
    const [activeSection, setActiveSection] = useState<"offers" | "rules">("offers");

    // Data Fetching
    const { data: plans } = useGetPlansQuery(libraryId);
    const { data: offers, isLoading: isLoadingOffers } = useGetOffersQuery(libraryId);
    const { data: rules, isLoading: isLoadingRules } = useGetPackageRulesByLibraryIdQuery(libraryId);

    // Mutations
    const [createOffer, { isLoading: isCreatingOffer }] = useCreateOfferMutation();
    const [updateOffer, { isLoading: isUpdatingOffer }] = useUpdateOfferMutation();
    const [deleteOffer] = useDeleteOfferMutation();
    const [createRule, { isLoading: isCreatingRule }] = useCreatePackageRuleMutation();
    const [updateRule, { isLoading: isUpdatingRule }] = useUpdatePackageRuleMutation();
    const [deleteRule] = useDeletePackageRuleMutation();

    // Dialog States
    const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
    const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form States
    const [offerForm, setOfferForm] = useState({
        title: "",
        couponCode: "",
        discountType: "%",
        discountValue: "",
        maxDiscount: "",
        validFrom: "",
        validTo: "",
        planIds: [] as string[],
        isForNewUsers: false,
        isOncePerUser: false,
    });

    const [ruleForm, setRuleForm] = useState({
        planId: "",
        months: 4,
        percentOff: 0,
    });

    const handleOpenOfferDialog = (item: any = null) => {
        if (item) {
            setEditingItem(item);
            setOfferForm({
                title: item.title,
                couponCode: item.couponCode || "",
                discountType: item.discountPct ? "%" : "Flat",
                discountValue: (item.discountPct || item.flatAmount || "").toString(),
                maxDiscount: (item.maxDiscount || "").toString(),
                validFrom: item.validFrom ? new Date(item.validFrom).toISOString().split("T")[0] : "",
                validTo: item.validTo ? new Date(item.validTo).toISOString().split("T")[0] : "",
                planIds: item.planIds || [],
                isForNewUsers: item.newUsersOnly || false,
                isOncePerUser: item.oncePerUser || false,
            });
        } else {
            setEditingItem(null);
            setOfferForm({
                title: "",
                couponCode: "",
                discountType: "%",
                discountValue: "",
                maxDiscount: "",
                validFrom: "",
                validTo: "",
                planIds: [],
                isForNewUsers: false,
                isOncePerUser: false,
            });
        }
        setIsOfferDialogOpen(true);
    };

    const handleOpenRuleDialog = (item: any = null) => {
        if (item) {
            setEditingItem(item);
            setRuleForm({
                planId: item.planId,
                months: item.months,
                percentOff: item.percentOff,
            });
        } else {
            setEditingItem(null);
            setRuleForm({
                planId: "",
                months: 4,
                percentOff: 0,
            });
        }
        setIsRuleDialogOpen(true);
    };

    const handleSaveOffer = async () => {
        try {
            if (!offerForm.title) {
                toast.error("Offer title is required");
                return;
            }

            const payload: any = {
                libraryId,
                title: offerForm.title,
                couponCode: offerForm.couponCode,
                maxDiscount: offerForm.maxDiscount ? parseFloat(offerForm.maxDiscount) : undefined,
                validFrom: offerForm.validFrom ? new Date(offerForm.validFrom).toISOString() : undefined,
                validTo: offerForm.validTo ? new Date(offerForm.validTo).toISOString() : undefined,
                planIds: offerForm.planIds,
                newUsersOnly: offerForm.isForNewUsers,
                oncePerUser: offerForm.isOncePerUser,
            };

            if (offerForm.discountType === "%") {
                payload.discountPct = parseFloat(offerForm.discountValue);
            } else {
                payload.flatAmount = parseFloat(offerForm.discountValue);
            }

            if (editingItem) {
                await updateOffer({ id: editingItem.id, data: payload }).unwrap();
                toast.success("Offer updated successfully");
            } else {
                await createOffer(payload).unwrap();
                toast.success("Offer created successfully");
            }
            setIsOfferDialogOpen(false);
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to save offer");
        }
    };

    const handleSaveRule = async () => {
        try {
            if (!ruleForm.planId) {
                toast.error("Please select a base plan");
                return;
            }

            const payload = {
                libraryId,
                planId: ruleForm.planId,
                months: ruleForm.months,
                percentOff: ruleForm.percentOff,
            };

            if (editingItem) {
                await updateRule({ id: editingItem.id, data: payload }).unwrap();
                toast.success("Package rule updated successfully");
            } else {
                await createRule(payload).unwrap();
                toast.success("Package rule created successfully");
            }
            setIsRuleDialogOpen(false);
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to save rule");
        }
    };

    const handleDeleteOffer = async (id: string) => {
        if (!confirm("Are you sure you want to delete this offer?")) return;
        try {
            await deleteOffer(id).unwrap();
            toast.success("Offer deleted");
        } catch (err: any) {
            toast.error("Failed to delete offer");
        }
    };

    const handleDeleteRule = async (id: string) => {
        if (!confirm("Are you sure you want to delete this rule?")) return;
        try {
            await deleteRule(id).unwrap();
            toast.success("Rule deleted");
        } catch (err: any) {
            toast.error("Failed to delete rule");
        }
    };

    const renderOffers = () => (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Promotions</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{offers?.length || 0} active coupons</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenOfferDialog()} className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100">
                    <Plus className="w-4 h-4" /> New Offer
                </Button>
            </div>

            {isLoadingOffers ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2].map(i => <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-[2.5rem]" />)}
                </div>
            ) : !offers || offers.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-16 text-center">
                    <div className="h-20 w-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Gift className="h-10 w-10 text-gray-200" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">No active offers</h4>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm">Create discounts and seasonal coupons to attract new library members.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer: any) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={offer.id}
                            className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                                <Ticket className="h-32 w-32 -rotate-12" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                        {offer.couponCode || "Automatic"}
                                    </Badge>
                                    <div className="flex gap-1">
                                        <Button onClick={() => handleOpenOfferDialog(offer)} variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => handleDeleteOffer(offer.id)} variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <h4 className="text-xl font-black text-gray-900 leading-tight mb-2">{offer.title}</h4>
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-4xl font-black text-indigo-600 tracking-tighter">
                                        {offer.discountPct ? `${offer.discountPct}%` : `₹${offer.flatAmount}`}
                                    </span>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">OFF</span>
                                </div>

                                <div className="mt-auto space-y-4">
                                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-bold">
                                            <span className="text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3" /> Validity
                                            </span>
                                            <span className="text-gray-700">
                                                {offer.validFrom ? new Date(offer.validFrom).toLocaleDateString() : "Anytime"} - {offer.validTo ? new Date(offer.validTo).toLocaleDateString() : "Forever"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-bold">
                                            <span className="text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <ShieldCheck className="h-3 w-3" /> Audience
                                            </span>
                                            <span className="text-gray-700">{offer.newUsersOnly ? "New Users" : "Everyone"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderRules = () => (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Package Savings</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{rules?.length || 0} bundle rules</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenRuleDialog()} className="h-11 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-100">
                    <Plus className="w-4 h-4" /> New Rule
                </Button>
            </div>

            {isLoadingRules ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2].map(i => <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-[2.5rem]" />)}
                </div>
            ) : !rules || rules.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-16 text-center">
                    <div className="h-20 w-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Zap className="h-10 w-10 text-gray-200" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">No package rules</h4>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto text-sm">Offer discounts for long-term bookings (e.g. 10% off for 4 months).</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rules.map((rule: any) => {
                        const plan = plans?.find((p: any) => p.id === rule.planId);
                        return (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={rule.id}
                                className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900 leading-tight mb-1">{plan?.planName || "General Plan"}</h4>
                                        <Badge variant="outline" className="text-[8px] h-4 rounded-md uppercase font-black tracking-widest border-amber-100 text-amber-600">
                                            {rule.months} Months Bundle
                                        </Badge>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button onClick={() => handleOpenRuleDialog(rule)} variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-amber-600 hover:bg-amber-50">
                                            <Edit3 className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => handleDeleteRule(rule.id)} variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-5 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                                    <div className="h-10 w-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black">
                                        <Percent className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-gray-900 tracking-tighter">{rule.percentOff}% Discount</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Automatic Application</div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Promotion Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-fit border border-gray-200/50 mx-auto sm:mx-0">
                <button
                    onClick={() => setActiveSection("offers")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300",
                        activeSection === "offers" ? "bg-white text-indigo-600 shadow-md ring-1 ring-gray-200" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <Ticket className="h-3.5 w-3.5" /> Coupons
                </button>
                <button
                    onClick={() => setActiveSection("rules")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300",
                        activeSection === "rules" ? "bg-white text-amber-600 shadow-md ring-1 ring-gray-200" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <Zap className="h-3.5 w-3.5" /> Bundle Rules
                </button>
            </div>

            <div className="min-h-[400px]">
                {activeSection === "offers" ? renderOffers() : renderRules()}
            </div>            {/* Offer Dialog */}
            <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
                <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] rounded-[23px] sm:rounded-[23px] p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none flex flex-col">
                    <div className="bg-indigo-600 p-6 sm:p-8 text-white relative shrink-0">
                        <Sparkles className="absolute top-4 right-4 h-16 sm:h-24 w-16 sm:w-24 opacity-10 -rotate-12" />
                        <DialogHeader>
                            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter">
                                {editingItem ? "Refine Promotion" : "New Offer"}
                            </DialogTitle>
                            <DialogDescription className="text-indigo-100 font-medium text-xs sm:text-sm">
                                Configure your promotional discount to boost library engagement.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-5 sm:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Offer Title</Label>
                                <Input
                                    value={offerForm.title}
                                    onChange={e => setOfferForm({ ...offerForm, title: e.target.value })}
                                    placeholder="e.g. Festival Special 2026"
                                    className="h-11 sm:h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Coupon Code</Label>
                                <Input
                                    value={offerForm.couponCode}
                                    onChange={e => setOfferForm({ ...offerForm, couponCode: e.target.value.toUpperCase() })}
                                    placeholder="DIWALI2026"
                                    className="h-11 sm:h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Type</Label>
                                <select
                                    value={offerForm.discountType}
                                    onChange={e => setOfferForm({ ...offerForm, discountType: e.target.value })}
                                    className="w-full h-11 sm:h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none"
                                >
                                    <option value="%">Percentage (%)</option>
                                    <option value="Flat">Flat Amount (₹)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Value</Label>
                                <Input
                                    type="number"
                                    value={offerForm.discountValue}
                                    onChange={e => setOfferForm({ ...offerForm, discountValue: e.target.value })}
                                    placeholder="20"
                                    className="h-11 sm:h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Max Discount</Label>
                                <Input
                                    type="number"
                                    value={offerForm.maxDiscount}
                                    onChange={e => setOfferForm({ ...offerForm, maxDiscount: e.target.value })}
                                    placeholder="500"
                                    className="h-11 sm:h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Valid From</Label>
                                <Input
                                    type="date"
                                    value={offerForm.validFrom}
                                    onChange={e => setOfferForm({ ...offerForm, validFrom: e.target.value })}
                                    className="h-11 sm:h-12 rounded-xl border-gray-100 bg-gray-50 font-bold text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Valid To</Label>
                                <Input
                                    type="date"
                                    value={offerForm.validTo}
                                    onChange={e => setOfferForm({ ...offerForm, validTo: e.target.value })}
                                    className="h-11 sm:h-12 rounded-xl border-gray-100 bg-gray-50 font-bold text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Applicable Plans</Label>
                            <div className="flex flex-wrap gap-2">
                                {plans?.map((plan: any) => (
                                    <button
                                        key={plan.id}
                                        onClick={() => {
                                            const updated = offerForm.planIds.includes(plan.id)
                                                ? offerForm.planIds.filter(id => id !== plan.id)
                                                : [...offerForm.planIds, plan.id];
                                            setOfferForm({ ...offerForm, planIds: updated });
                                        }}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                            offerForm.planIds.includes(plan.id)
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100"
                                                : "bg-white border-gray-100 text-gray-400 hover:border-indigo-200"
                                        )}
                                    >
                                        {plan.planName}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 pt-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-900">New Users Only</div>
                                    <div className="text-[9px] font-medium text-gray-400">Limit to first-time bookings</div>
                                </div>
                                <Switch
                                    checked={offerForm.isForNewUsers}
                                    onCheckedChange={v => setOfferForm({ ...offerForm, isForNewUsers: v })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="space-y-0.5">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-900">One Time Only</div>
                                    <div className="text-[9px] font-medium text-gray-400">Limit to 1 use per student</div>
                                </div>
                                <Switch
                                    checked={offerForm.isOncePerUser}
                                    onCheckedChange={v => setOfferForm({ ...offerForm, isOncePerUser: v })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                        <Button variant="ghost" onClick={() => setIsOfferDialogOpen(false)} disabled={isCreatingOffer || isUpdatingOffer} className="h-11 sm:h-12 px-8 rounded-xl font-bold text-gray-500 order-2 sm:order-1">Cancel</Button>
                        <Button onClick={handleSaveOffer} disabled={isCreatingOffer || isUpdatingOffer} className="h-11 sm:h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100 order-1 sm:order-2">
                            {(isCreatingOffer || isUpdatingOffer) ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {editingItem ? "Update Promotion" : "Deploy Offer"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rule Dialog */}
            <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
                <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] rounded-[23px] sm:rounded-[23px] p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none flex flex-col">
                    <div className="bg-amber-600 p-6 sm:p-8 text-white relative shrink-0">
                        <Zap className="absolute top-4 right-4 h-16 sm:h-20 w-16 sm:w-20 opacity-10 rotate-12" />
                        <DialogHeader>
                            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tighter">
                                {editingItem ? "Modify Bundle" : "Bundle Discount"}
                            </DialogTitle>
                            <DialogDescription className="text-amber-100 font-medium text-xs sm:text-sm">
                                Incentivize long-term commitments with smart bundle pricing.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Base Subscription</Label>
                            <select
                                value={ruleForm.planId}
                                onChange={e => setRuleForm({ ...ruleForm, planId: e.target.value })}
                                className="w-full h-11 sm:h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 font-bold text-sm outline-none appearance-none"
                            >
                                <option value="">Select Plan</option>
                                {plans?.map((p: any) => <option key={p.id} value={p.id}>{p.planName}</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Term (Months)</Label>
                                <select
                                    value={ruleForm.months}
                                    onChange={e => setRuleForm({ ...ruleForm, months: parseInt(e.target.value) || 1 })}
                                    className="w-full h-11 sm:h-12 rounded-xl border border-gray-100 bg-gray-50 px-4 font-bold text-sm outline-none appearance-none"
                                >
                                    {[1, 3, 4, 6, 12].map(m => <option key={m} value={m}>{m} Months</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Discount %</Label>
                                <Input
                                    type="number"
                                    value={ruleForm.percentOff}
                                    onChange={e => {
                                        const val = parseInt(e.target.value);
                                        setRuleForm({ ...ruleForm, percentOff: isNaN(val) ? 0 : val });
                                    }}
                                    className="h-11 sm:h-12 rounded-xl border-gray-100 bg-gray-50 font-bold text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                        <Button variant="ghost" onClick={() => setIsRuleDialogOpen(false)} disabled={isCreatingRule || isUpdatingRule} className="h-11 sm:h-12 px-8 rounded-xl font-bold text-gray-500 order-2 sm:order-1">Cancel</Button>
                        <Button onClick={handleSaveRule} disabled={isCreatingRule || isUpdatingRule} className="h-12 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-100 order-1 sm:order-2">
                            {(isCreatingRule || isUpdatingRule) ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {editingItem ? "Update Bundle" : "Apply Rule"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
