'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    useGetLibraryByIdQuery,
    useGetTimeSlotsByLibraryIdQuery,
    useGetPlansQuery,
    useGetLockersQuery,
    useGetSeatsByLibraryQuery,
    useGetPackageRulesByLibraryIdQuery,
    useGetOffersQuery,
    useUpdateLibraryMutation,
    useCreateTimeSlotMutation,
    useUpdateTimeSlotMutation,
    useDeleteTimeSlotMutation,
    useCreatePlanMutation,
    useUpdatePlanMutation,
    useDeletePlanMutation,
    useCreateLockerMutation,
    useUpdateLockerMutation,
    useDeleteLockerMutation,
    useDeleteSeatMutation,
    useCreatePackageRuleMutation,
    useUpdatePackageRuleMutation,
    useDeletePackageRuleMutation,
    useCreateOfferMutation,
    useUpdateOfferMutation,
    useDeleteOfferMutation,
    useConfigureSeatRangesMutation,
} from '@/state/api';
import { Input } from '@/components/ui/input';
import { TabButton } from '@/components/ui/tabButton';
import { Label } from '@/components/ui/label';
import { Plan, TimeSlot, Locker, PackageRule, Offer, Library } from '@/types/prismaTypes';

type SeatConfiguration = {
    id: number;
    seatNumbers: string;
    seatType: "Fixed" | "Float" | "Special";
    attachLocker: boolean;
    lockerTypeId: string;
    applicablePlanIds: string[];
}

export type FullLibrary = Library & {
timeSlots: TimeSlot[];
plans: Plan[];
seatConfigurations: SeatConfiguration[];
lockers: Locker[];
packageRules: PackageRule[];
offers: Offer[];
facilities: string[];
};

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" {...props}>
        {children}
    </select>
);

const Checkbox = ({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div className="flex items-center">
        <input type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" {...props} />
        <label htmlFor={props.id} className="ml-2 block text-sm text-gray-900">
            {label}
        </label>
    </div>
);

const SLOT_POOLS = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];
const ALL_FACILITIES = ["WiFi", "Air Conditioning", "Drinking Water", "CCTV Security", "Power Backup", "Locker Facility", "Parking", "Silent Study Zone"];

const calculateHoursBetween = (startTime: string, endTime: string): string => {
    if (!startTime || !endTime) return '';
    
    const startDate = new Date(`1970-01-01T${startTime}:00`);
    const endDate = new Date(`1970-01-01T${endTime}:00`);
    
    let diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    if (diff < 0) diff += 24;
    
    return (diff.toFixed(2));
};

export default function LibraryEditPage() {
const params = useParams();
const router = useRouter();
const libraryId = params.libraryId as string;

    const { data: libraryData, isLoading: isLoadingLibrary, isError: isErrorLibrary } = useGetLibraryByIdQuery(libraryId);
    const { data: timeSlotsData, isLoading: isLoadingTimeSlots } = useGetTimeSlotsByLibraryIdQuery(libraryId);
    const { data: plansData, isLoading: isLoadingPlans } = useGetPlansQuery(libraryId);
    const { data: lockersData, isLoading: isLoadingLockers } = useGetLockersQuery(libraryId);
    const { data: seatsData, isLoading: isLoadingSeats } = useGetSeatsByLibraryQuery(libraryId);
    const { data: packageRulesData, isLoading: isLoadingPackageRules } = useGetPackageRulesByLibraryIdQuery(libraryId);
    const { data: offersData, isLoading: isLoadingOffers } = useGetOffersQuery(libraryId);
console.log("Fetched Data:", { libraryData, timeSlotsData, plansData, lockersData, seatsData, packageRulesData, offersData });
    const [updateLibrary] = useUpdateLibraryMutation();
    const [createTimeSlot] = useCreateTimeSlotMutation();
    const [updateTimeSlot] = useUpdateTimeSlotMutation();
    const [deleteTimeSlot] = useDeleteTimeSlotMutation();
    const [createPlan] = useCreatePlanMutation();
    const [updatePlan] = useUpdatePlanMutation();
    const [deletePlan] = useDeletePlanMutation();
    const [createLocker] = useCreateLockerMutation();
    const [updateLocker] = useUpdateLockerMutation();
    const [deleteLocker] = useDeleteLockerMutation();
    // const [updateSeat] = useUpdateSeatMutation();
    const [deleteSeat] = useDeleteSeatMutation();
    const [createPackageRule] = useCreatePackageRuleMutation();
    const [updatePackageRule] = useUpdatePackageRuleMutation();
    const [deletePackageRule] = useDeletePackageRuleMutation();
    const [createOffer] = useCreateOfferMutation();
    const [updateOffer] = useUpdateOfferMutation();
    const [deleteOffer] = useDeleteOfferMutation();
    const [configureSeatRanges] = useConfigureSeatRangesMutation();


    const [library, setLibrary] = useState<FullLibrary | null>(null);
    const [activeTab, setActiveTab] = useState('timeslot');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const isLoading = isLoadingLibrary || isLoadingTimeSlots || isLoadingPlans || isLoadingLockers || isLoadingSeats || isLoadingPackageRules || isLoadingOffers;

useEffect(() => {
    if (libraryData && timeSlotsData && plansData && lockersData && seatsData && packageRulesData && offersData) {
        setLibrary({
            ...libraryData,
            timeSlots: timeSlotsData,
            plans: plansData,
            lockers: lockersData,
            seatConfigurations: seatsData,
            packageRules: packageRulesData,
            offers: offersData,
            facilities: libraryData.facilities || [],
        });
    }
}, [libraryData, timeSlotsData, plansData, lockersData, seatsData, packageRulesData, offersData]);

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!library) return;
    setLibrary({ ...library, [e.target.name]: e.target.value });
};

const handleFacilityChange = (facility: string, isChecked: boolean) => {
    if (!library) return;
    const currentFacilities = library.facilities || [];
    const newFacilities = isChecked ? [...currentFacilities, facility] : currentFacilities.filter(f => f !== facility);
    setLibrary({ ...library, facilities: newFacilities });
};

const addArrayItem = <T,>(field: keyof FullLibrary, initialState: Omit<T, 'id'>) => {
    if (!library) return;
    const items = (library[field] as any[]) || [];
    
    let enhancedInitialState = { ...initialState };
    if (field === 'timeSlots') {
        const timeSlotInitialState = initialState as { startTime?: string; endTime?: string };
        if (library.openingTime && library.closingTime && !timeSlotInitialState.startTime && !timeSlotInitialState.endTime) {
            enhancedInitialState = {
                ...initialState,
                startTime: library.openingTime,
                endTime: library.closingTime,
                dailyHours: calculateHoursBetween(library.openingTime, library.closingTime)
            };
        }
    }

    if (field === 'packageRules') {
        if (field === 'packageRules') {
            const pr = enhancedInitialState as any;
            if (pr.percentOff === undefined) {
                pr.percentOff = 0;
            } else if (typeof pr.percentOff !== 'number') {
                pr.percentOff = sanitizePercentOff(pr.percentOff);
            }
            enhancedInitialState = pr;
        }
    }
    
    const newId = `temp-${crypto.randomUUID()}`;
    const newItem = { id: newId, ...enhancedInitialState };
    setLibrary({ ...library, [field]: [...items, newItem] });
};

const removeArrayItem = (field: keyof FullLibrary, id: string) => {
    if (!library) return;
    const items = (library[field] as any[]) || [];
    if (items.length > 0) { 
        setLibrary({ ...library, [field]: items.filter(item => item.id !== id) });
    }
};

const updateArrayItem = <T,>(field: keyof FullLibrary, id: string, itemField: keyof T, value: any) => {
    if (!library) return;
    const items = (library[field] as any[]) || [];
    const updatedItems = items.map(item => {
        if (item.id === id) {

            if (field === 'packageRules' && (itemField === 'percentOff' as any)) {
                value = sanitizePercentOff(value);
            }

            const derived: any = {};
            if (field === 'timeSlots' && (itemField === 'startTime' || itemField === 'endTime')) {
                const startTime = (itemField === 'startTime') ? value : item.startTime;
                const endTime   = (itemField === 'endTime')   ? value : item.endTime;
                if (startTime && endTime) {
                    derived.dailyHours = calculateHoursBetween(startTime, endTime);
                }
            }

            const updatedItem = { ...item, [itemField]: value };            
            return updatedItem;
        }
        return item;
    });
    setLibrary({ ...library, [field]: updatedItems });
};

const sanitizePercentOff = (v: string | number | undefined): number => {
    const n = Number(v ?? 0);
    if (Number.isNaN(n)) return 0;
    const rounded = Math.round(n);
    if (rounded < 0) return 0;
    if (rounded > 100) return 100;
    return rounded;
};

const updateCheckboxArrayItem = <T,>(field: keyof FullLibrary, id: string, itemField: keyof T, value: string, checked: boolean) => {
    if (!library) return;
    const items = (library[field] as any[]) || [];
    const updatedItems = items.map(item => {
        if (item.id === id) {
            const currentValues = (item[itemField] as string[]) || [];
            const newValues = checked ? [...currentValues, value] : currentValues.filter(v => v !== value);
            return { ...item, [itemField]: newValues };
        }
        return item;
    });
    setLibrary({ ...library, [field]: updatedItems });
};

const handlePlanSelectionChange = (offerId: string, planId: string, isChecked: boolean) => {
    if (!library) return;

    const updatedOffers = library.offers.map(offer => {
    if (offer.id === offerId) {
        const currentPlanIds = offer.planIds || [];
        const newPlanIds = isChecked ? [...currentPlanIds, planId] : currentPlanIds.filter(id => id !== planId);
        return { ...offer, planIds: newPlanIds };
    }
    return offer;
    });

    setLibrary({ ...library, offers: updatedOffers });
};

    const validateData = () => {
        if (!library) return { isValid: false, errors: ['Library data is missing'] };
        
        const errors: string[] = [];
        
        for (let i = 0; i < library.timeSlots.length; i++) {
            const ts = library.timeSlots[i];
            if (!ts.name) errors.push(`TimeSlot ${i + 1}: Name is required`);
            if (!ts.startTime) errors.push(`TimeSlot ${i + 1}: Start time is required`);
            if (!ts.endTime) errors.push(`TimeSlot ${i + 1}: End time is required`);
            if (!ts.slotPools || ts.slotPools.length === 0) errors.push(`TimeSlot ${i + 1}: At least one slot pool must be selected`);
        }
        
        for (let i = 0; i < library.plans.length; i++) {
            const plan = library.plans[i];
            if (!plan.hours) errors.push(`Plan ${i + 1}: Hours are required`);
            if (!plan.price) errors.push(`Plan ${i + 1}: Price is required`);
            if (plan.planType === 'Fixed' && !plan.timeSlotId) errors.push(`Plan ${i + 1}: Time slot must be selected for fixed plans`);
            if (plan.planType === 'Float' && (!plan.slotPools || plan.slotPools.length === 0)) errors.push(`Plan ${i + 1}: At least one slot pool must be selected for float plans`);
        }
        
        for (let i = 0; i < library.seatConfigurations.length; i++) {
            const config = library.seatConfigurations[i];
            if (!config.seatNumbers || !config.seatNumbers.trim()) 
                errors.push(`Seat Configuration ${i + 1}: Seat numbers are required`);
            
            const seatNumbersPattern = /^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/;
            if (config.seatNumbers && !seatNumbersPattern.test(config.seatNumbers)) 
                errors.push(`Seat Configuration ${i + 1}: Invalid seat number format. Use patterns like "1-50" or "1,3,5-10"`);
                
            if (config.attachLocker && !config.lockerTypeId) 
                errors.push(`Seat Configuration ${i + 1}: Locker type must be selected when attaching lockers`);
                
            if (config.seatType === 'Special' && (!config.applicablePlanIds || config.applicablePlanIds.length === 0)) 
                errors.push(`Seat Configuration ${i + 1}: At least one applicable plan must be selected for special seats`);
        }
        
        for (let i = 0; i < library.lockers.length; i++) {
            const locker = library.lockers[i];
            if (!locker.lockerType) errors.push(`Locker Type ${i + 1}: Locker type name is required`);
            if (!locker.numberOfLockers) errors.push(`Locker Type ${i + 1}: Number of lockers is required`);
            if (!locker.price) errors.push(`Locker Type ${i + 1}: Price is required`);
        }
        
        for (let i = 0; i < library.packageRules.length; i++) {
            const rule = library.packageRules[i];
            if (!rule.planId) errors.push(`Package Rule ${i + 1}: Plan is required`);
            if (!rule.months) errors.push(`Package Rule ${i + 1}: Duration is required`);
            if (rule.percentOff === undefined || rule.percentOff === null) 
                errors.push(`Package Rule ${i + 1}: Discount percentage is required`);
        }
        
        for (let i = 0; i < library.offers.length; i++) {
            const offer = library.offers[i];
            if (!offer.title) errors.push(`Offer ${i + 1}: Title is required`);
            if (offer.flatAmount === undefined && offer.discountPct === undefined)
                errors.push(`Offer ${i + 1}: Discount value is required`);
            if (!offer.validFrom) errors.push(`Offer ${i + 1}: Valid from date is required`);
            if (!offer.validTo) errors.push(`Offer ${i + 1}: Valid to date is required`);
            if (!offer.planIds || offer.planIds.length === 0) 
                errors.push(`Offer ${i + 1}: At least one plan must be selected`);
            if (!offer.slotPools || offer.slotPools.length === 0)
                errors.push(`Offer ${i + 1}: At least one slot pool must be selected`);
        }
        
        return { isValid: errors.length === 0, errors };
    };

    type MutationFn<Arg = unknown, Result = unknown> = 
    (arg: Arg) => { unwrap: () => Promise<Result> };
  
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!library || !libraryData) return;
        
        const validation = validateData();
        if (!validation.isValid) {
            alert(`Please fix the following errors:\n${validation.errors.join('\n')}`);
            return;
        }
        
        setIsSubmitting(true);
        setSubmissionError(null);
    
        try {
            const promises = [];
    
            const {  seatConfigurations, ...coreLibraryDetails } = library;
            promises.push(updateLibrary({ id: libraryId, data: coreLibraryDetails }).unwrap());

           const handleCrud = (
  initialItems: { id: string | number }[],
  currentItems: { id: string | number }[],
  createMutation: MutationFn<any>,
  updateMutation: MutationFn<any>,
  deleteMutation: MutationFn<string>
) => {
  const initialIds = new Set(initialItems.map(i => String(i.id)));
  const currentIds = new Set(currentItems.map(i => String(i.id)));

  initialItems.forEach(initialItem => {
    if (!currentIds.has(String(initialItem.id))) {
      promises.push(deleteMutation(String(initialItem.id)).unwrap());
    }
  });

  currentItems.forEach(currentItem => {
    const itemId = String(currentItem.id);

    if (itemId.startsWith('temp-')) {
      const { ...createData } = currentItem;
      promises.push(createMutation({ ...createData, libraryId }).unwrap());
    } else if (initialIds.has(itemId)) {
      const initialItem = initialItems.find(i => String(i.id) === itemId);
      if (JSON.stringify(initialItem) !== JSON.stringify(currentItem)) {
        promises.push(updateMutation({ id: itemId, data: currentItem }).unwrap());
      }
    }
  });
};

    
            handleCrud(timeSlotsData || [], library.timeSlots, createTimeSlot, updateTimeSlot, deleteTimeSlot);
            handleCrud(plansData || [], library.plans, createPlan, updatePlan, deletePlan);
            handleCrud(lockersData || [], library.lockers, createLocker, updateLocker, deleteLocker);
            
            const createSeatConfig = (data: any) => {
                const ranges = [];
                const seatNumbers = data.seatNumbers;
                if (seatNumbers && seatNumbers.trim()) {
                    const seatMode = data.seatType === 'Fixed' ? 'FIXED' : 
                                    data.seatType === 'Float' ? 'FLOAT' : 'SPECIAL';
                    
                    const parts = seatNumbers.split(',');
                    for (const part of parts) {
                        if (part.includes('-')) {
                            const [start, end] = part.split('-').map(num => parseInt(num.trim()));
                            ranges.push({
                                from: start,
                                to: end,
                                mode: seatMode,
                                fixedPlanId: data.seatType === 'Special' ? data.applicablePlanIds[0] : undefined,
                                lockerAutoInclude: data.attachLocker,
                                lockerId: data.attachLocker ? data.lockerTypeId : undefined,
                            });
                        } else {
                            const num = parseInt(part.trim());
                            if (!isNaN(num)) {
                                ranges.push({
                                    from: num,
                                    to: num,
                                    mode: seatMode,
                                    fixedPlanId: data.seatType === 'Special' ? data.applicablePlanIds[0] : undefined,
                                    lockerAutoInclude: data.attachLocker,
                                    lockerId: data.attachLocker ? data.lockerTypeId : undefined,
                                });
                            }
                        }
                    }
                }
                return configureSeatRanges({ libraryId, ranges }).unwrap();
            };

            for (const config of library.seatConfigurations) {
                if (String(config.id).startsWith('temp-')) {
                    promises.push(createSeatConfig(config));
                } else {
                    const existingConfig = seatConfigurations?.find(s => s.id === config.id);
                    if (existingConfig && JSON.stringify(existingConfig) !== JSON.stringify(config)) {
                        promises.push(deleteSeat(config.id).unwrap()
                            .then(() => createSeatConfig(config)));
                    }
                }
            }
            
            if (seatConfigurations) {
                const currentIds = new Set(library.seatConfigurations.map(s => s.id));
                for (const seat of seatConfigurations) {
                    if (!currentIds.has(seat.id)) {
                        promises.push(deleteSeat(seat.id).unwrap());
                    }
                }
            }
            
            handleCrud(packageRulesData || [], library.packageRules, createPackageRule, updatePackageRule, deletePackageRule);
            handleCrud(offersData || [], library.offers, createOffer, updateOffer, deleteOffer);


    
            const results = await Promise.allSettled(promises);
            
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length > 0) {
                console.error("Failed operations:", failed);
                
                const failureDetails = failed.map((result: any, index) => {
                    if (result.reason && result.reason.message) {
                        return `Error ${index + 1}: ${result.reason.message}`;
                    }
                    return `Error ${index + 1}: Unknown error`;
                }).join('\n');
                
                throw new Error(`${failed.length} item(s) failed to save.\n${failureDetails}\nPlease check the console for more details.`);
            }
    
            alert("Library information has been updated successfully!");
            router.push(`/super-admin/libraries/${libraryId}`);
    
        } catch (error: any) {
            setSubmissionError(error.message || "An unexpected error occurred while saving.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) return <div className="p-8 text-center">Loading library for editing...</div>;
    if (isErrorLibrary || !library) return <div className="p-8 text-center">Could not load library data.</div>;
    
    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="max-w-5xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md space-y-8">
                <h1 className="text-2xl font-bold text-gray-800">Edit Library: {library.libraryName}</h1>
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2 text-gray-700">Core Information</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="libraryName">Library Name</Label>
                            <Input id="libraryName" name="libraryName" value={library.libraryName} onChange={handleInputChange} placeholder="e.g., The Scholar's Nook" />
                        </div>
                        <div>
                            <Label htmlFor="contactNumber">Contact Number</Label>
                            <Input id="contactNumber" name="contactNumber" value={library.contactNumber} onChange={handleInputChange} placeholder="e.g., 9876543210" />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="address">Full Address</Label>
                            <Input id="address" name="address" value={library.address} onChange={handleInputChange} placeholder="e.g., Connaught Place" />
                        </div>
                        <div className='md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 w-full'>
                            <div>
                                <Label htmlFor="city">City</Label>
                                <Input id="city" name="city" value={library.city} onChange={handleInputChange} placeholder="e.g., Delhi" />
                            </div>
                            <div>
                                <Label htmlFor="state">State</Label>
                                <Input id="state" name="state" value={library.state} onChange={handleInputChange} placeholder="e.g., Delhi" />
                            </div>
                            <div>
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input id="pincode" name="pincode" value={library.pincode} onChange={handleInputChange} placeholder="e.g., 110001" />
                            </div>
                        </div>
                        
                        <div className="md:col-span-2">
                            <Label htmlFor="googleMapLink">Google Map Link</Label>
                            <Input id="googleMapLink" name="googleMapLink" value={library.googleMapLink || ''} onChange={handleInputChange} placeholder="Paste the full URL here" />
                        </div>
                        <div className="md:col-span-2">
                            <Label htmlFor="description">Library Description</Label>
                            <textarea id="description" name="description" value={library.description || ''} onChange={handleInputChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm md:col-span-2 h-24" placeholder="A brief description of the library's environment and amenities." />
                        </div>
                    </div>
                </fieldset>
                
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2 text-gray-700">Capacity & Timings</legend>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="totalSeats">Total Seats</Label>
                            <Input type="number" name="totalSeats" value={library.totalSeats} onChange={handleInputChange} placeholder="Total Seats" />
                        </div>
                        <div>
                            <Label>Opening Time</Label>
                            <Input type="time" name="openingTime" value={library.openingTime} onChange={handleInputChange}/>
                        </div>
                        <div>
                            <Label>Closing Time</Label>
                            <Input type="time" name="closingTime" value={library.closingTime} onChange={handleInputChange}/>
                        </div>
                    </div>
                </fieldset>
                
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2 text-gray-700">Facilities</legend>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {ALL_FACILITIES.map(facility => (
                            <label key={facility} className="flex items-center gap-2">
                                <input type="checkbox" checked={library.facilities?.includes(facility) ?? false} onChange={e => handleFacilityChange(facility, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                {facility}
                            </label>
                        ))}
                    </div>
                </fieldset>
                
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold px-2 text-gray-700">Plans, Pricing & Resources</legend>
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
                            <div className="bg-white p-6 rounded-lg shadow-inner space-y-4">
                                <h3 className="text-xl font-semibold">TimeSlot Form</h3>
                                {library.timeSlots.map((ts, index) => (
                                    <div key={ts.id} className="p-4 border rounded-lg bg-gray-50/70 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold text-gray-800">TimeSlot {index + 1}</h4>
                                            {library.timeSlots.length > 0 && <button type="button" onClick={() => removeArrayItem('timeSlots', ts.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Remove</button>}
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <Label>Slot Name</Label>
                                                <Input value={ts.name} onChange={e => updateArrayItem('timeSlots', ts.id, 'name', e.target.value)} placeholder="e.g., Morning Shift" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label>Start Time</Label>
                                                    <Input type="time" value={ts.startTime} onChange={e => updateArrayItem('timeSlots', ts.id, 'startTime', e.target.value)} />
                                                </div>
                                            <div>
                                                <Label>End Time</Label>
                                                <Input type="time" value={ts.endTime} onChange={e => updateArrayItem('timeSlots', ts.id, 'endTime', e.target.value)} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Hours (Auto-calculated)</Label>
                                            <Input value={ts.dailyHours} readOnly className="bg-gray-50" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Slot Pool</Label>
                                        <div className="flex flex-wrap gap-4">
                                            {SLOT_POOLS.map(pool => <Checkbox key={pool} label={pool} checked={ts.slotPools.includes(pool)} onChange={e => updateCheckboxArrayItem('timeSlots', ts.id, 'slotPools', pool, e.target.checked)} />)}
                                        </div>
                                    </div>
                                </div>
                                ))}
                                <button type="button" disabled={isSubmitting} onClick={() => addArrayItem('timeSlots', { name: 'New Slot', startTime: '', endTime: '', dailyHours: 0, slotPools: [] })} className="w-full font-semibold py-2 px-4 border-2 border-dashed rounded-md hover:bg-gray-100">+ Add TimeSlot</button>
                            </div>
                        )}
                        
                        {activeTab === 'plan' && (
                            <div className="bg-white p-6 rounded-lg shadow-inner space-y-4">
                                <h3 className="text-xl font-semibold">Plan Form</h3>
                                {library.plans.map((plan, index) => (
                                    <div key={plan.id} className="p-4 border rounded-lg bg-gray-50/70 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-semibold text-gray-800">Plan {index + 1}</h4>
                                            {library.plans.length > 0 && <button type="button" onClick={() => removeArrayItem('plans', plan.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Remove</button>}
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div>
                                                <Label>Hours</Label>
                                                <Input type="number" value={plan.hours} onChange={e => updateArrayItem('plans', plan.id, 'hours', e.target.value)} placeholder="e.g., 8" />
                                            </div>
                                            <div>
                                                <Label>Plan Type</Label>
                                                <Select value={plan.planType} onChange={e => updateArrayItem('plans', plan.id, 'planType', e.target.value)}>
                                                    <option value="Fixed">Fixed</option>
                                                    <option value="Float">Float</option>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label>Monthly Fee (₹)</Label>
                                                <Input type="number" value={plan.price} onChange={e => updateArrayItem('plans', plan.id, 'price', e.target.value)} placeholder="e.g., 2000" />
                                            </div>
                                        </div>
                                        {plan.planType === 'Fixed' ? (
                                            <div>
                                                <Label>Select TimeSlot</Label>
                                                <Select value={plan.timeSlotId} onChange={e => updateArrayItem('plans', plan.id, 'timeSlotId', e.target.value)}>
                                                    <option value="">Select a time slot</option>
                                                    {library.timeSlots.map(ts => <option key={ts.id} value={ts.id}>{ts.name} ({ts.startTime} - {ts.endTime})</option>)}
                                                </Select>
                                            </div>
                                        ) : (
                                            <div>
                                                <Label>Select Slot Pool(s)</Label>
                                                <div className="flex flex-wrap gap-4">
                                                    {SLOT_POOLS.map(pool => <Checkbox key={pool} label={pool} checked={plan.slotPools.includes(pool)} onChange={e => updateCheckboxArrayItem('plans', plan.id, 'slotPools', pool, e.target.checked)} />)}       
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <Label>Description</Label>
                                            <Input value={plan.description} onChange={e => updateArrayItem('plans', plan.id, 'description', e.target.value)} placeholder="e.g., Full Day Access" />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" disabled={isSubmitting} onClick={() => addArrayItem('plans', { hours: 0, planType: 'Fixed', timeSlotId: '', slotPools: [], price: 0, description: '' })} className="w-full font-semibold py-2 px-4 border-2 border-dashed rounded-md hover:bg-gray-100">+ Add Plan</button>
                            </div>
                        )}
                        
                        {activeTab === 'locker' && (
                            <div className="bg-white p-6 rounded-lg shadow-inner space-y-4">
                                <h3 className="text-xl font-semibold">Locker Form</h3>
                                {library.lockers.map((locker, index) => (
                                    <div key={locker.id} className="p-4 border rounded-lg bg-gray-50/70 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-gray-800">Locker Type {index + 1}</h4>
                                        {library.lockers.length > 0 && (<button type="button" onClick={() => removeArrayItem('lockers', locker.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Remove</button>)}
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>Locker Type Name</Label>
                                            <Input value={locker.lockerType} onChange={e => updateArrayItem('lockers', locker.id, 'lockerType', e.target.value)} placeholder="e.g., Standard, Premium" />
                                        </div>
                                        <div>
                                            <Label>Number of Lockers</Label>
                                            <Input type="number" value={locker.numberOfLockers} onChange={e => updateArrayItem('lockers', locker.id, 'numberOfLockers', e.target.value)} placeholder="e.g., 25" />
                                        </div>
                                        <div>
                                            <Label>Locker Charge (₹/month)</Label>
                                            <Input type="number" value={locker.price} onChange={e => updateArrayItem('lockers', locker.id, 'price', e.target.value)} placeholder="e.g., 300" />
                                        </div>
                                        <div className="md:col-span-3">
                                            <Label>Description</Label>
                                            <Input value={locker.description} onChange={e => updateArrayItem('lockers', locker.id, 'description', e.target.value)} placeholder="Optional details about the locker" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" disabled={isSubmitting} onClick={() => addArrayItem('lockers', { lockerType: '', numberOfLockers: 0, price: 0, description: '' })} className="w-full font-semibold py-2 px-4 border-2 border-dashed rounded-md hover:bg-gray-100">+ Add Locker Type</button>
                        </div>
                    )}
                    {activeTab === 'seat' && (
                        <div className="bg-white p-6 rounded-lg shadow-inner space-y-4">
                            <h3 className="text-xl font-semibold">Seat Management Form</h3>
                            {library.seatConfigurations.map((config, index) => (
                            <div key={config.id} className="p-4 border rounded-lg bg-gray-50/70 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-800">Seat Configuration {index + 1}</h4>
                                    {library.seatConfigurations.length > 0 && (
                                        <button 
                                            type="button" 
                                            onClick={() => removeArrayItem('seatConfigurations', config.id)} 
                                            className="text-red-500 hover:text-red-700 font-medium text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div>
                                    <Label>Seat Numbers / Range</Label>
                                    <Input 
                                        value={config.seatNumbers} 
                                        onChange={e => updateArrayItem('seatConfigurations', config.id, 'seatNumbers', e.target.value)}
                                        placeholder="e.g., 1-50 or 5, 8, 12-15" 
                                    />
                                </div>
                                <div>
                                    <Label>Seat Type</Label>
                                    <div className="flex gap-4 items-center mt-2">
                                        {['Float', 'Fixed', 'Special'].map(type => (
                                            <div key={type} className="flex items-center">
                                                <input 
                                                    id={`seatType-${config.id}-${type}`} 
                                                    type="radio" 
                                                    name={`seatType-${config.id}`} 
                                                    value={type} 
                                                    checked={config.seatType === type} 
                                                    onChange={e => updateArrayItem('seatConfigurations', config.id, 'seatType', e.target.value)} 
                                                    className="h-4 w-4" 
                                                />
                                                <label htmlFor={`seatType-${config.id}-${type}`} className="ml-2">{type} Seat</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {(config.seatType === 'Fixed' || config.seatType === 'Special') && (
                                    <div className="pt-2">
                                        <Checkbox 
                                            id={`attachLocker-${config.id}`} 
                                            label="Attach Locker" 
                                            checked={config.attachLocker} 
                                            onChange={e => updateArrayItem('seatConfigurations', config.id, 'attachLocker', e.target.checked)} 
                                        />
                                        {config.attachLocker && (
                                            <div className="mt-2 pl-6">
                                                <Label>Locker Type</Label>
                                                <Select 
                                                    value={config.lockerTypeId} 
                                                    onChange={e => updateArrayItem('seatConfigurations', config.id, 'lockerTypeId', e.target.value)}
                                                >
                                                    <option value="">Select Locker Type</option>
                                                    {library.lockers.map(locker => <option key={locker.id} value={String(locker.id)}>{locker.lockerType}</option>)}
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                )}
                            {config.seatType === 'Special' && (
                                <div>
                                    <Label>Applicable Plan(s)</Label>
                                    <Select multiple value={config.applicablePlanIds} onChange={e => updateArrayItem('seatConfigurations', config.id, 'applicablePlanIds', Array.from(e.target.selectedOptions, option => option.value))} className="h-24">
                                    {library.plans.map(plan => <option key={plan.id} value={String(plan.id)}>{plan.description}</option>)}
                                    </Select>
                                </div>
                            )}
                        </div>
                    ))}
                    <button type="button" disabled={isSubmitting} onClick={() => addArrayItem('seatConfigurations', { seatNumbers: '', seatType: 'Float', attachLocker: false, lockerTypeId: '', applicablePlanIds: [] })} className="w-full font-semibold py-2 px-4 border-2 border-dashed rounded-md hover:bg-gray-100">+ Add Seat Configuration</button>
                    </div>
                    )}
                    {activeTab === 'package' && (
                        <div className="bg-white p-6 rounded-lg shadow-inner space-y-4">
                            <h3 className="text-xl font-semibold">Package Rule Form</h3>
                            {library.packageRules.map((rule, index) => (
                                <div key={rule.id} className="p-4 border rounded-lg bg-gray-50/70 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-gray-800">Package Rule {index + 1}</h4>
                                        {library.packageRules.length > 0 && <button type="button" onClick={() => removeArrayItem('packageRules', rule.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Remove</button>}
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>Plan</Label>
                                            <Select value={rule.planId} onChange={e => updateArrayItem('packageRules', rule.id, 'planId', e.target.value)}>
                                                <option value="">Select a plan</option>
                                                {library.plans.map(p => <option key={p.id} value={String(p.id)}>{p.description}</option>)}
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Duration (Months)</Label>
                                            <Select value={rule.months} onChange={e => updateArrayItem('packageRules', rule.id, 'months', parseInt(e.target.value))}>{([1, 4, 6, 12]).map(d => <option key={d} value={d}>{d} Month(s)</option>)}</Select>
                                        </div>
                                        <div>
                                            <Label>Discount (%)</Label>
                                            <Input type="number" value={rule.percentOff ?? 0} min={0} max={100} onChange={e => updateArrayItem('packageRules', rule.id, 'percentOff', sanitizePercentOff(e.target.value))} placeholder="e.g., 10" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" disabled={isSubmitting} onClick={() => addArrayItem('packageRules', { planId: '', months: 4, percentOff: 0 })} className="w-full font-semibold py-2 px-4 border-2 border-dashed rounded-md hover:bg-gray-100">+ Add Package Rule</button>
                        </div>
                    )}
                    
                    {activeTab === 'offer' && (
                        <div className="bg-white p-6 rounded-lg shadow-inner space-y-4">
                            <h3 className="text-xl font-semibold">Offer Form</h3>
                            {library.offers.map((offer, index) => (
                                <div key={offer.id} className="p-4 border rounded-lg bg-gray-50/70 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-gray-800">Offer {index + 1}</h4>
                                        {library.offers.length > 0 && <button type="button" onClick={() => removeArrayItem('offers', offer.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Remove</button>}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Title</Label>
                                            <Input value={offer.title} onChange={e => updateArrayItem('offers', offer.id, 'title', e.target.value)} placeholder="e.g., Diwali Offer" />
                                        </div>
                                        <div>
                                            <Label>Coupon Code (Optional)</Label>
                                            <Input value={offer.couponCode} onChange={e => updateArrayItem('offers', offer.id, 'couponCode', e.target.value)} placeholder="e.g., DIWALI20" />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div>
                                            <Label>Discount Type</Label>
                                            <Select value={offer.flatAmount ? 'Flat' : '%'} onChange={e => {
                                                const isFlat = e.target.value === 'Flat';
                                                    updateArrayItem('offers', offer.id, 'flatAmount', isFlat ? (offer.discountPct || 0) : undefined);
                                                    updateArrayItem('offers', offer.id, 'discountPct', isFlat ? undefined : (offer.flatAmount || 0));
                                            }}>
                                                <option value="%">%</option>
                                                <option value="Flat">Flat</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Discount Value</Label>
                                            <Input type="number" value={offer.flatAmount ?? offer.discountPct} onChange={e => updateArrayItem('offers', offer.id, offer.flatAmount ? 'flatAmount' : 'discountPct', parseFloat(e.target.value))} placeholder="e.g., 20 or 100" />
                                        </div>
                                        <div>
                                            <Label>Max Discount (₹, Optional)</Label>
                                            <Input type="number" value={offer.maxDiscount} onChange={e => updateArrayItem('offers', offer.id, 'maxDiscount', e.target.value)} placeholder="e.g., 500" />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Valid From</Label>
                                            <Input type="date" value={offer.validFrom?.toString().split('T')[0]} onChange={e => updateArrayItem('offers', offer.id, 'validFrom', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Valid To</Label>
                                            <Input type="date" value={offer.validTo?.toString().split('T')[0]} onChange={e => updateArrayItem('offers', offer.id, 'validTo', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Applicable Plan(s)</Label>
                                        <div className="max-h-32 overflow-y-auto rounded-md border p-2 bg-white space-y-1">
                                            {library.plans.length > 0 ? (
                                                library.plans.map(plan => (
                                                <Checkbox 
                                                    key={plan.id}
                                                    id={`offer-${offer.id}-plan-${plan.id}`}
                                                    label={plan.description || `Plan ID: ${plan.id}`} 
                                                    checked={offer.planIds?.includes(String(plan.id))}
                                                    onChange={e => handlePlanSelectionChange(offer.id, String(plan.id), e.target.checked)}
                                                />
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500 px-2">No plans have been created yet.</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Applicable Slot Pool(s)</Label>
                                        <div className="flex flex-wrap gap-4">
                                            {SLOT_POOLS.map(pool => <Checkbox key={pool} label={pool} checked={offer.slotPools.includes(pool)} onChange={e => updateCheckboxArrayItem('offers', offer.id, 'slotPools', pool, e.target.checked)} />)}
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Checkbox id={`newUsers-${offer.id}`} label="For New Users Only" checked={offer.newUsersOnly} onChange={e => updateArrayItem('offers', offer.id, 'newUsersOnly', e.target.checked)} />
                                        <Checkbox id={`oncePerUser-${offer.id}`} label="Once Per User" checked={offer.oncePerUser} onChange={e => updateArrayItem('offers', offer.id, 'oncePerUser', e.target.checked)} />

                                    </div>
                                </div>
                            ))}
                            <button type="button" disabled={isSubmitting} onClick={() => addArrayItem('offers', { title: '', couponCode: '', discountPct: 0, maxDiscount: 0, validFrom: '', validTo: '', slotPools: [], planIds: [], newUsersOnly: false, oncePerUser: false })} className="w-full font-semibold py-2 px-4 border-2 border-dashed rounded-md hover:bg-gray-100">+ Add Offer</button>
                        </div>
                    )}
                </div>
            </fieldset>
                {submissionError && (
                    <div className="p-3 my-4 text-sm text-red-800 rounded-lg bg-red-50 text-center" role="alert">
                        <strong>Error:</strong> {submissionError}
                    </div>
                )}
                <div className="flex justify-end gap-4 pt-4">
                    <button 
                        type="button" 
                        onClick={() => router.back()} 
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || isLoading}
                        className={`px-6 py-2 ${isSubmitting || isLoading ? 'bg-green-400' : 'bg-green-600'} text-white rounded-md hover:bg-green-700 font-semibold`}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}