'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useCreateSlotConfigMutation, useAddSlotsToConfigMutation, useCreatePlanMutation, useCreateLockerMutation, useConfigureSeatRangesMutation, useCreatePackageRuleMutation, useCreateOfferMutation, useCreateSlotMutation } from '../../state/api';
import { Label } from '../ui/label';
import { TabButton } from '../ui/tabButton';
import { Input } from '../ui/input';

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select
        className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

        {...props}
    >
        {children}
    </select>
);

const Checkbox = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div className="flex items-center">
        <input
            type="checkbox"
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            {...props}
        />
        <label htmlFor={props.id} className="ml-2 block text-sm text-gray-900">{label}</label>
    </div>
);

// Define the shape of the complex local state (same as parent's formData.pricingData)
interface PricingData {
    masterSlots: any[];
    slotConfigs: any[];
    plans: any[];
    lockers: any[];
    seatConfigurations: any[];
    packageRules: any[];
    offers: any[];
    submittedTabs: string[];
}

// Initial state for the complex objects (for local component use)
const initialPricingData: PricingData = {
    masterSlots: [{ id: 1, dbId: '', tag: 'Morning', startTime: '06:00', endTime: '12:00' }],
    slotConfigs: [{ id: 1, dbId: '', name: 'Standard Shifts', slotIds: [] }],
    plans: [{ id: 1, dbId: '', planName: '', hours: '', planType: 'Fixed', slotIds: [], slotPools: [], monthlyFee: '', description: '' }],
    seatConfigurations: [{ id: 1, seatNumbers: '', seatType: 'Float', attachLocker: false, lockerTypeId: '', applicablePlanIds: [] }],
    lockers: [{ id: 1, dbId: '', lockerType: 'Standard', numberOfLockers: '', charge: '', description: '' }],
    packageRules: [{ id: 1, planId: '', duration: 4, discount: '0' }],
    offers: [{ id: 1, title: '', couponCode: '', discountType: '%', discountValue: '', maxDiscount: '', validFrom: '', validTo: '', slotPools: [], planIds: [], isForNewUsers: false, isOncePerUser: false }],
    submittedTabs: [],
};


type FormProps = {
    libraryId: string;
    isReadOnly: boolean;
    setCurrentStep: Dispatch<SetStateAction<number>>;
    onSuccess: (data: any) => void;
    // NEW PROPS
    formData: { pricingData: PricingData } & Record<string, any>; // Assumes complex data is nested
    updateFormData: (data: Partial<FormProps['formData']>) => void;
};

const SLOT_POOLS = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];
const tabOrder = ['timeslot', 'plan', 'locker', 'seat', 'package', 'offer'];

export default function PlansAndPricingForm({ libraryId, isReadOnly, setCurrentStep, onSuccess, formData, updateFormData }: FormProps) {

    // --- LOCAL STATE INITIALIZATION (FROM PERSISTED DATA) ---
    const initialLocalData = formData.pricingData || initialPricingData;

    const [activeTab, setActiveTab] = useState(initialLocalData.submittedTabs.slice(-1)[0] || 'timeslot');
    const [submittedTabs, setSubmittedTabs] = useState(initialLocalData.submittedTabs);

    const [masterSlots, setMasterSlots] = useState(initialLocalData.masterSlots || initialPricingData.masterSlots);
    const [slotConfigs, setSlotConfigs] = useState(initialLocalData.slotConfigs);
    const [plans, setPlans] = useState(initialLocalData.plans);
    const [seatConfigurations, setSeatConfigurations] = useState(initialLocalData.seatConfigurations);
    const [lockers, setLockers] = useState(initialLocalData.lockers);
    const [packageRules, setPackageRules] = useState(initialLocalData.packageRules);
    const [offers, setOffers] = useState(initialLocalData.offers);

    const [slotErrors, setSlotErrors] = useState<{ [id: string]: string }>({});

    const [createSlot, { isLoading: isCreatingSlot }] = useCreateSlotMutation();
    const [createSlotConfig, { isLoading: isCreatingSlotConfig }] = useCreateSlotConfigMutation();
    const [addSlotsToConfig, { isLoading: isAddingSlots }] = useAddSlotsToConfigMutation();

    const [createPlan, { isLoading: isCreatingPlan }] = useCreatePlanMutation();
    const [createLocker, { isLoading: isCreatingLocker }] = useCreateLockerMutation();
    const [configureSeatRanges, { isLoading: isConfiguringSeats }] = useConfigureSeatRangesMutation();
    const [createPackageRule, { isLoading: isCreatingPackageRule }] = useCreatePackageRuleMutation();
    const [createOffer, { isLoading: isCreatingOffer }] = useCreateOfferMutation();

    const isSubmitting = isCreatingSlot || isCreatingSlotConfig || isAddingSlots || isCreatingPlan || isCreatingLocker || isConfiguringSeats || isCreatingPackageRule || isCreatingOffer;
    const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error'>('idle');


    // --- SIDE EFFECT FOR PERSISTENCE ---
    useEffect(() => {
        const timer = setTimeout(() => {
            updateFormData({
                pricingData: {
                    masterSlots,
                    slotConfigs,
                    plans,
                    lockers,
                    seatConfigurations,
                    packageRules,
                    offers,
                    submittedTabs,
                }
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [slotConfigs, plans, lockers, seatConfigurations, packageRules, offers, submittedTabs]);
    // --- END SIDE EFFECT ---


    const addState = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, initialState: Omit<T, 'id'>) => {
        setter(prev => [...prev, { id: (prev.length > 0 ? Math.max(...prev.map((p: any) => p.id)) : 0) + 1, ...initialState } as T]);
    };
    const updateState = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: number, field: keyof T, value: any) => {
        setter(prev => prev.map(item => (item as any).id === id ? { ...item, [field]: value } : item));
    };
    const updateCheckboxState = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: number, field: keyof T, value: string, checked: boolean) => {
        setter(prev => prev.map(item => {
            if ((item as any).id === id) {
                const currentPools = (item[field] as string[]) || [];
                const newPools = checked ? [...currentPools, value] : currentPools.filter(pool => pool !== value);
                return { ...item, [field]: newPools };
            }
            return item;
        }));
    };
    const removeState = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, id: number) => {
        setter(prev => prev.length > 1 ? prev.filter(item => (item as any).id !== id) : prev);
    };


    const toMinutes = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
    };

    const calculateHours = (start: string, end: string) => {
        if (!start || !end) return '';
        const startTime = new Date(`1970-01-01T${start}:00`);
        const endTime = new Date(`1970-01-01T${end}:00`);
        let diff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        if (diff < 0) diff += 24;
        return diff.toFixed(2);
    };

    const sanitizePercentOff = (value: string | number): number => {
        const num = Number(value);
        if (isNaN(num)) return 0;
        const rounded = Math.round(num);
        return Math.max(0, Math.min(100, rounded));
    };


    const handlePlanSelectionChange = <T extends { planIds: string[] } | { applicablePlanIds: string[] }>(
        setter: React.Dispatch<React.SetStateAction<T[]>>,
        itemId: number,
        planId: string,
        isChecked: boolean
    ) => {
        setter(prevItems =>
            prevItems.map(item => {
                if ((item as any).id === itemId) {
                    const key = ('planIds' in item) ? 'planIds' : 'applicablePlanIds';
                    const currentPlanIds = (item as any)[key] || [];

                    const newPlanIds = isChecked
                        ? [...currentPlanIds, planId]
                        : currentPlanIds.filter((id: string) => id !== planId);

                    return { ...item, [key]: newPlanIds };
                }
                return item;
            })
        );
    };

    const handleNext = () => {
        setCurrentStep(4);
    }

    // --- SUBMISSION LOGIC ---
    const submitSlotConfigs = async () => {
        setApiStatus('idle');

        // Filter out empty master slots
        const validMasterSlots = masterSlots.filter(s => s.tag.trim() !== '');

        // Filter out empty slot configurations
        const validConfigs = slotConfigs.filter(c =>
            c.name.trim() !== '' && (c.slotIds || []).length > 0
        );

        if (validMasterSlots.length === 0 || validConfigs.length === 0) {
            console.warn("No valid master slots or configurations to submit.");
            setApiStatus('error');
            return false;
        }

        try {
            // 1. Submit Master Slots first to get their UUIDs
            const slotResults = await Promise.all(
                validMasterSlots.map(async (slot) => {
                    const res = await createSlot({
                        libraryId,
                        tag: slot.tag,
                        startTime: slot.startTime,
                        endTime: slot.endTime
                    }).unwrap();
                    return { localId: slot.id, dbId: res.data.id };
                })
            );

            const masterSlotMapping: Record<number, string> = {};
            slotResults.forEach(r => masterSlotMapping[r.localId] = r.dbId);

            // 2. Submit Slot Configurations linking to these UUIDs
            const configResults = await Promise.all(
                validConfigs.map(async (config) => {
                    const configRes = await createSlotConfig({
                        libraryId,
                        name: config.name,
                    }).unwrap();

                    const configId = configRes.data.id;

                    // Link selected master slots to this configuration
                    const selectedDbIds = config.slotIds
                        .map((localId: number) => masterSlotMapping[localId])
                        .filter(Boolean);

                    if (selectedDbIds.length > 0) {
                        await addSlotsToConfig({
                            configId,
                            slotIds: selectedDbIds
                        }).unwrap();
                    }

                    return { dbId: configId, localId: config.id, slotDbIds: selectedDbIds };
                })
            );

            // Also update master slots and configs with their DB IDs for future reference
            setMasterSlots(prev => prev.map(s => {
                const mapping = slotResults.find(r => r.localId === s.id);
                return mapping ? { ...s, dbId: mapping.dbId } : s;
            }));

            setSlotConfigs(prev => prev.map(c => {
                const res = configResults.find(r => r.localId === c.id);
                return res ? { ...c, dbId: res.dbId } : c;
            }));

            setSubmittedTabs(prev => [...prev, 'timeslot']);
            setApiStatus('success');
            return true;
        } catch (error) {
            console.error("Slot configuration error:", error);
            setApiStatus('error');
            return false;
        }
    };

    const submitPlans = async () => {
        setApiStatus('idle');
        const validPlans = plans.filter(p => p.monthlyFee && p.hours && p.planName);
        if (validPlans.length === 0) return true;

        try {
            const results = await Promise.all(
                validPlans.map(p => {
                    // Map local slot IDs to DB UUIDs
                    const dbSlotIds = (p.slotIds || [])
                        .map((localId: number) => {
                            const foundSlot = masterSlots.find(s => s.id === localId);
                            return foundSlot?.dbId;
                        })
                        .filter(Boolean) as string[];

                    return createPlan({
                        libraryId,
                        planName: p.planName,
                        planType: p.planType,
                        price: parseFloat(p.monthlyFee),
                        hours: Math.ceil(parseFloat(p.hours)),
                        slotIds: dbSlotIds,
                        slotPools: p.slotPools,
                        description: p.description
                    }).unwrap();
                })
            );
            // Store database IDs for linking
            setPlans(prev => prev.map((plan) => {
                const resultIndex = validPlans.findIndex(vp => vp.id === plan.id);
                if (resultIndex !== -1 && results[resultIndex]) {
                    const apiResult = results[resultIndex];
                    const dbId = (apiResult as any)?.data?.id || (apiResult as any)?.id || '';
                    return { ...plan, dbId };
                }
                return plan;
            }));
            setApiStatus('success');
            return true;
        } catch (error) {
            console.error("Plan submission error:", error);
            setApiStatus('error');
            return false;
        }
    };

    const submitLockers = async () => {
        const validLockers = lockers.filter(l =>
            l.numberOfLockers.trim() !== '' &&
            l.charge.trim() !== '' &&
            parseInt(l.numberOfLockers) > 0
        );
        if (validLockers.length === 0) {
            console.log("No valid lockers to submit — skipping API call.");
            return true;
        }
        setApiStatus('idle');
        try {
            const results = await Promise.all(
                validLockers.map(l => createLocker({
                    libraryId,
                    lockerType: l.lockerType,
                    numberOfLockers: parseInt(l.numberOfLockers),
                    price: parseFloat(l.charge),
                    description: l.description
                }).unwrap())
            );
            // Store database IDs for linking to seat configurations
            setLockers(prev => prev.map((locker, index) => {
                const resultIndex = validLockers.findIndex(vl => vl.id === locker.id);
                if (resultIndex !== -1 && results[resultIndex]) {
                    return { ...locker, dbId: results[resultIndex]?.data?.id || results[resultIndex]?.id || '' };
                }
                return locker;
            }));
            console.log("Locker submission results:", results);
            setApiStatus('success');
            return true;
        } catch (error) {
            setApiStatus('error');
            return false;
        }
    };

    const submitSeatConfigurations = async () => {
        const validSeatConfigurations = seatConfigurations.filter(sc =>
            sc.seatNumbers.trim() !== '' &&
            sc.seatType.trim() !== ''
        );
        if (validSeatConfigurations.length === 0) {
            console.log("No valid seat configurations to submit — skipping API call.");
            return true;
        }
        setApiStatus('idle');
        try {
            const allRanges = validSeatConfigurations.map(sc => {
                const selectedLocker = lockers.find(l => String(l.id) === sc.lockerTypeId);
                return {
                    seatNumbers: sc.seatNumbers,
                    mode: sc.seatType.toUpperCase() as 'FIXED' | 'FLOAT' | 'SPECIAL',
                    lockerId: selectedLocker?.dbId || undefined
                };
            });

            await configureSeatRanges({
                libraryId,
                ranges: allRanges
            }).unwrap();

            setApiStatus('success');
            return true;
        } catch (error) {
            console.error("Seat configuration error:", error);
            setApiStatus('error');
            return false;
        }
    };

    const submitPackageRules = async () => {
        const validPackageRules = packageRules.filter(pr =>
            pr.planId.trim() !== '' && pr.discount.toString().trim() !== ''
        );
        if (validPackageRules.length === 0) {
            console.log("No valid package rules to submit — skipping API call.");
            return true;
        }
        setApiStatus('idle');
        try {
            const results = await Promise.all(
                validPackageRules.map(pr => {
                    // Resolve plan database ID
                    const selectedPlan = plans.find(p => String(p.id) === pr.planId);
                    return createPackageRule({
                        libraryId,
                        planId: selectedPlan?.dbId || pr.planId,
                        months: pr.duration,
                        percentOff: Math.round(parseFloat(pr.discount) || 0)
                    }).unwrap();
                })
            );
            setApiStatus('success');
            return true;
        } catch (error) {
            setApiStatus('error');
            return false;
        }
    };

    const submitOffers = async () => {
        const validOffers = offers.filter(o =>
            o.title.trim() !== '' ||
            o.couponCode.trim() !== '' ||
            o.discountValue.toString().trim() !== ''
        );
        if (validOffers.length === 0) {
            console.log("No valid offers to submit — skipping API call.");
            return true;
        }
        setApiStatus('idle');
        try {
            const results = await Promise.all(
                validOffers.map(o => {
                    // Resolve plan database IDs
                    const resolvedPlanIds = (o.planIds || []).map((localId: string) => {
                        const selectedPlan = plans.find(p => String(p.id) === localId);
                        return selectedPlan?.dbId || localId;
                    }).filter((id: string) => id); // Filter out empty strings

                    return createOffer({
                        libraryId,
                        title: o.title,
                        couponCode: o.couponCode,
                        discountPct: o.discountType === '%' ? parseFloat(o.discountValue) : undefined,
                        flatAmount: o.discountType === 'Flat' ? parseFloat(o.discountValue) : undefined,
                        maxDiscount: parseFloat(o.maxDiscount) || undefined,
                        validFrom: o.validFrom,
                        validTo: o.validTo,
                        oncePerUser: o.isOncePerUser,
                        newUsersOnly: o.isForNewUsers,
                        planIds: resolvedPlanIds
                    }).unwrap();
                })
            );
            setApiStatus('success');
            return true;
        } catch (error) {
            setApiStatus('error');
            return false;
        }
    };

    const handlePrimaryAction = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (submittedTabs.includes(activeTab)) {
            const currentIndex = tabOrder.indexOf(activeTab);
            if (currentIndex < tabOrder.length - 1) {
                const nextTab = tabOrder[currentIndex + 1];
                setActiveTab(nextTab);
            }
            return;
        }

        if (activeTab === 'timeslot') {
            // Basic validation check for at least one config and slot
            if (slotConfigs.length === 0 || slotConfigs.some(c => (c.slotIds || []).length === 0)) {
                setApiStatus('error');
                return;
            }
        }

        const currentIndex = tabOrder.indexOf(activeTab);
        const isLastTab = currentIndex === tabOrder.length - 1;

        let success = false;
        switch (activeTab) {
            case 'timeslot':
                success = await submitSlotConfigs();
                break;
            case 'plan':
                success = await submitPlans();
                break;
            case 'locker':
                success = await submitLockers();
                break;
            case 'seat':
                success = await submitSeatConfigurations();
                break;
            case 'package':
                success = await submitPackageRules();
                break;
            case 'offer':
                success = await submitOffers();
                break;
        }

        if (success) {
            setSubmittedTabs(prev => [...prev, activeTab]);
            if (isLastTab) {
                // Pass all complex local state arrays back to the parent to signal completion
                onSuccess({ slotConfigs, plans, lockers, seatConfigurations, packageRules, offers });
            } else {
                const nextTab = tabOrder[currentIndex + 1];
                setActiveTab(nextTab);
            }
        }
    };

    const handleSkip = () => {
        const currentIndex = tabOrder.indexOf(activeTab);
        const isLastTab = currentIndex === tabOrder.length - 1;

        if (!isLastTab) {
            const nextTab = tabOrder[currentIndex + 1];
            setActiveTab(nextTab);
        }
    };

    const isLastTab = activeTab === tabOrder[tabOrder.length - 1];


    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Step 4: Plans, Pricing & Seat/Locker Details</h2>
            <p className="text-gray-600 mb-6">Define your library&apos;s structure from time slots to special offers.</p>

            <div className="mb-6">
                <nav className="flex flex-wrap gap-2">
                    <TabButton label="TimeSlot" tabKey="timeslot" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Plan" tabKey="plan" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Locker" tabKey="locker" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Seat" tabKey="seat" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Package Rule" tabKey="package" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton label="Offer" tabKey="offer" activeTab={activeTab} setActiveTab={setActiveTab} />
                </nav>
            </div>

            <div className="space-y-8">
                {activeTab === 'timeslot' && (
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
                        {/* Master Slot Pool Section */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold flex items-center">
                                <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                                Master Slot Pool
                            </h3>
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                                <p className="text-sm text-blue-700">
                                    Define all unique time segments for your library here. You will select these to build shift patterns in the next section.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {masterSlots.map((slot) => (
                                    <div key={slot.id} className="grid md:grid-cols-4 gap-3 p-3 bg-white border rounded-md shadow-sm items-end">
                                        <div>
                                            <Label className="text-xs">Slot Tag / Label</Label>
                                            <Input
                                                value={slot.tag}
                                                onChange={e => updateState(setMasterSlots, slot.id, 'tag', e.target.value)}
                                                placeholder="e.g. Morning Shift"
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Start Time</Label>
                                            <Input
                                                type="time"
                                                value={slot.startTime}
                                                onChange={e => updateState(setMasterSlots, slot.id, 'startTime', e.target.value)}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">End Time</Label>
                                            <Input
                                                type="time"
                                                value={slot.endTime}
                                                onChange={e => updateState(setMasterSlots, slot.id, 'endTime', e.target.value)}
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                        {!isReadOnly && (
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => removeState(setMasterSlots, slot.id)}
                                                    className="text-red-400 hover:text-red-600 p-2"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {!isReadOnly && (
                                    <button
                                        type="button"
                                        onClick={() => addState(setMasterSlots, { tag: '', startTime: '09:00', endTime: '13:00' })}
                                        className="text-indigo-600 text-sm font-medium hover:underline flex items-center"
                                    >
                                        + Add Unique Time Segment
                                    </button>
                                )}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Slot Configurations Section */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold flex items-center">
                                <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                                Slot Configurations (Groups)
                            </h3>
                            <p className="text-sm text-gray-500">Group your master slots into logical shift patterns for plans.</p>

                            {slotConfigs.map((config) => (
                                <div key={config.id} className="p-4 border-2 border-indigo-100 rounded-lg bg-indigo-50/30 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1 mr-4">
                                            <Label>Configuration Name</Label>
                                            <Input
                                                value={config.name}
                                                onChange={e => updateState(setSlotConfigs, config.id, 'name', e.target.value)}
                                                placeholder="e.g., Standard Shifts"
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                        {slotConfigs.length > 1 && !isReadOnly && (
                                            <button type="button" onClick={() => removeState(setSlotConfigs, config.id)} className="text-red-500 hover:text-red-700 font-medium text-sm mt-6">
                                                Remove Group
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-indigo-800 font-medium">Included Segments</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {masterSlots.map(slot => {
                                                const currentIds = config.slotIds || [];
                                                const isSelected = currentIds.includes(slot.id);

                                                // Check if this slot is a candidate for selection (touches current block)
                                                let isSelectable = isReadOnly ? false : true;
                                                if (!isSelected && currentIds.length > 0) {
                                                    const selectedSlots = masterSlots.filter(s => currentIds.includes(s.id));
                                                    const minStart = Math.min(...selectedSlots.map(s => toMinutes(s.startTime)));
                                                    const maxEnd = Math.max(...selectedSlots.map(s => toMinutes(s.endTime)));

                                                    const slotStart = toMinutes(slot.startTime);
                                                    const slotEnd = toMinutes(slot.endTime);

                                                    isSelectable = slotEnd === minStart || slotStart === maxEnd;
                                                }

                                                return (
                                                    <button
                                                        key={slot.id}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isReadOnly) return;

                                                            if (isSelected) {
                                                                // Allow removal only if it's at the start or end of the current chain
                                                                const remainingIds = currentIds.filter((id: number) => id !== slot.id);
                                                                if (remainingIds.length > 0) {
                                                                    const sortedRemaining = masterSlots
                                                                        .filter(s => remainingIds.includes(s.id))
                                                                        .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

                                                                    let isContig = true;
                                                                    for (let i = 0; i < sortedRemaining.length - 1; i++) {
                                                                        if (sortedRemaining[i].endTime !== sortedRemaining[i + 1].startTime) {
                                                                            isContig = false;
                                                                            break;
                                                                        }
                                                                    }

                                                                    if (!isContig) {
                                                                        // Optionally show a toast or alert
                                                                        return;
                                                                    }
                                                                }
                                                                updateState(setSlotConfigs, config.id, 'slotIds', remainingIds);
                                                            } else {
                                                                if (isSelectable) {
                                                                    updateState(setSlotConfigs, config.id, 'slotIds', [...currentIds, slot.id]);
                                                                }
                                                            }
                                                        }}
                                                        className={`px-3 py-3 text-left rounded-lg border-2 transition-all ${isSelected
                                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]'
                                                            : isSelectable
                                                                ? 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30'
                                                                : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-60'
                                                            }`}
                                                        title={!isSelected && !isSelectable && currentIds.length > 0 ? "Only contiguous segments can be selected" : ""}
                                                    >
                                                        <div className="font-bold truncate">{slot.tag || 'Untitled Slot'}</div>
                                                        <div className="text-[10px] opacity-80 mt-1 flex justify-between">
                                                            <span>{slot.startTime} - {slot.endTime}</span>
                                                            <span className="bg-black/20 px-1 rounded">{calculateHours(slot.startTime, slot.endTime)}h</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {!isReadOnly && (
                                <button
                                    type="button"
                                    onClick={() => addState(setSlotConfigs, { name: 'New Configuration', slotIds: [] })}
                                    className="w-full font-semibold py-3 px-4 border-2 border-dashed border-indigo-200 rounded-lg hover:bg-gray-50 text-indigo-600 transition-colors"
                                >
                                    + Add New Configuration Group
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'plan' && (
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                        <h3 className="text-xl font-semibold">Plan Form</h3>
                        {plans.map((plan, index) => (
                            <div key={plan.id} className="p-4 border rounded-lg bg-gray-50/70 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-800">Plan {index + 1}</h4>
                                    {plans.length > 1 && <button type="button" onClick={() => removeState(setPlans, plan.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Remove</button>}
                                </div>
                                <div className="grid md:grid-cols-4 gap-4">
                                    <div>
                                        <Label>Plan Name <span className="text-red-500">*</span></Label>
                                        <Input value={plan.planName} onChange={e => updateState(setPlans, plan.id, 'planName', e.target.value)} placeholder="e.g., Morning Shift" />
                                    </div>
                                    <div>
                                        <Label>Hours {plan.planType === 'FIXED' && <span className="text-gray-400 text-xs">(auto-filled)</span>}</Label>
                                        <Input type="number" value={plan.hours} onChange={e => updateState(setPlans, plan.id, 'hours', e.target.value)} placeholder="e.g., 8" disabled={plan.planType === 'Fixed' && plan.timeSlotId !== ''} />
                                    </div>
                                    <div>
                                        <Label>Plan Type</Label>
                                        <Select value={plan.planType} onChange={e => updateState(setPlans, plan.id, 'planType', e.target.value)}>
                                            <option value="Fixed">Fixed</option>
                                            <option value="Float">Float</option>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Monthly Fee (₹)</Label>
                                        <Input type="number" value={plan.monthlyFee} onChange={e => updateState(setPlans, plan.id, 'monthlyFee', e.target.value)} placeholder="e.g., 2000" />
                                    </div>
                                </div>
                                {plan.planType === 'Fixed' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Select Slot Configuration</Label>
                                            <Select
                                                value={plan.configId || ''}
                                                onChange={e => {
                                                    const configId = Number(e.target.value);
                                                    updateState(setPlans, plan.id, 'configId', configId);
                                                    // Reset slotIds when configuration changes
                                                    updateState(setPlans, plan.id, 'slotIds', []);
                                                    updateState(setPlans, plan.id, 'hours', '0');
                                                }}
                                                disabled={isReadOnly}
                                            >
                                                <option value="">Select a configuration</option>
                                                {slotConfigs.map(config => (
                                                    <option key={config.id} value={config.id}>{config.name}</option>
                                                ))}
                                            </Select>
                                        </div>

                                        {plan.configId && (
                                            <div>
                                                <Label>Included Slot Segments</Label>
                                                <p className="text-xs text-gray-500 mb-2">Select one or more continuous slots for this plan.</p>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {(slotConfigs.find(c => c.id === plan.configId)?.slotIds || []).map((msId: number) => {
                                                        const slot = masterSlots.find(s => s.id === msId);
                                                        if (!slot) return null;
                                                        const isSelected = (plan.slotIds || []).includes(slot.id);
                                                        return (
                                                            <button
                                                                key={slot.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    const currentIds = plan.slotIds || [];
                                                                    const newIds = isSelected
                                                                        ? currentIds.filter((id: number) => id !== slot.id)
                                                                        : [...currentIds, slot.id];

                                                                    updateState(setPlans, plan.id, 'slotIds', newIds);

                                                                    // Recalculate total hours
                                                                    const selectedSlots = masterSlots.filter(s => newIds.includes(s.id));
                                                                    const totalHours = selectedSlots.reduce((acc, s) => acc + Number(calculateHours(s.startTime, s.endTime)), 0);
                                                                    updateState(setPlans, plan.id, 'hours', totalHours.toFixed(2));
                                                                }}
                                                                className={`px-3 py-2 text-xs rounded-md border transition-all ${isSelected
                                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                                                                    }`}
                                                            >
                                                                {slot.tag}<br />
                                                                <span className="opacity-70 text-[10px]">{slot.startTime}-{slot.endTime}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <Label>Plan Tags (Slot Pools)</Label>
                                    <p className="text-xs text-gray-500 mb-2">Assign tags to this plan for flexible seating logic.</p>
                                    <div className="flex flex-wrap gap-4">
                                        {SLOT_POOLS.map(pool => (
                                            <Checkbox
                                                key={pool}
                                                label={pool}
                                                checked={(plan.slotPools || []).includes(pool)}
                                                onChange={e => updateCheckboxState(setPlans, plan.id, 'slotPools', pool, e.target.checked)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label>Description</Label>
                                    <Input value={plan.description} onChange={e => updateState(setPlans, plan.id, 'description', e.target.value)} placeholder="e.g., Full Day Access" disabled={isReadOnly} />
                                </div>
                            </div>
                        ))}
                        {!isReadOnly && (
                            <button type="button" onClick={() => addState(setPlans, { dbId: '', planName: '', hours: '0', planType: 'Fixed', slotIds: [], slotPools: [], monthlyFee: '', description: '', configId: null })} className="w-full font-semibold py-2 px-4 border-2 border-dashed rounded-md hover:bg-gray-100">+ Add Plan</button>
                        )}
                    </div>
                )}

                {activeTab === 'locker' && (
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                        <h3 className="text-xl font-semibold">Locker Form</h3>
                        {lockers.map((locker, index) => (
                            <div key={locker.id} className="p-4 border rounded-lg bg-gray-50/70 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-800">Locker Type {index + 1}</h4>
                                    {lockers.length > 1 && (<button type="button" onClick={() => removeState(setLockers, locker.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Remove</button>)}
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <Label>Locker Type Name</Label>
                                        <Input value={locker.lockerType} onChange={e => updateState(setLockers, locker.id, 'lockerType', e.target.value)} placeholder="e.g., Standard, Premium" />
                                    </div>
                                    <div>
                                        <Label>Number of Lockers</Label>
                                        <Input type="number" value={locker.numberOfLockers} onChange={e => updateState(setLockers, locker.id, 'numberOfLockers', e.target.value)} placeholder="e.g., 25" />
                                    </div>
                                    <div>
                                        <Label>Locker Charge (₹/month)</Label>
                                        <Input type="number" value={locker.charge} onChange={e => updateState(setLockers, locker.id, 'charge', e.target.value)} placeholder="e.g., 300" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <Label>Description</Label>
                                        <Input value={locker.description} onChange={e => updateState(setLockers, locker.id, 'description', e.target.value)} placeholder="Optional details about the locker" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addState(setLockers, { lockerType: '', numberOfLockers: '', charge: '', description: '' })} className="w-full font-semibold py-2 px-4 border-2 border-dashed rounded-md hover:bg-gray-100">+ Add Locker Type</button>
                    </div>
                )}

                {activeTab === 'seat' && (
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                        <h3 className="text-xl font-semibold">Seat Management Form</h3>
                        {seatConfigurations.map((config, index) => (
                            <div key={config.id} className="p-4 border rounded-lg bg-gray-50/70 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-800">Seat Configuration {index + 1}</h4>
                                    {seatConfigurations.length > 1 && (<button type="button" onClick={() => removeState(setSeatConfigurations, config.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Remove</button>)}
                                </div>
                                <div>
                                    <Label>Seat Numbers / Range</Label>
                                    <Input value={config.seatNumbers} onChange={e => updateState(setSeatConfigurations, config.id, 'seatNumbers', e.target.value)} placeholder="e.g., 1-50 or 5, 8, 12-15" />
                                </div>
                                <div>
                                    <Label>Seat Type</Label>
                                    <div className="flex gap-4 items-center mt-2">
                                        {['Float', 'Fixed'].map(type => (<div key={type} className="flex items-center">
                                            <input id={`seatType-${config.id}-${type}`} type="radio" name={`seatType-${config.id}`} value={type} checked={config.seatType === type} onChange={e => updateState(setSeatConfigurations, config.id, 'seatType', e.target.value)} className="h-4 w-4" />
                                            <label htmlFor={`seatType-${config.id}-${type}`} className="ml-2">{type} Seat</label>
                                        </div>))}
                                    </div>
                                </div>
                                {(config.seatType === 'Fixed' || config.seatType === 'Special') && (
                                    <div className="pt-2">
                                        <Checkbox id={`attachLocker-${config.id}`} label="Attach Locker" checked={config.attachLocker} onChange={e => updateState(setSeatConfigurations, config.id, 'attachLocker', e.target.checked)} />
                                        {config.attachLocker && (<div className="mt-2 pl-6"><Label>Locker Type</Label><Select value={config.lockerTypeId} onChange={e => updateState(setSeatConfigurations, config.id, 'lockerTypeId', e.target.value)}><option value="">Select Locker Type</option>{lockers.map(locker => <option key={locker.id} value={String(locker.id)}>{locker.lockerType}</option>)}</Select></div>)}
                                    </div>
                                )}
                                {config.seatType === 'Special' && (
                                    <div>
                                        <Label>Applicable Plan(s)</Label>
                                        <div className="max-h-32 overflow-y-auto rounded-md border p-2 bg-white space-y-1">
                                            {plans.length > 0 ? (
                                                plans.map(plan => (
                                                    <Checkbox
                                                        key={plan.id}
                                                        id={`seat-${config.id}-plan-${plan.id}`}
                                                        label={plan.planName || plan.description || `Plan ID: ${plan.id}`}
                                                        checked={config.applicablePlanIds.includes(String(plan.id))}
                                                        onChange={e => handlePlanSelectionChange(
                                                            setSeatConfigurations,
                                                            config.id,
                                                            String(plan.id),
                                                            e.target.checked
                                                        )}
                                                    />
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 px-2">No plans defined yet.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={() => addState(setSeatConfigurations, { seatNumbers: '', seatType: 'Float', attachLocker: false, lockerTypeId: '', applicablePlanIds: [] })} className="w-full font-semibold py-2 px-4 border-2 border-dashed rounded-md hover:bg-gray-100">+ Add Seat Configuration</button>
                    </div>
                )}

                {activeTab === 'package' && (
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                        <h3 className="text-xl font-semibold">Package Rule Form (Subscription Discounts)<span className='text-red-400 font-thin text-lg'>  Optional</span></h3>
                        <p className="text-sm text-gray-500">Define automatic discounts applied based on the chosen subscription duration (e.g., 10% off for 12 months).</p>

                        {packageRules.map((rule, index) => (
                            <div key={rule.id} className="p-4 border rounded-lg bg-gray-50/70 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-800">Package Rule {index + 1}</h4>
                                    {packageRules.length > 1 &&
                                        <button
                                            type="button"
                                            onClick={() => removeState(setPackageRules, rule.id)}
                                            className="text-red-500 hover:text-red-700 font-medium text-sm"
                                        >
                                            Remove Rule
                                        </button>
                                    }
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    {/* Plan */}
                                    <div>
                                        <Label>Base Plan</Label>
                                        <Select value={rule.planId} onChange={e => updateState(setPackageRules, rule.id, 'planId', e.target.value)}>
                                            <option value="">Select a base plan</option>
                                            {plans.map(p => <option key={p.id} value={String(p.id)}>{p.planName || p.description || `Plan ID: ${p.id}`}</option>)}
                                        </Select>
                                    </div>

                                    {/* Duration */}
                                    <div>
                                        <Label>Duration (Months)</Label>
                                        <Select value={rule.duration} onChange={e => updateState(setPackageRules, rule.id, 'duration', parseInt(e.target.value))}>
                                            {([1, 4, 6, 12]).map(d => <option key={d} value={d}>{d} Month(s)</option>)}
                                        </Select>
                                    </div>

                                    {/* Discount */}
                                    <div>
                                        <Label>Discount (%)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            step={1}
                                            value={rule.discount}
                                            onChange={e => updateState(setPackageRules, rule.id, 'discount', sanitizePercentOff(e.target.value))}
                                            placeholder="e.g., 10"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addState(setPackageRules, { planId: '', duration: 4, discount: '0' })}
                            className="w-full font-semibold py-2 px-4 border-2 border-dashed rounded-md hover:bg-gray-100"
                        >
                            + Add Package Rule
                        </button>
                    </div>
                )}

                {activeTab === 'offer' && (
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                        <h3 className="text-xl font-semibold">Offer Form (Promotional/Coupon Discounts)<span className='text-red-400 font-thin text-lg'>  Optional</span></h3>
                        <p className="text-sm text-gray-500">Create time-bound or conditional promotions that can be applied using a coupon code or automatically (e.g., Festival Sale).</p>

                        {offers.map((offer, index) => (
                            <div key={offer.id} className="p-4 border rounded-lg bg-gray-50/70 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-800">Offer {index + 1}</h4>
                                    {offers.length > 0 &&
                                        <button
                                            type="button"
                                            onClick={() => removeState(setOffers, offer.id)}
                                            className="text-red-500 hover:text-red-700 font-medium text-sm"
                                        >
                                            Remove
                                        </button>
                                    }
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Title (Required)</Label>
                                        <Input value={offer.title} onChange={e => updateState(setOffers, offer.id, 'title', e.target.value)} placeholder="e.g., Diwali Offer" />
                                    </div>
                                    <div>
                                        <Label>Coupon Code (Optional)</Label>
                                        <Input value={offer.couponCode} onChange={e => updateState(setOffers, offer.id, 'couponCode', e.target.value)} placeholder="e.g., DIWALI20" />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <div>
                                        <Label>Discount Type</Label>
                                        <Select value={offer.discountType} onChange={e => updateState(setOffers, offer.id, 'discountType', e.target.value)}>
                                            <option value="%">% (Percentage)</option>
                                            <option value="Flat">Flat (Amount in ₹)</option>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Discount Value</Label>
                                        <Input
                                            type="number"
                                            value={offer.discountValue}
                                            onChange={e => updateState(setOffers, offer.id, 'discountValue', e.target.value)}
                                            placeholder="e.g., 20 or 100"
                                        />
                                    </div>
                                    <div>
                                        <Label>Max Discount (₹, Optional)</Label>
                                        <Input
                                            type="number"
                                            value={offer.maxDiscount}
                                            onChange={e => updateState(setOffers, offer.id, 'maxDiscount', e.target.value)}
                                            placeholder="e.g., 500"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Valid From (Start Date)</Label>
                                        <Input type="date" value={offer.validFrom} onChange={e => updateState(setOffers, offer.id, 'validFrom', e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Valid To (End Date)</Label>
                                        <Input type="date" value={offer.validTo} onChange={e => updateState(setOffers, offer.id, 'validTo', e.target.value)} />
                                    </div>
                                </div>

                                <div>
                                    <Label>Applicable Plan(s)</Label>
                                    <p className="text-xs text-gray-500 mb-1">Select all plans this offer can be redeemed against.</p>
                                    <div className="max-h-32 overflow-y-auto rounded-md border p-2 bg-white space-y-1">
                                        {plans.length > 0 ? (
                                            plans.map(plan => (
                                                <Checkbox
                                                    key={plan.id}
                                                    id={`offer-${offer.id}-plan-${plan.id}`}
                                                    label={plan.planName || plan.description || `Plan ID: ${plan.id}`}
                                                    checked={offer.planIds.includes(String(plan.id))}
                                                    onChange={e => handlePlanSelectionChange(
                                                        setOffers,
                                                        offer.id,
                                                        String(plan.id),
                                                        e.target.checked
                                                    )}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 px-2">No plans defined yet.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label>Applicable Slot Pool(s)</Label>
                                    <p className="text-xs text-gray-500 mb-1">Select user groups (e.g., Student, Mentor) that can use this offer.</p>
                                    <div className="flex flex-wrap gap-4">
                                        {SLOT_POOLS.map(pool =>
                                            <Checkbox
                                                key={pool}
                                                label={pool}
                                                checked={offer.slotPools.includes(pool)}
                                                onChange={e => updateCheckboxState(setOffers, offer.id, 'slotPools', pool, e.target.checked)}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <Checkbox
                                        id={`newUsers-${offer.id}`}
                                        label="For New Users Only"
                                        checked={offer.isForNewUsers}
                                        onChange={e => updateState(setOffers, offer.id, 'isForNewUsers', e.target.checked)}
                                    />
                                    <Checkbox
                                        id={`oncePerUser-${offer.id}`}
                                        label="Once Per User"
                                        checked={offer.isOncePerUser}
                                        onChange={e => updateState(setOffers, offer.id, 'isOncePerUser', e.target.checked)}
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addState(setOffers, { title: '', couponCode: '', discountType: '%', discountValue: '', maxDiscount: '', validFrom: '', validTo: '', slotPools: [], planIds: [], isForNewUsers: false, isOncePerUser: false })}
                            className="w-full font-semibold py-2 px-4 border-2 border-dashed rounded-md hover:bg-gray-100"
                        >
                            + Add Offer
                        </button>
                    </div>
                )}

                {apiStatus === 'success' && <div className="p-4 mt-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert"><strong>Success!</strong> All library data has been submitted successfully.</div>}
                {apiStatus === 'error' && <div className="p-4 mt-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert"><strong>Error!</strong> Some data failed to submit. Please review your forms and try again.</div>}


                <div className='flex justify-center items-center gap-2.5'>
                    <button
                        type="button"
                        onClick={() => setCurrentStep(currentStep => currentStep - 1)}
                        className="w-full px-6 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-700 text-lg font-[500] cursor-pointer transition-all duration-300 hover:bg-gray-100"
                    >
                        Previous
                    </button>

                    {isReadOnly ? (
                        <button type="button" onClick={handleNext} className="w-full border-0 rounded-xl p-3 bg-gray-500 text-white text-lg font-bold cursor-pointer transition-all duration-300 hover:bg-gray-600">
                            Next
                        </button>
                    ) :
                        (<div className="w-full flex gap-2">
                            {/* Show Skip button only if not on last tab */}
                            {
                                // !isLastTab && submittedTabs.includes(activeTab) ? (
                                //     <button 
                                //     type="button" 
                                //     onClick={handleSkip}
                                //     className="w-full px-6 py-3 border border-gray-400 rounded-xl bg-transparent text-gray-600 text-lg font-[500] cursor-pointer transition-all duration-300 hover:bg-gray-100"
                                //     >
                                //     Skip & Continue
                                //     </button>
                                //     ):
                                <button
                                    type="button"
                                    onClick={handlePrimaryAction}
                                    className='w-full p-3 border-0 rounded-xl bg-[#3b82f6] text-white text-lg font-bold cursor-pointer transition-all duration-300 hover:bg-[#2563eb] disabled:bg-indigo-400 disabled:cursor-not-allowed'
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className='flex space-x-2.5 justify-center items-center'>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </div>
                                    ) : (
                                        isLastTab ? 'Save & Complete Submission' : 'Save & Continue'
                                    )}
                                </button>
                            }
                        </div>)}
                </div>
            </div>
        </div>
    );
}
