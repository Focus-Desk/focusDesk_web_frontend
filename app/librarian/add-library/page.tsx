// page.tsx
'use client';
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from 'react';
import ProgressBar from '@/components/library/progressBar';
import BasicDetailsForm from '@/components/library/basicDetailsForm';
import DetailedListingForm from '@/components/library/detailedListingForm';
import PlansAndPricingForm from '@/components/library/plansAndPricingForm';
import LibrarianDetailsForm from '@/components/library/librarianDetails';
import { useGetAuthUserQuery, useGetOnboardingStatusQuery } from '@/state/api';

type DetailedData = { [key: string]: any };
type LibrarianData = { [key: string]: any };

// ---------------------------------------------------------------------
// UNIFIED DATA STRUCTURE
// ---------------------------------------------------------------------
interface OnboardingData {
    // Auth/Librarian Data (Shared)
    librarianId: string | null;
    userId: string;
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
    librarianId: null, userId: '', email: '', firstName: '', lastName: '',
    libraryName: '', address: '', contactNumber: '', personName: '', interestedInListing: false,
    libraryAddress: '', city: '', state: '', pincode: '', googleMapLink: '',
    totalSeats: '', openingTime: '09:00', closingTime: '21:00', managerName: '', managerPhone: '', managerEmail: '',
    libraryId: null,
    kyc_firstName: '', kyc_lastName: '', dateOfBirth: '', alternateContactNumber: '',
    panNumber: '', aadhaarNumber: '', addressProofType: 'Aadhaar Card', accountHolderName: '',
    bankName: '', bankAccountNumber: '', bankIfsc: '', gstin: '',
    country: '',
    pricingData: null,
};
// ---------------------------------------------------------------------


export default function AddLibraryPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [highestCompletedStep, setHighestCompletedStep] = useState<number>(0);

    const [formData, setFormData] = useState<OnboardingData>(initialOnboardingData);

    const { data: authUserData, isLoading: isAuthLoading } = useGetAuthUserQuery();
    const { data: onboardingData, isLoading: isOnboardingLoading } = useGetOnboardingStatusQuery();

    const isLoading = isAuthLoading || isOnboardingLoading;

    // Helper to update the form state
    const updateFormData = (data: Partial<OnboardingData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    // 1. Initial Load Effect: Sync from Backend Onboarding Status
    useEffect(() => {
        if (onboardingData) {
            setHighestCompletedStep(onboardingData.highestCompletedStep || 0);
            setCurrentStep(onboardingData.currentStep || 1);
            
            if (onboardingData.data) {
                // Merge backend data with our initial state structure
                setFormData(prev => ({
                    ...prev,
                    ...onboardingData.data
                }));
            }
        }
    }, [onboardingData]);

    // 2. Sync Auth data into the form data (Pre-filling logic)
    useEffect(() => {
        if (authUserData) {
            const updates: Partial<OnboardingData> = {
                userId: authUserData.userInfo.userId,
                email: authUserData.userInfo.email,
                librarianId: authUserData.userInfo.userId,
                firstName: authUserData.userInfo.firstName || '',
                lastName: authUserData.userInfo.lastName || '',
            };

            // Conditionally pre-fill only if the form field is currently empty 
            const fullName = [authUserData.userInfo.firstName, authUserData.userInfo.lastName].filter(Boolean).join(' ');
            if (!formData.personName && fullName) updates.personName = fullName;
            if (!formData.email) updates.email = authUserData.userInfo.email;
            if (!formData.kyc_firstName && authUserData.userInfo.firstName) updates.kyc_firstName = authUserData.userInfo.firstName;
            if (!formData.kyc_lastName && authUserData.userInfo.lastName) updates.kyc_lastName = authUserData.userInfo.lastName;

            // Apply updates
            if (Object.keys(updates).length > 0) {
                setFormData(prev => ({ ...prev, ...updates }));
            }
        }
    }, [authUserData]); // Depend on authUserData

    const updateCurrentStep = (step: number) => {
        setCurrentStep(step);
    };

    const handleStepClick = (step: number) => {
        if (step <= highestCompletedStep) {
            updateCurrentStep(step);
        }
    };

    // SUCCESS HANDLERS: Update step/max completed step and libraryId if needed.
    const handleBasicSuccess = (_data: any, newLibraryId: string) => {
        updateFormData({ libraryId: newLibraryId }); // Ensure libraryId is saved globally
        updateCurrentStep(2);
        setHighestCompletedStep(prev => Math.max(prev, 1));
    };

    const handleDetailedSuccess = (_data: DetailedData) => {
        updateCurrentStep(3);
        setHighestCompletedStep(prev => Math.max(prev, 2));
    };

    const handlePricingSuccess = (_data: any) => {
        // Step 3 will save its complex array data into formData.pricingData directly.
        updateCurrentStep(4);
        setHighestCompletedStep(prev => Math.max(prev, 3));
    };

    const handleLibrarianSuccess = async (_librarianData: LibrarianData) => {
        setHighestCompletedStep(prev => Math.max(prev, 4));
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
                    userId={formData.librarianId}
                    isReadOnly={highestCompletedStep >= 1}
                    onSuccess={handleBasicSuccess}
                />;
            case 2:
                return <DetailedListingForm
                    {...sharedProps}
                    libraryId={libraryId!}
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
                    userId={formData.userId}
                    email={formData.email}
                    isReadOnly={highestCompletedStep > 4}
                    onSuccess={handleLibrarianSuccess}
                />;
            default:
                return null;
        }
    };

    if (highestCompletedStep >= 4 && !isLoading) {
        return (
            <div className="bg-gray-50 min-h-screen py-12 flex flex-col items-center justify-center px-4">
                <div className="bg-white p-8 rounded-xl shadow-md max-w-md text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Library Already Registered</h2>
                    <p className="text-gray-600 mb-6">
                        You already have a fully registered library in the system. To manage your library, please use your dashboard.
                    </p>
                    <a href="/librarian/dashboard" className="px-6 py-2 bg-[#2a2a2a] text-[#ffd100] font-semibold rounded-md hover:bg-[#3f3f3f] transition">
                        Go to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                {isLoading && (
                    <div className="mb-2 text-sm text-blue-600 flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading your details...
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