'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateLibraryStep1Mutation } from '@/state/api';
import { SubmitButton } from '@/components/ui/submitButton';
import React from 'react';
// import router from 'next/router';

export default function BasicDetailsForm({ cognitoId, isReadOnly, setCurrentStep, onSuccess } : { cognitoId: string; isReadOnly: boolean; setCurrentStep: Dispatch<SetStateAction<number>>; onSuccess: (data: basicLibraryDetailsType, libraryId: string) => void }) {
    const [formData, setFormData] = useState<basicLibraryDetailsType>({
        libraryName: '',
        address: '',
        contactNumber: '',
        personName: '',
        email: '',
        interestedInListing: false
    });
    isReadOnly=false
    const [createLibraryStep1, { isLoading }] = useCreateLibraryStep1Mutation();
    const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiStatus('idle');
        setErrorMessage('');
        
        try {
            if (!cognitoId){
                throw new Error("Librarian ID is not available. Cannot create library.");
            }
           
            const payload = {
                librarianId: cognitoId,
                libraryName: formData.libraryName,
                address: formData.address,
                contactNumber: formData.contactNumber,
                contactPersonName: formData.personName,
                email: formData.email,
                interestedInListing: formData.interestedInListing
            };

            console.log("Submitting basic details the:", payload);
            const result = await createLibraryStep1(payload).unwrap();
            
            setApiStatus('success');
           
            onSuccess(result,result.data.id);
            console.log("uploaded basic details:", result , result.data.id);
         
        } catch (error: any) {
            setApiStatus('error');
            setErrorMessage(error.data?.message || "An unexpected error occurred.");
        }
    };

    const handleNext = () => {
        // This function is for the "Next" button in read-only mode
        setCurrentStep(2);
    };

    return (
        <div className="form-container space-y-10">
            <h2 className='text-2xl mb-2'>Step 1: Basic Library Details</h2>
            <form onSubmit={handleSubmit} className="form-layout flex flex-col space-y-6">
                
                <div>
                    <Label className='mb-2'>Library Name</Label>
                    <Input
                        placeholder="Enter Library Name"
                        name="libraryName"
                        value={formData?.libraryName}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        required
                    />
                </div>

                <div>
                    <Label className='mb-2'>Library Address</Label>
                    <Input
                        placeholder="Enter Library Address"
                        name="address"
                        value={formData?.address}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        required
                    />
                </div>

                <div className='grid md:grid-cols-2 gap-4'>
                    <div>
                        <Label className='mb-2'>Library Phone Number</Label>
                        <Input
                            placeholder="Enter Library Phone Number"
                            name="contactNumber"
                            value={formData?.contactNumber}
                            type='tel'
                            pattern='[0-9]{10}'
                            onChange={handleChange}
                            disabled={isReadOnly}
                            required
                        />
                    </div>

                    <div>
                        <Label className='mb-2'>Contact Person Name</Label>
                        <Input
                            placeholder="Enter Contact Person Name"
                            name="personName"
                            value={formData?.personName}
                            onChange={handleChange}
                            disabled={isReadOnly}
                            required
                        />
                    </div>
                </div>
                

                <div>
                    <Label className='mb-2'>Library Email</Label>
                    <Input
                        placeholder="Enter Library Email"
                        name="email"
                        value={formData?.email}
                        onChange={handleChange}
                        disabled={isReadOnly}
                    />
                </div>

                <div className='flex items-center gap-10'>
                    <Label className='mb-0' htmlFor='interestedInListing'>Are you interested in listing your library? </Label>
                    <input type="checkbox" name="interestedInListing" id="interestedInListing" className='w-4 h-4' checked={formData.interestedInListing} disabled={isReadOnly} onChange={handleChange} />
                </div>

                {apiStatus === 'error' && <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert"><strong>Error:</strong> {errorMessage}</div>}


            {isReadOnly ? (
            <button type="button" onClick={handleNext} className="w-full border-0 rounded-xl p-3 bg-gray-500 text-white text-lg font-bold cursor-pointer transition-all duration-300 hover:bg-gray-600">
                    Next
            </button>
            ) :
            (<SubmitButton isLoading={isLoading}></SubmitButton>)
            }
            </form>
        </div>
    );
}