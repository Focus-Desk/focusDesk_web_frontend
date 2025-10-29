// plansAndPricingForm.tsx
'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useCreateTimeSlotMutation, useCreatePlanMutation, useCreateLockerMutation, useConfigureSeatRangesMutation, useCreatePackageRuleMutation, useCreateOfferMutation } from '../../state/api';
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
    timeSlots: any[];
    plans: any[];
    lockers: any[];
    seatConfigurations: any[];
    packageRules: any[];
    offers: any[];
    submittedTabs: string[];
}

// Initial state for the complex objects (for local component use)
const initialPricingData: PricingData = {
    timeSlots: [{ id: 1, name: '', startTime: '09:00', endTime: '17:00', hours: '8.00', slotPools: [] }],
    plans: [{ id: 1, hours: '', planType: 'Fixed', timeSlotId: '', slotPools: [], monthlyFee: '', description: '' }],
    seatConfigurations: [{ id: 1, seatNumbers: '', seatType: 'Float', attachLocker: false, lockerTypeId: '', applicablePlanIds: [] }],
    lockers: [{ id: 1, lockerType: 'Standard', numberOfLockers: '', charge: '', description: '' }],
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

    const [timeSlots, setTimeSlots] = useState(initialLocalData.timeSlots);
    const [plans, setPlans] = useState(initialLocalData.plans);
    const [seatConfigurations, setSeatConfigurations] = useState(initialLocalData.seatConfigurations);
    const [lockers, setLockers] = useState(initialLocalData.lockers);
    const [packageRules, setPackageRules] = useState(initialLocalData.packageRules);
    const [offers, setOffers] = useState(initialLocalData.offers);
    
    // ... (rest of local state and mutation hooks remain the same) ...

    const [timeSlotErrors, setTimeSlotErrors] = useState<{[id: number]: string}>({});

    const [createTimeSlot, { isLoading: isCreatingTimeSlot }] = useCreateTimeSlotMutation();
    const [createPlan, { isLoading: isCreatingPlan }] = useCreatePlanMutation();
    const [createLocker, { isLoading: isCreatingLocker }] = useCreateLockerMutation();
    const [configureSeatRanges, { isLoading: isConfiguringSeats }] = useConfigureSeatRangesMutation();
    const [createPackageRule, { isLoading: isCreatingPackageRule }] = useCreatePackageRuleMutation();
    const [createOffer, { isLoading: isCreatingOffer }] = useCreateOfferMutation();

    const isSubmitting = isCreatingTimeSlot || isCreatingPlan || isCreatingLocker || isConfiguringSeats || isCreatingPackageRule || isCreatingOffer;
    const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error'>('idle');


    // --- SIDE EFFECT FOR PERSISTENCE ---
    useEffect(() => {
        // Debounce or minimize updates to parent state
        const timer = setTimeout(() => {
            updateFormData({ 
                pricingData: {
                    timeSlots,
                    plans,
                    lockers,
                    seatConfigurations,
                    packageRules,
                    offers,
                    submittedTabs,
                }
            });
        }, 500); // Debounce by 500ms
        
        return () => clearTimeout(timer);
    }, [timeSlots, plans, lockers, seatConfigurations, packageRules, offers, submittedTabs]);
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

    const timeSelectChange = (
        setter: React.Dispatch<React.SetStateAction<any[]>>, 
        itemId: number,        
        field: string,         
        part: 'hour' | 'minute' | 'period',          
        value: string          
    ) => {
        setter(prevSlots => {
            const currentSlot = prevSlots.find(ts => ts.id === itemId);
            if (!currentSlot) return prevSlots;
    
            const [currentHour24, currentMinute] = currentSlot[field]?.split(':') || ['00', '00'];
            let currentHour12 = parseInt(currentHour24) % 12;
            if (currentHour12 === 0) currentHour12 = 12; 
            
            let currentPeriod = parseInt(currentHour24) >= 12 ? 'PM' : 'AM';
    
            let newHour12 = part === 'hour' ? parseInt(value) : currentHour12;
            let newMinute = part === 'minute' ? value : currentMinute;
            let newPeriod = part === 'period' ? value : currentPeriod;
    
            let hour24;
            if (newPeriod === 'PM' && newHour12 < 12) {
                hour24 = newHour12 + 12;
            } else if (newPeriod === 'AM' && newHour12 === 12) {
                hour24 = 0; 
            } else {
                hour24 = newHour12;
            }
            
            const newHour24Padded = String(hour24).padStart(2, '0');
            const newTime24 = `${newHour24Padded}:${newMinute}`;
    
            return prevSlots.map(ts => 
                ts.id === itemId ? { ...ts, [field]: newTime24 } : ts
            );
        });
    };

    useEffect(() => {
        timeSlots.forEach(ts => {
            if (ts.startTime && ts.endTime) {
                const newHours = calculateHours(ts.startTime, ts.endTime);
                if (newHours !== ts.hours) {
                    updateState(setTimeSlots, ts.id, 'hours', newHours);
                }
            }
        });
    }, [timeSlots]);

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

    const validateTimeSlot = (ts: any, allTimeSlots: any[]) => {
        if (ts.startTime && ts.endTime && ts.startTime === ts.endTime) {
            setTimeSlotErrors(prev => ({
                ...prev,
                [ts.id]: "Start time and end time cannot be the same"
            }));
            return false;
        } else {
            setTimeSlotErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[ts.id];
                return newErrors;
            });
            return true;
        }
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

    // --- SUBMISSION LOGIC (Remains the same as before) ---
    const submitTimeSlots = async () => {
        setApiStatus('idle');
        try {
            const results = await Promise.all(
                timeSlots.map(ts => createTimeSlot({ 
                    libraryId, 
                    name: ts.name, 
                    startTime: ts.startTime, 
                    endTime: ts.endTime, 
                    dailyHours: parseFloat(ts.hours), 
                    slotPools: ts.slotPools 
                }).unwrap())
            );
            setApiStatus('success');
            return true;
        } catch (error) {
            setApiStatus('error');
            return false;
        }
    };

    const submitPlans = async () => {
        setApiStatus('idle');
        // Filter out plans with no monthly fee or hours
        const validPlans = plans.filter(p => p.monthlyFee && p.hours); 
        if (validPlans.length === 0) {
            console.log("No valid plans to submit — skipping API call.");
            return true;
        }
        try {
            const results = await Promise.all(
                validPlans.map(p => createPlan({ 
                    libraryId, 
                    planName: p.description, 
                    planType: p.planType, 
                    price: parseFloat(p.monthlyFee), 
                    hours: parseInt(p.hours), 
                    timeSlotId: p.planType === 'Fixed' ? p.timeSlotId : undefined, // Only pass timeSlotId for Fixed
                    slotPools: p.slotPools, 
                    description: p.description 
                }).unwrap())
            );
            setApiStatus('success');
            return true;
        } catch (error) {
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
            const results = await Promise.all(
                validSeatConfigurations.map(sc => configureSeatRanges({ 
                    libraryId, 
                    ranges: [{ 
                        from: parseInt(sc.seatNumbers.split('-')[0]), 
                        to: parseInt(sc.seatNumbers.split('-')[1] || sc.seatNumbers.split('-')[0]), 
                        mode: sc.seatType.toUpperCase() as 'FIXED' | 'FLOAT' | 'SPECIAL', 
                        lockerId: sc.lockerTypeId || undefined 
                    }] 
                }).unwrap())
            );
            setApiStatus('success');
            return true;
        } catch (error) {
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
                validPackageRules.map(pr => createPackageRule({ 
                    libraryId,
                    planId: pr.planId, 
                    months: pr.duration, 
                    percentOff: Math.round(parseFloat(pr.discount) || 0)
                }).unwrap())
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
                validOffers.map(o => createOffer({ 
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
                    planIds: o.planIds 
                }).unwrap())
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
            let hasErrors = false;
            timeSlots.forEach(ts => {
                // Re-run validation logic before submission
                if (ts.startTime && ts.endTime && ts.startTime === ts.endTime) {
                    hasErrors = true;
                    setTimeSlotErrors(prev => ({
                        ...prev,
                        [ts.id]: "Start time and end time cannot be the same"
                    }));
                }
            });
            
            if (hasErrors || Object.keys(timeSlotErrors).length > 0) {
                setApiStatus('error');
                return;
            }
        }

        const currentIndex = tabOrder.indexOf(activeTab);
        const isLastTab = currentIndex === tabOrder.length - 1;

        let success = false;
        switch(activeTab) {
            case 'timeslot':
                success = await submitTimeSlots();
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
                onSuccess({ timeSlots, plans, lockers, seatConfigurations, packageRules, offers });
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

    useEffect(() => {
        timeSlots.forEach(ts => {
            if (ts.startTime && ts.endTime) {
                const newHours = calculateHours(ts.startTime, ts.endTime);
                if (newHours !== ts.hours) {
                    updateState(setTimeSlots, ts.id, 'hours', newHours);
                }
                
                validateTimeSlot(ts, timeSlots);
            }
        });
    }, [timeSlots]);

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
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold">TimeSlot Form </h3>
        
        {timeSlots.map((ts, index) => {
            // Helper to get 12-hour display values from the 24-hour state (HH:MM)
            const get12HourTime = (time24: string) => {
                const [h, m] = time24.split(':');
                const hour24 = parseInt(h);
                let hour12 = hour24 % 12;
                hour12 = hour12 === 0 ? 12 : hour12;
                const period = hour24 >= 12 ? 'PM' : 'AM';
                return { hour: String(hour12).padStart(2, '0'), minute: m, period: period };
            };

            const start12 = get12HourTime(ts.startTime);
            const end12 = get12HourTime(ts.endTime);

            // Generate hour options (1 to 12)
            const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
            // Generate minute options (00, 15, 30, 45)
            const minutes = ['00', '15', '30', '45'];


            return (
                <div key={ts.id} className="p-4 border rounded-lg bg-gray-50/70 space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-800">TimeSlot {index + 1}</h4>
                        {timeSlots.length > 0 && 
                            <button 
                                type="button" 
                                onClick={() => removeState(setTimeSlots, ts.id)} 
                                className="text-red-500 hover:text-red-700 font-medium text-sm"
                            >
                                Remove
                            </button>
                        }
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                        
                        {/* Slot Name */}
                        <div>
                            <Label>Slot Name</Label>
                            <Input value={ts.name} onChange={e => updateState(setTimeSlots, ts.id, 'name', e.target.value)} placeholder="e.g., Morning Shift" disabled={isReadOnly} />
                        </div>

                        {/* START TIME SELECTS (ADDED BORDER) */}
                        <div className="">
                            <Label>Start Time</Label>
                            <div className="grid grid-cols-3 gap-1 mt-1 border border-gray-300 rounded-md p-2">
                                <Select 
                                    disabled={isReadOnly}
                                    value={start12.hour}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)  => timeSelectChange(setTimeSlots, ts.id, 'startTime', 'hour', e.target.value)}
                                    className={timeSlotErrors[ts.id] ? "border-red-500" : ""}
                                >
                                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                                </Select>
                                <Select 
                                    disabled={isReadOnly}
                                    value={start12.minute}
                                    onChange={e => timeSelectChange(setTimeSlots, ts.id, 'startTime', 'minute', e.target.value)}
                                    className={timeSlotErrors[ts.id] ? "border-red-500" : ""}
                                >
                                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                                </Select>
                                <Select 
                                    disabled={isReadOnly}
                                    value={start12.period}
                                    onChange={e => timeSelectChange(setTimeSlots, ts.id, 'startTime', 'period', e.target.value)}
                                    className={timeSlotErrors[ts.id] ? "border-red-500" : ""}
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </Select>
                            </div>
                        </div>

                        {/* END TIME SELECTS (ADDED BORDER) */}
                        <div className="col-span-1  bg-white">
                            <Label>End Time</Label>
                            <div className="grid grid-cols-3 gap-1 border border-gray-300 rounded-md p-2 mt-1">
                                <Select 
                                    disabled={isReadOnly}
                                    value={end12.hour}
                                    onChange={e => timeSelectChange(setTimeSlots, ts.id, 'endTime', 'hour', e.target.value)}
                                    className={timeSlotErrors[ts.id] ? "border-red-500" : ""}
                                >
                                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                                </Select>
                                <Select 
                                    disabled={isReadOnly}
                                    value={end12.minute}
                                    onChange={e => timeSelectChange(setTimeSlots, ts.id, 'endTime', 'minute', e.target.value)}
                                    className={timeSlotErrors[ts.id] ? "border-red-500" : ""}
                                >
                                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                                </Select>
                                <Select 
                                    disabled={isReadOnly}
                                    value={end12.period}
                                    onChange={e => timeSelectChange(setTimeSlots, ts.id, 'endTime', 'period', e.target.value)}
                                    className={timeSlotErrors[ts.id] ? "border-red-500" : ""}
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </Select>
                            </div>
                        </div>
                        
                        {/* Hours (Display) */}
                        <div className="col-span-1">
                            <Label>Duration (Hours)</Label>
                            <Input value={ts.hours} disabled placeholder="Calculated" />
                        </div>

                        {/* Error Message */}
                        {timeSlotErrors[ts.id] && (
                            <div className="md:col-span-3">
                                <p className="text-sm text-red-600 mt-1">
                                    🚨 {timeSlotErrors[ts.id]}
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Slot Pool */}
                    <div>
                        <Label>Slot Pool (Applicable User Types)</Label>
                        
                        <div className="flex flex-wrap gap-4">
                            {SLOT_POOLS.map(pool => 
                                <Checkbox 
                                    key={pool} 
                                    label={pool} 
                                    checked={ts.slotPools.includes(pool)} 
                                    onChange={e => updateCheckboxState(setTimeSlots, ts.id, 'slotPools', pool, e.target.checked)} 
                                />
                            )}
                        </div>
                    </div>
                </div>
            )
        })}
        
        <button 
            type="button" 
            onClick={() => addState(setTimeSlots, { name: '', startTime: '09:00', endTime: '17:00', hours: '8.00', slotPools: [] })} 
            className="w-full font-semibold py-2 px-4 border-2 border-dashed rounded-md hover:bg-gray-100"
        >
            + Add TimeSlot
        </button>
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
                                 <div className="grid md:grid-cols-3 gap-4">
                                     <div>
                                        <Label>Hours</Label>
                                        <Input type="number" value={plan.hours} onChange={e => updateState(setPlans, plan.id, 'hours', e.target.value)} placeholder="e.g., 8" />
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
                                 {plan.planType === 'Fixed' ? (
                                    <div>
                                        <Label>Select TimeSlot</Label>
                                        <Select value={plan.timeSlotId} onChange={e => updateState(setPlans, plan.id, 'timeSlotId', e.target.value)}>
                                            <option value="">Select a time slot</option>
                                            {timeSlots.map(ts => 
                                        <option key={ts.id} value={ts.id}>{ts.name} ({ts.startTime} - {ts.endTime})</option>)}
                                        </Select>
                                    </div>
                                 ) : (
                                     <div>
                                        <Label>Select Slot Pool(s)</Label>
                                        <div className="flex flex-wrap gap-4">{SLOT_POOLS.map(pool => <Checkbox key={pool} label={pool} checked={plan.slotPools.includes(pool)} onChange={e => updateCheckboxState(setPlans, plan.id, 'slotPools', pool, e.target.checked)} />)}
                                        </div>
                                    </div>
                                 )}
                                 <div>
                                    <Label>Description</Label>
                                    <Input value={plan.description} onChange={e => updateState(setPlans, plan.id, 'description', e.target.value)} placeholder="e.g., Full Day Access" />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addState(setPlans, { hours: '', planType: 'Fixed', timeSlotId: '', slotPools: [], monthlyFee: '', description: '' })} className="w-full font-semibold py-2 px-4 border-2 border-dashed rounded-md hover:bg-gray-100">+ Add Plan</button>
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
                                                    label={plan.description || `Plan ID: ${plan.id}`} 
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
                            {plans.map(p => <option key={p.id} value={String(p.id)}>{p.description}</option>)}
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
                                    label={plan.description || `Plan ID: ${plan.id}`} 
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