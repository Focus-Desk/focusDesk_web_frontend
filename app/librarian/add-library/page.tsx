'use client';

import { useEffect, useState } from 'react';
import ProgressBar from '@/components/library/progressBar';
import BasicDetailsForm from '@/components/library/basicDetailsForm';
import DetailedListingForm from '@/components/library/detailedListingForm';
import PlansAndPricingForm from '@/components/library/plansAndPricingForm';
import LibrarianDetailsForm from '@/components/library/librarianDetails';
import { useGetAuthUserQuery } from '@/state/api';

type DetailedData = { [key: string]: any };
// type Plan = { [key: string]: any };
// type Locker = { [key: string]: any };
type LibrarianData = { [key: string]: any };

// const MOCK_COGNITO_ID = "test-cognito-id-123456"; 
// const MOCK_EMAIL = "test@example.com";
// const MOCK_LIBRARY_ID = "test-library-id-123456";

export default function AddLibraryPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [libraryId, setLibraryId] = useState<string | null>(null);
  const [highestCompletedStep, setHighestCompletedStep] = useState<number>(0);
  const [ basicLibraryInfo, setBasicLibraryInfo ] = useState<basicLibraryDetailsType>({
    libraryName: '',
    address: '',
    contactNumber: '',
    personName: '',
    email: '',
    interestedInListing: false
  });

  const { data: authUserData, isLoading, refetch } = useGetAuthUserQuery();

  

  useEffect(() => {
    if (authUserData && typeof window !== 'undefined') {
      localStorage.setItem('authUserData', JSON.stringify({
        cognitoId: authUserData.cognitoInfo.userId,
        email: authUserData.userInfo.email,
        librarianId: authUserData.userInfo.id, // database ID 
        firstName: authUserData.userInfo.firstName,
        lastName: authUserData.userInfo.lastName
      }));
    }
  }, [authUserData]);

  useEffect(() => {
    if(typeof window !== 'undefined')
    {
      try {
        const storedStep = localStorage.getItem('currentStep');
        const storedLibraryId = localStorage.getItem('libraryId');
        const storedBasicInfo = localStorage.getItem('basicLibraryInfo');
        
        if (storedStep) setCurrentStep(parseInt(storedStep, 10));
        if (storedLibraryId) setLibraryId(storedLibraryId);
        if (storedBasicInfo) {
            const parsedInfo = JSON.parse(storedBasicInfo);
            setBasicLibraryInfo(parsedInfo);
        }
      } catch (error) {
          console.error('Error restoring form state from localStorage:', error);
      }
    }
  }, []);

  const getAuthData = () => {
    if (authUserData) {
      return {
        cognitoId: authUserData.cognitoInfo.userId,
        email: authUserData.userInfo.email, // Or authUserData.cognitoInfo.attributes.email
        librarianId: authUserData.userInfo.id,
        firstName: authUserData.userInfo.firstName,
        lastName: authUserData.userInfo.lastName
      };
    }
    
    if (typeof window !== 'undefined') {
      const storedAuthData = localStorage.getItem('authUserData');
      if (storedAuthData) {
        try {
          return JSON.parse(storedAuthData);
        } catch (e) {
          console.error('Error parsing stored auth data', e);
        }
      }
    }

    return {
      cognitoId: 'noCognitoId',
      email: 'noEmail',
      librarianId: null,
      firstName: '',
      lastName: ''
    };
  };

  const updateCurrentStep = (step: number) => {
    setCurrentStep(step);

    if (typeof window !== 'undefined') {
      localStorage.setItem('currentStep', step.toString());
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= highestCompletedStep) {
      setCurrentStep(step + 1);
    }
  };

  const handleBasicSuccess = (data: basicLibraryDetailsType, newLibraryId: string) => {
    setBasicLibraryInfo(data)
    setLibraryId(newLibraryId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('libraryId', newLibraryId);
      localStorage.setItem('basicLibraryInfo', JSON.stringify(data));
    }
    updateCurrentStep(2);
    console.log("handle handleBasicSuccess", data, newLibraryId)
    setHighestCompletedStep(prev => Math.max(prev, 1));
  };

  const handleDetailedSuccess = (data: DetailedData) => {
    console.log("Detailed data of library = ", data);
    updateCurrentStep(3);
    setHighestCompletedStep(prev => Math.max(prev, 2));
  };

  
  const handlePricingSuccess = (data: any) => {
    console.log({ plans: data.plans, lockers: data.lockers });
    updateCurrentStep(4);
    setHighestCompletedStep(prev => Math.max(prev, 3));
  };

  const handleLibrarianSuccess = async (librarianData: LibrarianData) => {
    try {
      // Force a fresh check with the server
      const result = await refetch();
      
      if (!result.data) {
        alert("Unable to verify your account. Please refresh and try again.");
        return;
      }
      
      console.log("Verified user:", result);
      console.log("Librarian data:", librarianData);
      setHighestCompletedStep(prev => Math.max(prev, 4));
      
      // Continue with form completion...
      
    } catch (error) {
      console.error("Error verifying user account:", error);
      alert("Error verifying your account. Please refresh and try again.");
    }
  };

  const renderCurrentStep = () => {
    const userData = getAuthData();

    switch (currentStep) {
      case 1:
        return <BasicDetailsForm 
          cognitoId={userData.librarianId} 
          isReadOnly={highestCompletedStep >= 1} 
          setCurrentStep={setCurrentStep}
          onSuccess={handleBasicSuccess} />;
      case 2:
        return <DetailedListingForm 
          libraryId={libraryId! } 
          initialData={basicLibraryInfo!} 
          isReadOnly={highestCompletedStep >= 2} 
          setCurrentStep={setCurrentStep}
          onSuccess={handleDetailedSuccess} />;
      case 3:
        return <PlansAndPricingForm 
          libraryId={libraryId!}  
          isReadOnly={highestCompletedStep >= 3}
          setCurrentStep={setCurrentStep}
          onSuccess={handlePricingSuccess} />;
      case 4:
        return <LibrarianDetailsForm
          cognitoId={userData.cognitoId}
          email={userData.email}
          isReadOnly={highestCompletedStep > 4}
          setCurrentStep={setCurrentStep}
          onSuccess={handleLibrarianSuccess} />;
      default:
        return <BasicDetailsForm 
          cognitoId={userData.librarianId} 
          isReadOnly={highestCompletedStep >= 1}
          setCurrentStep={setCurrentStep}
          onSuccess={handleBasicSuccess} />;
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