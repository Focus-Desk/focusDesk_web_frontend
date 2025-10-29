// librarianDetails.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */

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

// Define the required props/data slice (using the unified OnboardingData from page.tsx)
interface OnboardingDataSlice {
    // KYC Fields
    kyc_firstName: string;
    kyc_lastName: string;
    username: string;
    dateOfBirth: string;
    contactNumber: string;
    alternateContactNumber: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    panNumber: string;
    aadhaarNumber: string;
    addressProofType: string;
    accountHolderName: string;
    bankName: string;
    bankAccountNumber: string;
    bankIfsc: string;
    gstin: string;
}

type FormProps = {
    cognitoId: string;
    email: string;
    isReadOnly: boolean;
    setCurrentStep: Dispatch<SetStateAction<number>>;
    onSuccess: (data: any) => void;
    // NEW PROPS
    formData: OnboardingDataSlice;
    updateFormData: (data: Partial<OnboardingDataSlice>) => void;
};

// Regex and Constants for validation
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const AADHAAR_REGEX = /^[0-9]{12}$/; // Assuming 12 digit Aadhaar
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/; // Basic IFSC format check
const MIN_BANK_ACCOUNT_LENGTH = 9;

// NEW: File Validation Constants
const MAX_PHOTO_SIZE_MB = 5;
const ALLOWED_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png'];

// NEW: File Validation Helper Function
const validateFile = (file: File, maxSizeMB: number, allowedTypes: string[], name: string): string => {
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
        return `${name} is too large. Max size is ${maxSizeMB}MB.`;
    }
    if (!allowedTypes.includes(file.type)) {
        return `${name} has an invalid format. Allowed formats: JPEG, PNG.`;
    }
    return '';
};


export default function LibrarianDetailsForm({ cognitoId, email, isReadOnly, setCurrentStep, onSuccess, formData, updateFormData }: FormProps) {
    // REMOVED: Initial formData useState
    const router = useRouter();
    
    // File states remain local
    const [ profilePhoto, setProfilePhoto ] = useState<File | null>(null);
    const [ profilePhotoPreview, setProfilePhotoPreview ] = useState<string>('');
    const [ addressProof, setAddressProof ] = useState<File | null>(null);
    const [ addressProofPreview, setAddressProofPreview ] = useState<string>('');
    
    const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // State for real-time validation errors
    const [validationErrors, setValidationErrors] = useState({
        panNumber: '',
        aadhaarNumber: '',
        bankAccountNumber: '',
        bankIfsc: '',
        contactNumber: '',
        profilePhoto: '', 
        addressProof: '', 
    });
// NEW: Local state for Pincode validation error
const [pincodeError, setPincodeError] = useState('');

    const [onboardLibrarian, { isLoading: isOnboarding }] = useOnboardLibrarianMutation();
    const [uploadProfilePhoto, { isLoading: isUploadingPhoto }] = useUploadProfilePhotoMutation();
    const [uploadAddressProof, { isLoading: isUploadingProof }] = useUploadAddressProofMutation();


    const isLoading = isOnboarding || isUploadingPhoto || isUploadingProof ;

    // UPDATED: Default handler now updates the persisted state via prop
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
      // If the field is pincode, use the dedicated handler
      if (name === 'pincode') {
        handlePincodeChange(value);
    } else {
        updateFormData({ [name]: value });
    }
    };

    // NEW: Pincode handler
    const handlePincodeChange = (value: string) => {
        // Allow only numeric input, max 6 digits
        const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
        let error = '';

        if (numericValue.length > 0 && numericValue.length !== 6) {
            error = 'Pincode must be exactly 6 digits.';
        }
        
        setPincodeError(error);
        updateFormData({ pincode: numericValue });
    };

    // UPDATED: Handler for sensitive identity and bank fields with formatting and validation
    const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let newValue = value;
        let error = '';

        if (name === 'panNumber') {
            newValue = value.toUpperCase().slice(0, 10);
            if (newValue.length === 10 && !PAN_REGEX.test(newValue)) {
                error = 'Invalid PAN format (e.g., ABCDE1234F).';
            } else if (newValue.length > 0 && newValue.length < 10) {
                error = 'PAN must be 10 characters.';
            }
        } else if (name === 'aadhaarNumber') {
            newValue = value.replace(/[^0-9]/g, '').slice(0, 12);
            if (newValue.length > 0 && newValue.length < 12) {
                error = 'Aadhaar must be 12 digits.';
            } else if (newValue.length === 12 && !AADHAAR_REGEX.test(newValue)) {
                error = 'Aadhaar must be 12 numeric digits.';
            }
        } else if (name === 'bankAccountNumber') {
            newValue = value.replace(/[^0-9]/g, '');
            if (newValue.length > 0 && newValue.length < MIN_BANK_ACCOUNT_LENGTH) {
                error = `Account number must be at least ${MIN_BANK_ACCOUNT_LENGTH} digits.`;
            }
        } else if (name === 'bankIfsc') {
            newValue = value.toUpperCase().slice(0, 11);
            if (newValue.length === 11 && !IFSC_REGEX.test(newValue)) {
                error = 'Invalid IFSC format.';
            } else if (newValue.length > 0 && newValue.length < 11) {
                error = 'IFSC Code must be 11 characters.';
            }
        } else if (name === 'contactNumber' || name === 'alternateContactNumber') {
            newValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            if (newValue.length > 0 && newValue.length < 10 && name === 'contactNumber') {
                error = 'Contact number must be 10 digits.';
            }
        }

        setValidationErrors(prev => ({ ...prev, [name]: error }));
        updateFormData({ [name]: newValue });
    };

    // UPDATED: handleFileUpload for Profile Photo AND Address Proof
    const handleFileUpload = (
        event: React.ChangeEvent<HTMLInputElement>,
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPreview: React.Dispatch<React.SetStateAction<string>>,
        fieldName: 'profilePhoto' | 'addressProof' // Identifies which field is being updated
    ) => {
        const file = event.target.files?.[0];
        
        setValidationErrors(prev => ({ ...prev, [fieldName]: '' }));

        if (file) {
            const error = validateFile(file, MAX_PHOTO_SIZE_MB, ALLOWED_PHOTO_MIME_TYPES, fieldName === 'profilePhoto' ? 'Profile Photo' : 'Address Proof');

            if (error) {
                setValidationErrors(prev => ({ ...prev, [fieldName]: error }));
                const fileInput = document.getElementById(event.target.id) as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                
                setFile(null);
                setPreview('');
                return;
            }

            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    // UPDATED: handleFileDelete to clear validation error
    const handleFileDelete = (
        inputId: string,
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPreview: React.Dispatch<React.SetStateAction<string>>,
        currentPreview: string,
        fieldName: 'profilePhoto' | 'addressProof'
    ) => {
        const fileInput = document.getElementById(inputId) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        setFile(null);
        
        if (currentPreview) {
            URL.revokeObjectURL(currentPreview);
            setPreview('');
        }
        
        setValidationErrors(prev => ({ ...prev, [fieldName]: '' }));
    };

    const handleNext = () => {
        setCurrentStep(4);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiStatus('idle');
        setErrorMessage('');

        const allValidationErrors = Object.values(validationErrors).some(err => err.length > 0);
        
        if (allValidationErrors) {
            setApiStatus('error');
            setErrorMessage('Please correct the highlighted validation and file upload errors before submitting.');
            
            // Re-run identity validation to highlight empty/invalid fields
            handleIdentityChange({ target: { name: 'panNumber', value: formData.panNumber } } as React.ChangeEvent<HTMLInputElement>);
            handleIdentityChange({ target: { name: 'aadhaarNumber', value: formData.aadhaarNumber } } as React.ChangeEvent<HTMLInputElement>);
            handleIdentityChange({ target: { name: 'bankAccountNumber', value: formData.bankAccountNumber } } as React.ChangeEvent<HTMLInputElement>);
            handleIdentityChange({ target: { name: 'bankIfsc', value: formData.bankIfsc } } as React.ChangeEvent<HTMLInputElement>);
            handleIdentityChange({ target: { name: 'contactNumber', value: formData.contactNumber } } as React.ChangeEvent<HTMLInputElement>);
            return;
        }
// NEW: Check Pincode validity before proceeding
if (formData.pincode.length !== 6 || pincodeError) {
    setPincodeError(pincodeError || "Pincode is required and must be 6 digits.");
    setErrorMessage("Please correct the Pincode error.");
   
    return;
}
        try {
            if(!addressProof) {
                throw new Error("Address proof document is required.");
            }

            const payload = {
                // Pass all persisted data
                firstName: formData.kyc_firstName,
                lastName: formData.kyc_lastName,
                ...formData, 
                cognitoId,
                email,
                profilePhoto,
                addressProof,
            };

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
            {/* PERSONAL INFORMATION */}
            <fieldset>
                <legend className="text-xl font-semibold text-gray-800 mb-4">Personal Information</legend>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" name="firstName" value={formData.kyc_firstName} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" name="lastName" value={formData.kyc_lastName} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
                    </div>
                    
                    {/* PROFILE PHOTO INPUT */}
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="profilePhoto">Profile Photo (Max {MAX_PHOTO_SIZE_MB}MB) (Optional)</Label>
                        <div className="w-full h-32 bg-gray-50 flex items-center justify-center relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                            {profilePhotoPreview ? (
                                <>
                                    <img src={profilePhotoPreview} alt="Profile Photo Preview" className="w-full h-full object-cover" />
                                    {!isReadOnly && (
                                        <button 
                                            type="button" 
                                            onClick={() => handleFileDelete('profilePhotoInput', setProfilePhoto, setProfilePhotoPreview, profilePhotoPreview, 'profilePhoto')}
                                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" 
                                            aria-label="Delete profile photo"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <label className="text-gray-400 w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 flex-col">
                                    <span>Drag & Drop</span>
                                    <span>Upload</span>
                                    <input 
                                        id="profilePhotoInput" 
                                        type="file" 
                                        accept={ALLOWED_PHOTO_MIME_TYPES.join(',')} 
                                        onChange={(e) => handleFileUpload(e, setProfilePhoto, setProfilePhotoPreview, 'profilePhoto')} 
                                        disabled={isReadOnly} 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                    />
                                </label>
                            )}
                        </div>
                        {validationErrors.profilePhoto && (
                            <p className="text-sm text-red-600">{validationErrors.profilePhoto}</p>
                        )}
                    </div>
                </div>
            </fieldset>
        
            {/* CONTACT & ADDRESS */}
            <fieldset><legend className="text-xl font-semibold text-gray-800 mb-4">Contact & Address</legend>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contactNumber">Contact Number</Label>
                        <Input 
                            id="contactNumber" 
                            name="contactNumber" 
                            type="tel" 
                            maxLength={10} 
                            value={formData.contactNumber} 
                            onChange={handleIdentityChange} 
                            required 
                        />
                        {validationErrors.contactNumber && (
                            <p className="text-sm text-red-600">{validationErrors.contactNumber}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="alternateContactNumber">Alternate Contact (Optional)</Label>
                        <Input 
                            id="alternateContactNumber" 
                            name="alternateContactNumber" 
                            type="tel" 
                            maxLength={10} 
                            value={formData.alternateContactNumber} 
                            onChange={handleIdentityChange} 
                        />
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
                        <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} required disabled={isReadOnly} 
                                type="tel" // Use tel for mobile numeric keyboard
                                maxLength={6}/>
                                {pincodeError && (
                                <p className="text-sm text-red-600">{pincodeError}</p>
                            )}
                    </div>
                </div>
            </fieldset>

            {/* IDENTITY & BANK DETAILS */}
            <fieldset>
                <legend className="text-xl font-semibold text-gray-800 mb-4">Identity & Bank Details</legend>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="panNumber">PAN Number</Label>
                        <Input 
                            id="panNumber" 
                            name="panNumber" 
                            value={formData.panNumber} 
                            onChange={handleIdentityChange} 
                            maxLength={10}
                            required 
                        />
                        {validationErrors.panNumber && (
                            <p className="text-sm text-red-600">{validationErrors.panNumber}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                        <Input 
                            id="aadhaarNumber" 
                            name="aadhaarNumber" 
                            type="tel" 
                            value={formData.aadhaarNumber} 
                            onChange={handleIdentityChange} 
                            maxLength={12}
                            required 
                        />
                        {validationErrors.aadhaarNumber && (
                            <p className="text-sm text-red-600">{validationErrors.aadhaarNumber}</p>
                        )}
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
                    {/* ADDRESS PROOF INPUT - UPDATED */}
                    <div>
                        <div className="space-y-2">
                            <Label htmlFor="addressProofInput">Upload Address Proof (Max {MAX_PHOTO_SIZE_MB}MB)</Label>
                            <div className="w-full h-32 bg-gray-50 flex items-center justify-center relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                                {addressProofPreview ? (
                                <>
                                <img src={addressProofPreview} alt="Adress Proof Preview" className="w-full h-full object-cover" />
                                {!isReadOnly && (
                                    <button 
                                        type="button" 
                                        onClick={ () => handleFileDelete('addressProofInput', setAddressProof, setAddressProofPreview, addressProofPreview, 'addressProof') } 
                                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" 
                                        aria-label="Delete address proof"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                                </>
                                ) : (
                                <label className="text-gray-400 w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100 flex-col">
                                    <span>Drag & Drop</span>
                                    <span>Upload</span>
                                    <input 
                                        id="addressProofInput" 
                                        type="file" 
                                        accept={ALLOWED_PHOTO_MIME_TYPES.join(',')} 
                                        onChange={(e) => handleFileUpload(e, setAddressProof, setAddressProofPreview, 'addressProof')} 
                                        disabled={isReadOnly} 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                    />
                                </label>
                                )}
                            </div>
                            {validationErrors.addressProof && (
                                <p className="text-sm text-red-600">{validationErrors.addressProof}</p>
                            )}
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
                        <Input 
                            id="bankAccountNumber" 
                            name="bankAccountNumber" 
                            type="tel" 
                            value={formData.bankAccountNumber} 
                            onChange={handleIdentityChange} 
                            minLength={MIN_BANK_ACCOUNT_LENGTH}
                            required 
                        />
                        {validationErrors.bankAccountNumber && (
                            <p className="text-sm text-red-600">{validationErrors.bankAccountNumber}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="bankIfsc">IFSC Code</Label>
                        <Input 
                            id="bankIfsc" 
                            name="bankIfsc" 
                            value={formData.bankIfsc} 
                            onChange={handleIdentityChange} 
                            maxLength={11}
                            required 
                        />
                        {validationErrors.bankIfsc && (
                            <p className="text-sm text-red-600">{validationErrors.bankIfsc}</p>
                        )}
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
                (<SubmitButton isLoading={isLoading} >Submit Details</SubmitButton>)}
            </div>
        </form>
    </div>
    );
}