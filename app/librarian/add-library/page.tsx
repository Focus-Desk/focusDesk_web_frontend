// page.tsx
'use client';

import { useEffect, useState } from 'react';
import ProgressBar from '@/components/library/progressBar';
import BasicDetailsForm from '@/components/library/basicDetailsForm';
import DetailedListingForm from '@/components/library/detailedListingForm';
import PlansAndPricingForm from '@/components/library/plansAndPricingForm';
import LibrarianDetailsForm from '@/components/library/librarianDetails';
import { useGetAuthUserQuery } from '@/state/api';
// Import the persistent state hook
import { usePersistedFormState } from '@/lib/hooks/usePersistedFormState'; 

type DetailedData = { [key: string]: any };
type LibrarianData = { [key: string]: any };

// ---------------------------------------------------------------------
// UNIFIED DATA STRUCTURE
// ---------------------------------------------------------------------
interface OnboardingData {
    // Auth/Librarian Data (Shared)
    librarianId: string | null;
    cognitoId: string;
    email: string;
    firstName: string;
    lastName: string;

    // Step 1: BasicDetailsForm
    libraryName: string;
    address: string;
    contactNumber: string;
    personName: string;
    interestedInListing: boolean;

    // Step 2: DetailedListingForm
    libraryAddress: string;
    city: string;
    state: string;
    pincode: string;
    libraryContactNo: string;
    googleMapLink: string;
    totalSeats: string;
    openingTime: string;
    closingTime: string;
    managerName: string;
    managerPhone: string;
    managerEmail: string;

    // Step 3: PlansAndPricingForm - (Only passing libraryId, complex state managed locally in Step 3)
    libraryId: string | null;

    // Step 4: LibrarianDetailsForm (KYC)
    kyc_firstName: string; 
    kyc_lastName: string;
    username: string;
    dateOfBirth: string;
    alternateContactNumber: string;
    panNumber: string;
    aadhaarNumber: string;
    addressProofType: string;
    accountHolderName: string;
    bankName: string;
    bankAccountNumber: string;
    bankIfsc: string;
    gstin: string;
    country: string;
    // Additional storage for complex arrays of Step 3 (optional, but good for persistence)
    pricingData: any; 
}

const initialOnboardingData: OnboardingData = {
    librarianId: null, cognitoId: '', email: '', firstName: '', lastName: '',
    libraryName: '', address: '', contactNumber: '', personName: '', interestedInListing: false,
    libraryAddress: '', city: '', state: '', pincode: '', libraryContactNo: '', googleMapLink: '',
    totalSeats: '', openingTime: '09:00', closingTime: '21:00', managerName: '', managerPhone: '', managerEmail: '',
    libraryId: null,
    kyc_firstName: '', kyc_lastName: '', username: '', dateOfBirth: '', alternateContactNumber: '',
    panNumber: '', aadhaarNumber: '', addressProofType: 'Aadhaar Card', accountHolderName: '',
    bankName: '', bankAccountNumber: '', bankIfsc: '', gstin: '',
    country: '',
    pricingData: null,
};
// ---------------------------------------------------------------------


export default function AddLibraryPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [highestCompletedStep, setHighestCompletedStep] = useState<number>(0);
    
    // NEW: Use persistent state for all form data
    const [formData, setFormData] = usePersistedFormState<OnboardingData>(
        'libraryOnboardingData', 
        initialOnboardingData
    );

    const { data: authUserData, isLoading, refetch } = useGetAuthUserQuery();

    // Helper to update the persisted state
    const updateFormData = (data: Partial<OnboardingData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    // 1. Initial Load Effect: Load Step/Highest Completed Step from localStorage
    useEffect(() => {
        if(typeof window !== 'undefined') {
            try {
                const storedStep = localStorage.getItem('currentStep');
                if (storedStep) setCurrentStep(parseInt(storedStep, 10));
            } catch (error) {
                console.error('Error restoring meta state:', error);
            }
        }
    }, []);

    // 2. Sync Auth data into the persisted form data (Pre-filling logic)
    useEffect(() => {
        if (authUserData) {
            const updates: Partial<OnboardingData> = {
                cognitoId: authUserData.cognitoInfo.userId,
                email: authUserData.userInfo.email,
                librarianId: authUserData.userInfo.id,
                firstName: authUserData.userInfo.firstName,
                lastName: authUserData.userInfo.lastName,
            };

            // Conditionally pre-fill only if the form field is currently empty 
            if (!formData.personName) updates.personName = authUserData.userInfo.firstName + ' ' + authUserData.userInfo.lastName;
            if (!formData.email) updates.email = authUserData.userInfo.email;
            if (!formData.kyc_firstName) updates.kyc_firstName = authUserData.userInfo.firstName;
            if (!formData.kyc_lastName) updates.kyc_lastName = authUserData.userInfo.lastName;
            
            // Apply updates
            if (Object.keys(updates).length > 0) {
                 setFormData(prev => ({ ...prev, ...updates }));
            }
        }
    }, [authUserData]); // Depend on authUserData

    const updateCurrentStep = (step: number) => {
        setCurrentStep(step);
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentStep', step.toString());
        }
    };

    const handleStepClick = (step: number) => {
        if (step <= highestCompletedStep) {
            updateCurrentStep(step);
        }
    };

    // SUCCESS HANDLERS: Update step/max completed step and libraryId if needed.
    const handleBasicSuccess = (data: any, newLibraryId: string) => {
        updateFormData({ libraryId: newLibraryId }); // Ensure libraryId is saved globally
        updateCurrentStep(2);
        setHighestCompletedStep(prev => Math.max(prev, 1));
    };

    const handleDetailedSuccess = (data: DetailedData) => {
        updateCurrentStep(3);
        setHighestCompletedStep(prev => Math.max(prev, 2));
    };

    const handlePricingSuccess = (data: any) => {
        // Step 3 will save its complex array data into formData.pricingData directly.
        updateCurrentStep(4);
        setHighestCompletedStep(prev => Math.max(prev, 3));
    };

    const handleLibrarianSuccess = async (librarianData: LibrarianData) => {
        setHighestCompletedStep(prev => Math.max(prev, 4));
        
        // OPTIONAL: Clear persistence on successful final submission
        if (typeof window !== 'undefined') {
            localStorage.removeItem('libraryOnboardingData');
            localStorage.removeItem('currentStep');
        }
    };

    const renderCurrentStep = () => {
        const libraryId = formData.libraryId; // Use persisted libraryId

        // Props object for data sharing
        const sharedProps = {
            setCurrentStep: setCurrentStep,
            formData: formData,
            updateFormData: updateFormData,
        };

        switch (currentStep) {
            case 1:
                return <BasicDetailsForm 
                    {...sharedProps}
                    cognitoId={formData.librarianId} 
                    isReadOnly={highestCompletedStep >= 1} 
                    onSuccess={handleBasicSuccess}
                />;
            case 2:
                return <DetailedListingForm 
                    {...sharedProps}
                    libraryId={libraryId! } 
                    isReadOnly={highestCompletedStep >= 2} 
                    onSuccess={handleDetailedSuccess} 
                />;
            case 3:
                return <PlansAndPricingForm 
                    {...sharedProps}
                    libraryId={libraryId!}  
                    isReadOnly={highestCompletedStep >= 3}
                    onSuccess={handlePricingSuccess}
                />;
            case 4:
                return <LibrarianDetailsForm
                    {...sharedProps}
                    cognitoId={formData.cognitoId}
                    email={formData.email}
                    isReadOnly={highestCompletedStep > 4}
                    onSuccess={handleLibrarianSuccess}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                {isLoading && (
                    <div className="mb-2 text-sm text-blue-600 flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Refreshing...
                    </div>
                )}
                <div className="mb-12">
                    <ProgressBar currentStep={currentStep} highestCompletedStep={highestCompletedStep} onStepClick={handleStepClick} />
                </div>
                
                <main className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                    {renderCurrentStep()}
                </main>
            </div>
        </div>
    );
}