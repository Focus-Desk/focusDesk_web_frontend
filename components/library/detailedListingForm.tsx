'use client';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/ui/submitButton';
import { useUpdateLibraryStep2Mutation } from "@/state/api";
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import Image from 'next/image';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { uploadToCloudinary } from '@/state/photoUpload'; 

type DetailedData = { [key: string]: any };
type basicLibraryDetailsType = { libraryName?: string };
type FormProps = {
    libraryId: string;
    initialData: basicLibraryDetailsType;
    isReadOnly: boolean;
    setCurrentStep: Dispatch<SetStateAction<number>>;
    onSuccess: (data: DetailedData) => void;
};

const facilitiesList = [
    "AC", "WiFi", "Power Backup", "CCTV", "Drinking Water", "Silent Study Zone", "Locker", "Parking", "Printing Facility"
];


export default function DetailedListingForm({ libraryId, initialData, isReadOnly, setCurrentStep, onSuccess }: FormProps) {
    const [formData, setFormData] = useState({
        libraryName: initialData.libraryName || '',
        libraryAddress: '',
        city: '',
        state: '',
        pincode: '',
        libraryContactNo: '',
        googleMapLink: '',
        totalSeats: '',
        openingTime: '',
        closingTime: '',
        managerName: '',
        managerPhone: '',
        managerEmail: ''
    });
    
    const [updateLibraryStep2,  ] = useUpdateLibraryStep2Mutation();
    const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error' | 'uploading' | 'submitting'>('idle');
    const [uploadingStatus, setUploadingStatus] = useState<'idle' | 'uploading' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [ photos, setPhotos ] = useState({
        photo1: null as File | null,
        photo2: null as File | null,
        photo3: null as File | null,
        photo4: null as File | null,
        photo5: null as File | null,
        photo6: null as File | null
    });
    const [ previews, setPreviews ] = useState({
        photo1: '',
        photo2: '',
        photo3: '',
        photo4: '',
        photo5: '',
        photo6: '',
    });
    const [ video, setVideo ] = useState<File | null>(null);
    const [ videoPreview, setVideoPreview ] = useState<string>('');
    const [ visitingCard, setVisitingCard ] = useState<File | null>(null);
    const [ visitingCardPreview, setVisitingCardPreview ] = useState<string>('');
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
    const [isFacilitiesOpen, setIsFacilitiesOpen] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleMultiPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, photoKey: keyof typeof photos) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotos(prev => ({ ...prev, [photoKey]: file }));

            const previewUrl = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, [photoKey]: previewUrl }));
        }
    };

    const handleDeletePhoto = (photoKey: keyof typeof photos) => {
        const fileInput = document.getElementById(`${photoKey}`) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        setPhotos(prev => ({ ...prev, [photoKey]: null }));
        
        if (previews[photoKey]) URL.revokeObjectURL(previews[photoKey]);
        setPreviews(prev => ({ ...prev, [photoKey]: '' }));
    };
    
    const handleNext = () => {
        setCurrentStep(3);
    };

    const handleVisitingCardUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVisitingCard(file);
            setVisitingCardPreview(URL.createObjectURL(file));
        }
    };

    const handleDeleteVisitingCard = () => {
        const fileInput = document.getElementById('visitingCardInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setVisitingCard(null);
        if (visitingCardPreview) {
            URL.revokeObjectURL(visitingCardPreview);
            setVisitingCardPreview('');
        }
    };

    const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const MAX_VIDEO_SIZE_MB = 50;
            if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
                setErrorMessage(`Video file is too large. Please upload a file smaller than ${MAX_VIDEO_SIZE_MB}MB.`);
                
                const fileInput = document.getElementById('videoInput') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                return;
            }

            setErrorMessage('');
            setVideo(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const handleDeleteVideo = () => {
        const fileInput = document.getElementById('videoInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setVideo(null);
        if(videoPreview) {
            URL.revokeObjectURL(videoPreview);
            setVideoPreview('');
        }
    };

    const renderPhotoUploadSquares = () => {
        return Array.from({ length: 6 }).map((_, index) => {
            const photoKey = `photo${index + 1}` as keyof typeof photos;
            return (
                <div key={index} className="w-28 h-28 bg-gray-50 flex items-center justify-center relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden" >
                    {previews[photoKey] ? (
                        <>
                            <Image width={112} height={112} src={previews[photoKey]} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover"/> 
                            {!isReadOnly && (
                            <button
                                type="button"
                                onClick={() => handleDeletePhoto(photoKey)}
                                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                aria-label="Delete photo"
                            >
                                <X size={16} />
                            </button>
                            )}
                        </>
                    ) : (
                        <label className="text-gray-400 w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100">
                            <span>Upload</span>
                            <input id={photoKey} type="file" accept="image/*" onChange={e => handleMultiPhotoUpload(e, photoKey)} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isReadOnly} />
                        </label>
                    )}
                </div>
            )
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiStatus('uploading');
        setErrorMessage('');
      
        if (!libraryId) {
            setErrorMessage("Library ID is missing.");
            setUploadingStatus('error');
            return;
        }
        
        try {
            const uploadPromises = [];
            const filesToUpload = { ...photos, video, visitingCard };

            for (const [key, file] of Object.entries(filesToUpload)) {
                if (file) {
                    uploadPromises.push(uploadToCloudinary(file).then(url => ({ key, url })));
                }
            }
            
            const uploadedFiles = await Promise.all(uploadPromises);

            const photoUrls: { [key: string]: string } = {};
            let videoUrl = '';
            let visitingCardUrl = '';

            uploadedFiles.forEach(({ key, url }) => {
                if (key.startsWith('photo')) {
                    photoUrls[key] = url;
                } else if (key === 'video') {
                    videoUrl = url;
                } else if (key === 'visitingCard') {
                    visitingCardUrl = url;
                }
            });
            
            const dataToSubmit = {
                ...formData,
                totalSeats:  parseInt(formData.totalSeats),
                facilities: selectedFacilities,
                photos : Object.values(photoUrls),
                llbraryVideo: videoUrl,
                visitingCard:visitingCardUrl,
            };

            console.log("✅ UPLOAD SUCCESSFUL! This is what would be sent to the backend:", dataToSubmit);
        alert("Testing: Upload to Cloudinary was successful! Check the console for the data payload.");

        // Temporarily stop the function here to prevent the backend call
        setUploadingStatus('idle'); // Reset status for another test run
        // return; 
            
            setUploadingStatus('submitting');
            
            console.log("Submitting detailed info with URLs:", { libraryId, data: dataToSubmit });
            
            const result = await updateLibraryStep2({ libraryId, data: dataToSubmit }).unwrap();
            
            setUploadingStatus('success');
            onSuccess(result);
            console.log("uploaded detailedlisting details:", result);
        
        } catch (error: any) {
            setUploadingStatus('error');
            const message = error.data?.message || error.message || "An error occurred during submission.";
            setErrorMessage(message);
            console.error("Submission failed:", error);
        }
    };
    
    const getSubmitButtonText = () => {
        switch(uploadingStatus) {
            case 'uploading': return 'Uploading files...';
            case 'submitting': return 'Saving details...';
            default: return 'Submit & Next';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className='text-2xl font-bold mb-2'>Step 2: Detailed Listing Information</h2>
            <p className="text-gray-600 mb-8">Provide the complete details for your library to get it listed.</p>
            <form onSubmit={handleSubmit} className="space-y-8">
                <fieldset className='border border-gray-200 rounded-xl p-6 space-y-4'>
                    <legend className='font-semibold text-lg px-2'>Library Details</legend>
                    <div className='grid md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                            <Label htmlFor="libraryName">Library Name</Label>
                            <Input id="libraryName" name="libraryName" value={formData.libraryName} onChange={handleChange} required disabled={isReadOnly} />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="libraryContactNo">Library Contact Number</Label>
                            <Input id="libraryContactNo" name="libraryContactNo" type='tel' value={formData.libraryContactNo} onChange={handleChange} required disabled={isReadOnly} />
                            </div>
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor="libraryAddress">Library Address</Label>
                        <Input id="libraryAddress" name="libraryAddress" value={formData.libraryAddress} onChange={handleChange} disabled={isReadOnly} required />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className='space-y-2'>
                            <Label htmlFor="city">City</Label>
                            <Input id="city" name="city" value={formData.city} onChange={handleChange} required disabled={isReadOnly} />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="state">State</Label>
                            <Input id="state" name="state" value={formData.state} onChange={handleChange} required disabled={isReadOnly} />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} required disabled={isReadOnly} />
                        </div>
                    </div>
                    <div className='space-y-2'>
                        <Label htmlFor="googleMapLink">Google Map Link</Label>
                        <Input id="googleMapLink" name="googleMapLink" value={formData.googleMapLink} onChange={handleChange} required disabled={isReadOnly} /></div>
                    <div className='space-y-2'>
                        <Label>Upload Photos (up to 6)</Label>
                        <div className='flex flex-wrap gap-4 mt-2'>{renderPhotoUploadSquares()}</div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <div className="space-y-2">
                            <Label>Upload Video (Optional)</Label>
                            <div className="w-full h-32 bg-gray-50 flex items-center justify-center relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                            {videoPreview ? (
                                <>
                                    <video src={videoPreview} controls className="w-full h-full object-cover" />
                                    {!isReadOnly && (
                                        <button type="button" onClick={handleDeleteVideo} className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" aria-label="Delete video">
                                            <X size={16} />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <label className="text-gray-400 w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100">
                                    <span>Upload</span>
                                    <input id="videoInput" type="file" accept="video/*" onChange={handleVideoUpload} disabled={isReadOnly} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </label> 
                            )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Upload Visiting Card</Label>
                            <div className="w-full h-32 bg-gray-50 flex items-center justify-center relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                                {visitingCardPreview ? (
                                    <>
                                        <img src={visitingCardPreview} alt="Visiting Card Preview" className="w-full h-full object-cover" />
                                        {!isReadOnly && (
                                            <button type="button" onClick={handleDeleteVisitingCard} className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" aria-label="Delete visiting card">
                                                <X size={16} />
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <label className="text-gray-400 w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-100">
                                        <span>Upload</span>
                                        <input id="visitingCardInput" type="file" accept="image/*" onChange={handleVisitingCardUpload} disabled={isReadOnly} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </fieldset>
                <fieldset className='border border-gray-200 rounded-xl p-6 space-y-4'>
                    <legend className='font-semibold text-lg px-2'>Capacity & Timing</legend>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-1 space-y-2">
                            <Label htmlFor="totalSeats">Total Seats</Label>
                            <Input id="totalSeats" type="number" name="totalSeats" value={formData.totalSeats} onChange={handleChange} required disabled={isReadOnly} />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="openingTime">Opening Time</Label>
                            <Input id="openingTime" type="time" name="openingTime" value={formData.openingTime} onChange={handleChange} required disabled={isReadOnly} />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor="closingTime">Closing Time</Label>
                            <Input id="closingTime" type="time" name="closingTime" value={formData.closingTime} onChange={handleChange} required disabled={isReadOnly} />
                        </div>
                    </div>
                </fieldset>
                
                <fieldset className='border border-gray-200 rounded-xl p-6 space-y-4'>
                    <legend className='font-semibold text-lg px-2'>Manager Details</legend>
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className='space-y-2'>
                                <Label htmlFor="managerName">Manager Name</Label>
                                <Input id="managerName"  name="managerName" value={formData.managerName} onChange={handleChange} required disabled={isReadOnly} />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor="managerPhone">Manager Phone</Label>
                                <Input id="managerPhone" type='tel' pattern='[0-9]{10}' name="managerPhone" value={formData.managerPhone} onChange={handleChange} required disabled={isReadOnly} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="managerEmail">Manager Email</Label>
                                <Input id="managerEmail" name="managerEmail" type="email" value={formData.managerEmail} onChange={handleChange} disabled={isReadOnly} />
                            </div>
                        </div>
                </fieldset>
                <div className='space-y-2'>
                    <Label className='font-semibold text-lg mb-2'>Library Facilities</Label>
                    <Collapsible open={isFacilitiesOpen} onOpenChange={setIsFacilitiesOpen} className="border rounded-md">
                        <CollapsibleTrigger className="w-full flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl">
                            <span className='text-gray-700'>{selectedFacilities.length > 0 ? `${selectedFacilities.length} facilities selected` : "Select Facilities"}</span>
                            {isFacilitiesOpen ? <ChevronUp /> : <ChevronDown />}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4">
                            <div className="grid md:grid-cols-3 p-2 gap-4">
                                {facilitiesList.map((facility) => (<div key={facility} className="flex items-center space-x-2">
                                    <input type="checkbox" disabled={isReadOnly} id={facility} checked={selectedFacilities.includes(facility)} 
                                        onChange={(e) => {
                                            if (e.target.checked) { setSelectedFacilities(prev => [...prev, facility]); } 
                                            else { setSelectedFacilities(prev => prev.filter(item => item !== facility)); }
                                            }
                                        } 
                                        className="h-4 w-4" 
                                    />
                                    <Label htmlFor={facility} className="font-normal">{facility}</Label>
                                </div>))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                {apiStatus === 'success' && <div className="p-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert"><strong>Success!</strong> Library details submitted successfully.</div>}
                {apiStatus === 'error' && <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert"><strong>Error:</strong> {errorMessage}</div>}
                
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
                    (
                    <SubmitButton 
                        isLoading={uploadingStatus === 'uploading' || uploadingStatus === 'submitting'} 
                        loadingText={getSubmitButtonText()}
                    >
                        {getSubmitButtonText()}
                    </SubmitButton>)
                    }
                </div>
            </form>
        </div>
    );
}