'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { useOnboardLibrarianMutation, useUploadProfilePhotoMutation, useUploadAddressProofMutation } from '../../state/api'; 
import { SubmitButton } from '@/components/ui/submitButton';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import React from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';


const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select 
        className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
        {...props}
    >
        {children}
    </select>
);

type FormProps = {
  cognitoId: string;
  email: string;
  isReadOnly: boolean;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  onSuccess: (data: any) => void;
};

export default function LibrarianDetailsForm({ cognitoId, email, isReadOnly, setCurrentStep, onSuccess }: FormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    dateOfBirth: '',
    contactNumber: '',
    alternateContactNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    panNumber: '',
    aadhaarNumber: '',
    addressProofType: 'Aadhaar Card',
    accountHolderName: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    gstin: '',
  });
const router = useRouter();
  const [ profilePhoto, setProfilePhoto ] = useState<File | null>(null);
  const [ profilePhotoPreview, setProfilePhotoPreview ] = useState<string>('');
  const [ addressProof, setAddressProof ] = useState<File | null>(null);
  const [ addressProofPreview, setAddressProofPreview ] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [onboardLibrarian, { isLoading: isOnboarding }] = useOnboardLibrarianMutation();
  const [uploadProfilePhoto, { isLoading: isUploadingPhoto }] = useUploadProfilePhotoMutation();
  const [uploadAddressProof, { isLoading: isUploadingProof }] = useUploadAddressProofMutation();


 

  const isLoading = isOnboarding || isUploadingPhoto || isUploadingProof ;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
//     if (e.target.files && e.target.files[0]) {
//         setter(e.target.files[0]);
//     }
//   };

    const handleFileUpload = (
        event: React.ChangeEvent<HTMLInputElement>,
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPreview: React.Dispatch<React.SetStateAction<string>>
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleFileDelete = (
        inputId: string,
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPreview: React.Dispatch<React.SetStateAction<string>>,
        currentPreview: string
    ) => {
        const fileInput = document.getElementById(inputId) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        setFile(null);
        
        if (currentPreview) {
            URL.revokeObjectURL(currentPreview);
            setPreview('');
        }
    };

    const handleNext = () => {
        setCurrentStep(4);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiStatus('idle');
        setErrorMessage('');

        try {
            if(!addressProof) {
                throw new Error("Address proof document is required.");
            }

            const payload = {
                ...formData,
                cognitoId,
                email,
                profilePhoto,
                addressProof,
            };

            console.log("Submitting librarian details:", payload);
            const result = await onboardLibrarian(payload).unwrap();
            router.push(`/librarian/dashboard`);
            setApiStatus('success');
            onSuccess(result);

        } catch (error: any) {
            setApiStatus('error');
            setErrorMessage(error.data?.message || error.message || "An unexpected error occurred.");

        }
    };

    return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2">Step 4: Your Details (KYC)</h2>
        <p className="text-gray-600 mb-6">Please provide your personal and bank details for verification.</p>
        <form onSubmit={handleSubmit} className="space-y-8">
            <fieldset>
                <legend className="text-xl font-semibold text-gray-800 mb-4">Personal Information</legend>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="profilePhoto">Profile Photo</Label>
                        <div className="w-full h-32 bg-gray-50 flex items-center justify-center relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                            {profilePhotoPreview ? (
                                <>
                                    <img src={profilePhotoPreview} alt="Profile Photo Preview" className="w-full h-full object-cover" />
                                    {!isReadOnly && (
                                        <button 
                                            type="button" 
                                            onClick={() => handleFileDelete('profilePhotoInput', setProfilePhoto, setProfilePhotoPreview, profilePhotoPreview)}
                                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" 
                                            aria-label="Delete profile photo"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <label className="text-gray-400 w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100">
                                    <span>Upload</span>
                                    <input 
                                        id="profilePhotoInput" 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleFileUpload(e, setProfilePhoto, setProfilePhotoPreview)} 
                                        disabled={isReadOnly} 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            </fieldset>
        
        <fieldset><legend className="text-xl font-semibold text-gray-800 mb-4">Contact & Address</legend>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input id="contactNumber" name="contactNumber" type="tel" pattern='[0-9]{10}' value={formData.contactNumber} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="alternateContactNumber">Alternate Contact (Optional)</Label>
                    <Input id="alternateContactNumber" name="alternateContactNumber" type="tel" value={formData.alternateContactNumber} onChange={handleChange} />
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} required />
                </div>
            </div>
        </fieldset>

        <fieldset>
            <legend className="text-xl font-semibold text-gray-800 mb-4">Identity & Bank Details</legend>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input id="panNumber" name="panNumber" value={formData.panNumber} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                    <Input id="aadhaarNumber" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="addressProofType">Address Proof Type</Label>
                    <Select id="addressProofType" name="addressProofType" value={formData.addressProofType} onChange={handleChange}>
                        <option>Aadhaar Card</option>
                        <option>Passport</option>
                        <option>Voter ID Card</option> 
                        <option>Driving License</option>
                    </Select>
                </div>
                <div>
                    <div className="space-y-2">
                        <Label htmlFor="addressProofInput">Upload Address Proof</Label>
                        <div className="w-full h-32 bg-gray-50 flex items-center justify-center relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                            {addressProofPreview ? (
                            <>
                            <img src={addressProofPreview} alt="Adress Proof Preview" className="w-full h-full object-cover" />
                            {!isReadOnly && (
                                <button 
                                    type="button" 
                                    onClick={ () => handleFileDelete('addressProofInput', setAddressProof, setAddressProofPreview, addressProofPreview) } 
                                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" 
                                    aria-label="Delete address proof"
                                >
                                    <X size={16} />
                                </button>
                            )}
                            </>
                            ) : (
                            <label className="text-gray-400 w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100">
                                <span>Upload</span>
                                <input 
                                    id="addressProofInput" 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleFileUpload(e, setAddressProof, setAddressProofPreview)} 
                                    disabled={isReadOnly} 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                />
                            </label>
                            )}
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2 border-t pt-4 mt-4"></div>
                <div>
                    <Label htmlFor="accountHolderName">Account Holder Name</Label>
                    <Input id="accountHolderName" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input id="bankName" name="bankName" value={formData.bankName} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                    <Input id="bankAccountNumber" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} required />
                </div>
                <div>
                    <Label htmlFor="bankIfsc">IFSC Code</Label>
                    <Input id="bankIfsc" name="bankIfsc" value={formData.bankIfsc} onChange={handleChange} required />
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="gstin">GSTIN (Optional)</Label>
                    <Input id="gstin" name="gstin" value={formData.gstin} onChange={handleChange} />
                </div>
            </div>
        </fieldset>

        {apiStatus === 'success' && <div className="p-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
            <strong>Success!</strong> Your details have been submitted.
        </div>}
        {apiStatus === 'error' && <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
            <strong>Error:</strong> {errorMessage}
        </div>}
        
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
            (<SubmitButton isLoading={isLoading} ></SubmitButton>)}
        </div>
        </form>
    </div>
    );
}