"use client";

import React, { useState, useMemo } from "react";
import {
    Clock,
    Plus,
    Edit3,
    Trash2,
    ArrowUpRight,
    Sparkles,
    Loader2,
    Calendar,
    LayoutGrid,
    CheckCircle2,
    Layers,
    Tag,
    ChevronRight,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    useGetSlotsByLibraryIdQuery,
    useGetSlotConfigsByLibraryIdQuery,
    useCreateSlotMutation,
    useUpdateSlotMutation,
    useDeleteSlotMutation,
    useCreateSlotConfigMutation,
    useUpdateSlotConfigMutation,
    useDeleteSlotConfigMutation,
    useAddSlotsToConfigMutation
} from "@/state/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface LibraryShiftsProps {
    libraryId: string;
}

export default function LibraryShifts({ libraryId }: LibraryShiftsProps) {
    const [activeSection, setActiveSection] = useState<"slots" | "configs">("slots");

    // Data Fetching
    const { data: slotsRes, isLoading: isLoadingSlots } = useGetSlotsByLibraryIdQuery(libraryId);
    const { data: configsRes, isLoading: isLoadingConfigs } = useGetSlotConfigsByLibraryIdQuery(libraryId);

    const slots = slotsRes?.data || [];
    const configs = configsRes?.data || [];

    // Mutations
    const [createSlot, { isLoading: isCreatingSlot }] = useCreateSlotMutation();
    const [updateSlot, { isLoading: isUpdatingSlot }] = useUpdateSlotMutation();
    const [deleteSlot] = useDeleteSlotMutation();
    const [createConfig, { isLoading: isCreatingConfig }] = useCreateSlotConfigMutation();
    const [updateConfig, { isLoading: isUpdatingConfig }] = useUpdateSlotConfigMutation();
    const [deleteConfig] = useDeleteSlotConfigMutation();
    const [addSlotsToConfig, { isLoading: isAddingSlots }] = useAddSlotsToConfigMutation();

    // Dialog States
    const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false);
    const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Form States
    const [slotForm, setSlotForm] = useState({
        tag: "",
        startTime: "06:00",
        endTime: "12:00",
    });

    const [configForm, setConfigForm] = useState({
        name: "",
        selectedSlotIds: [] as string[],
    });

    // Handlers
    const handleOpenSlotDialog = (item: any = null) => {
        if (item) {
            setEditingItem(item);
            setSlotForm({
                tag: item.tag,
                startTime: item.startTime,
                endTime: item.endTime,
            });
        } else {
            setEditingItem(null);
            setSlotForm({ tag: "", startTime: "06:00", endTime: "12:00" });
        }
        setIsSlotDialogOpen(true);
    };

    const handleOpenConfigDialog = (item: any = null) => {
        if (item) {
            setEditingItem(item);
            // Map linked slots if available in the config object
            const slotIds = item.slots?.map((s: any) => s.id) || [];
            setConfigForm({
                name: item.name,
                selectedSlotIds: slotIds,
            });
        } else {
            setEditingItem(null);
            setConfigForm({ name: "", selectedSlotIds: [] });
        }
        setIsConfigDialogOpen(true);
    };

    const handleSaveSlot = async () => {
        try {
            if (!slotForm.tag) {
                toast.error("Shift tag is required (e.g. Morning)");
                return;
            }

            if (editingItem) {
                await updateSlot({ id: editingItem.id, data: slotForm }).unwrap();
                toast.success("Shift updated successfully");
            } else {
                await createSlot({ libraryId, ...slotForm }).unwrap();
                toast.success("New shift window created");
            }
            setIsSlotDialogOpen(false);
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to save shift");
        }
    };

    const handleSaveConfig = async () => {
        try {
            if (!configForm.name) {
                toast.error("Configuration name is required");
                return;
            }

            let configId = editingItem?.id;

            if (editingItem) {
                await updateConfig({ id: editingItem.id, data: { name: configForm.name, libraryId } }).unwrap();
                toast.success("Configuration updated");
            } else {
                const res = await createConfig({ libraryId, name: configForm.name }).unwrap();
                configId = res.data.id;
                toast.success("New configuration created");
            }

            // Sync slot associations if changed
            if (configId && configForm.selectedSlotIds.length > 0) {
                await addSlotsToConfig({
                    configId,
                    slotIds: configForm.selectedSlotIds
                }).unwrap();
            }

            setIsConfigDialogOpen(false);
        } catch (err: any) {
            toast.error(err.data?.message || "Failed to save configuration");
        }
    };

    const handleDeleteSlot = async (id: string) => {
        if (!confirm("Delete this master shift? This may affect linked configurations.")) return;
        try {
            await deleteSlot(id).unwrap();
            toast.success("Shift deleted");
        } catch (err: any) {
            toast.error("Failed to delete shift");
        }
    };

    const handleDeleteConfig = async (id: string) => {
        if (!confirm("Delete this shift configuration?")) return;
        try {
            await deleteConfig(id).unwrap();
            toast.success("Configuration deleted");
        } catch (err: any) {
            toast.error("Failed to delete configuration");
        }
    };

    const renderSlots = () => (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm border border-amber-100">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Master Shifts</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{slots.length} raw time windows</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenSlotDialog()} className="h-11 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-100 transition-all hover:scale-[1.02]">
                    <Plus className="w-4 h-4" /> New Window
                </Button>
            </div>

            {isLoadingSlots ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-[2.5rem]" />)}
                </div>
            ) : slots.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-16 text-center">
                    <Clock className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-gray-900">No shifts defined</h4>
                    <p className="text-gray-500 text-sm mt-2">Define your library's raw operational hours first.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {slots.map((slot: any) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={slot.id}
                            className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-7 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <Badge className="bg-amber-50 text-amber-600 border-amber-100 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                    {slot.tag} Window
                                </Badge>
                                <div className="flex gap-1">
                                    <Button onClick={() => handleOpenSlotDialog(slot)} variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-amber-600 hover:bg-amber-50">
                                        <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={() => handleDeleteSlot(slot.id)} variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="text-3xl font-black text-gray-900 tracking-tighter">
                                    {slot.startTime}
                                </div>
                                <ArrowUpRight className="h-6 w-6 text-gray-200 group-hover:text-amber-500 transition-colors" />
                                <div className="text-3xl font-black text-gray-900 tracking-tighter">
                                    {slot.endTime}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderConfigs = () => (
        <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100">
                        <Layers className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Shift Patterns</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{configs.length} active configurations</p>
                    </div>
                </div>
                <Button onClick={() => handleOpenConfigDialog()} className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02]">
                    <Plus className="w-4 h-4" /> New Pattern
                </Button>
            </div>

            {isLoadingConfigs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-[2.5rem]" />)}
                </div>
            ) : configs.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-16 text-center">
                    <Layers className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-gray-900">No patterns created</h4>
                    <p className="text-gray-500 text-sm mt-2">Combine master shifts to create booking options (e.g. "Full Day", "Standard Shift").</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {configs.map((config: any) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={config.id}
                            className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-xl font-black text-gray-900 tracking-tight">{config.name}</h4>
                                <div className="flex gap-1">
                                    <Button onClick={() => handleOpenConfigDialog(config)} variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50">
                                        <Edit3 className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={() => handleDeleteConfig(config.id)} variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-auto">
                                {config.slots?.length > 0 ? (
                                    config.slots.map((s: any) => (
                                        <Badge key={s.id} variant="outline" className="bg-gray-50 border-gray-100 text-[8px] font-black uppercase tracking-widest px-2 py-1">
                                            {s.tag} ({s.startTime}-{s.endTime})
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-[10px] font-bold text-gray-300 italic">No windows linked</span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-1000">
            {/* Toggle Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-fit border border-gray-200/50 mx-auto sm:mx-0">
                <button
                    onClick={() => setActiveSection("slots")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300",
                        activeSection === "slots" ? "bg-white text-amber-600 shadow-md ring-1 ring-gray-200" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <Clock className="h-3.5 w-3.5" /> Windows
                </button>
                <button
                    onClick={() => setActiveSection("configs")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-300",
                        activeSection === "configs" ? "bg-white text-indigo-600 shadow-md ring-1 ring-gray-200" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <Layers className="h-3.5 w-3.5" /> Patterns
                </button>
            </div>

            <div className="min-h-[400px]">
                {activeSection === "slots" ? renderSlots() : renderConfigs()}
            </div>

            {/* Slot Dialog */}
            <Dialog open={isSlotDialogOpen} onOpenChange={setIsSlotDialogOpen}>
                <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] rounded-[2rem] sm:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none flex flex-col">
                    <div className="bg-amber-600 p-8 sm:p-10 text-white relative shrink-0">
                        <Sparkles className="absolute top-4 right-4 h-20 sm:h-24 w-20 sm:w-24 opacity-10 rotate-12" />
                        <DialogHeader>
                            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter">
                                {editingItem ? "Refine Window" : "New Time Window"}
                            </DialogTitle>
                            <DialogDescription className="text-amber-100 font-medium">
                                Define a specific operational shift window.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 sm:p-10 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Shift Tag</Label>
                            <Input
                                value={slotForm.tag}
                                onChange={e => setSlotForm({ ...slotForm, tag: e.target.value })}
                                placeholder="e.g. Morning, Early Bird"
                                className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm px-5"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Start Time</Label>
                                <Input
                                    type="time"
                                    value={slotForm.startTime}
                                    onChange={e => setSlotForm({ ...slotForm, startTime: e.target.value })}
                                    className="h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold text-sm px-5"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">End Time</Label>
                                <Input
                                    type="time"
                                    value={slotForm.endTime}
                                    onChange={e => setSlotForm({ ...slotForm, endTime: e.target.value })}
                                    className="h-14 rounded-2xl border-gray-100 bg-gray-50 font-bold text-sm px-5"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 sm:p-10 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                        <Button variant="ghost" onClick={() => setIsSlotDialogOpen(false)} disabled={isCreatingSlot || isUpdatingSlot} className="h-12 px-8 rounded-2xl font-bold text-gray-500 order-2 sm:order-1">Cancel</Button>
                        <Button onClick={handleSaveSlot} disabled={isCreatingSlot || isUpdatingSlot} className="h-12 px-10 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-lg shadow-amber-100 order-1 sm:order-2">
                            {(isCreatingSlot || isUpdatingSlot) ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {editingItem ? "Update Shift" : "Create Shift"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Config Dialog */}
            <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
                <DialogContent className="w-[95vw] sm:max-w-xl max-h-[90vh] rounded-[2rem] sm:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white focus:outline-none flex flex-col">
                    <div className="bg-indigo-600 p-8 sm:p-10 text-white relative shrink-0">
                        <Sparkles className="absolute top-4 right-4 h-20 sm:h-24 w-20 sm:w-24 opacity-10 -rotate-12" />
                        <DialogHeader>
                            <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tighter">
                                {editingItem ? "Update Pattern" : "Compose Pattern"}
                            </DialogTitle>
                            <DialogDescription className="text-indigo-100 font-medium">
                                Group shifts to create a logical schedule option.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 sm:p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Pattern Name</Label>
                            <Input
                                value={configForm.name}
                                onChange={e => setConfigForm({ ...configForm, name: e.target.value })}
                                placeholder="e.g. Standard Full Day, Professional Shift"
                                className="h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold text-sm px-5"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Included Windows</Label>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{configForm.selectedSlotIds.length} Selected</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {slots.map((slot: any) => (
                                    <button
                                        key={slot.id}
                                        onClick={() => {
                                            const updated = configForm.selectedSlotIds.includes(slot.id)
                                                ? configForm.selectedSlotIds.filter(id => id !== slot.id)
                                                : [...configForm.selectedSlotIds, slot.id];
                                            setConfigForm({ ...configForm, selectedSlotIds: updated });
                                        }}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                                            configForm.selectedSlotIds.includes(slot.id)
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]"
                                                : "bg-white border-gray-100 text-gray-400 hover:border-indigo-200"
                                        )}
                                    >
                                        <div className="text-left">
                                            <div className={cn("text-[10px] font-black uppercase tracking-widest", configForm.selectedSlotIds.includes(slot.id) ? "text-indigo-100" : "text-gray-900")}>
                                                {slot.tag}
                                            </div>
                                            <div className={cn("text-[9px] font-bold", configForm.selectedSlotIds.includes(slot.id) ? "text-indigo-200" : "text-gray-400")}>
                                                {slot.startTime} - {slot.endTime}
                                            </div>
                                        </div>
                                        {configForm.selectedSlotIds.includes(slot.id) && <CheckCircle2 className="h-5 w-5 text-white" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 sm:p-10 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                        <Button variant="ghost" onClick={() => setIsConfigDialogOpen(false)} disabled={isCreatingConfig || isUpdatingConfig || isAddingSlots} className="h-12 px-8 rounded-2xl font-bold text-gray-500 order-2 sm:order-1">Cancel</Button>
                        <Button onClick={handleSaveConfig} disabled={isCreatingConfig || isUpdatingConfig || isAddingSlots} className="h-12 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100 order-1 sm:order-2">
                            {(isCreatingConfig || isUpdatingConfig || isAddingSlots) ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {editingItem ? "Update Pattern" : "Activate Pattern"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
