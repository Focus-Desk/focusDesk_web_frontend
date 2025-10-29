// detailedListingForm.tsx
"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submitButton";
import { useUpdateLibraryStep2Mutation } from "@/state/api";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useState } from "react";
import { uploadToCloudinary } from "@/state/photoUpload";

type DetailedData = { [key: string]: any };

interface OnboardingDataSlice {
  libraryName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber: string;
  googleMapLink: string;
  totalSeats: string;
  openingTime: string;
  closingTime: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
}

type FormProps = {
  libraryId: string;
  isReadOnly: boolean;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  onSuccess: (data: DetailedData) => void;
  // NEW PROPS
  formData: OnboardingDataSlice;
  updateFormData: (data: Partial<OnboardingDataSlice>) => void;
};

const facilitiesList = [
  "AC",
  "WiFi",
  "Power Backup",
  "CCTV",
  "Drinking Water",
  "Silent Study Zone",
  "Locker",
  "Parking",
  "Printing Facility",
];

// File Validation Constants
const MAX_PHOTO_SIZE_MB = 5;
const MAX_VIDEO_SIZE_MB = 50;
const PHOTO_MIME_TYPES = ["image/jpeg", "image/png"];
const VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const CARD_MIME_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const validateFile = (
  file: File,
  maxSizeMB: number,
  allowedTypes: string[],
  name: string
): string => {
  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return `${name} is too large. Max size is ${maxSizeMB}MB.`;
  }
  if (!allowedTypes.includes(file.type)) {
    return `${name} has an invalid format. Allowed formats: ${allowedTypes
      .map((t) => t.split("/")[1])
      .join(", ")}.`;
  }
  return "";
};

// Custom component to simulate Select
const SelectInput = ({
  options,
  value,
  onChange,
  disabled,
  className,
}: any) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`block w-full px-1 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
  >
    {options.map((opt: string) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

// Time Picker Helper Functions
const getHoursOptions = () =>
  Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const getMinutesOptions = () => ["00", "15", "30", "45"];

const parseTime24to12 = (time24: string) => {
  if (!time24) return { hour: "12", minute: "00", period: "AM" };
  const [h, m] = time24.split(":");
  const hour24 = parseInt(h, 10);
  let hour12 = hour24 % 12;
  hour12 = hour12 === 0 ? 12 : hour12;
  const period = hour24 >= 12 && hour24 !== 24 ? "PM" : "AM";
  return { hour: String(hour12).padStart(2, "0"), minute: m, period };
};

const convertTime12to24 = (
  hour12Str: string,
  minute: string,
  period: string
): string => {
  let hour12 = parseInt(hour12Str, 10);
  let hour24 = hour12;

  if (period === "PM" && hour12 !== 12) {
    hour24 = hour12 + 12;
  } else if (period === "AM" && hour12 === 12) {
    hour24 = 0; // Midnight (12 AM) is 00:xx
  } else if (period === "AM" && hour12 < 12) {
    hour24 = hour12;
  }

  const hour24Padded = String(hour24).padStart(2, "0");
  return `${hour24Padded}:${minute}`;
};

export default function DetailedListingForm({
  libraryId,
  isReadOnly,
  setCurrentStep,
  onSuccess,
  formData,
  updateFormData,
}: FormProps) {
  // Local state for complex/file uploads
  const [updateLibraryStep2] = useUpdateLibraryStep2Mutation();
  const [apiStatus, setApiStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [uploadingStatus, setUploadingStatus] = useState<
    "idle" | "uploading" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [uploadErrors, setUploadErrors] = useState({
    photos: [] as string[],
    video: "",
    visitingCard: "",
  });
  const [pincodeError, setPincodeError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [visitingCard, setVisitingCard] = useState<File | null>(null);
  const [visitingCardPreview, setVisitingCardPreview] = useState<string>("");

  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [isFacilitiesOpen, setIsFacilitiesOpen] = useState(false);

  // UPDATED: Standard handler uses updateFormData
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // If the field is pincode, use the dedicated handler
    if (name === "pincode") {
      handlePincodeChange(value);
    } else {
      updateFormData({ [name]: value });
    }
  };
  // NEW: Pincode handler
  const handlePincodeChange = (value: string) => {
    // Allow only numeric input, max 6 digits
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 6);
    let error = "";

    if (numericValue.length > 0 && numericValue.length !== 6) {
      error = "Pincode must be exactly 6 digits.";
    }

    setPincodeError(error);
    updateFormData({ pincode: numericValue });
  };
  // NEW: Combined time picker change handler uses updateFormData
  const handleTimeChange = (
    timeField: "openingTime" | "closingTime",
    part: "hour" | "minute" | "period",
    value: string
  ) => {
    const currentTime24 = formData[timeField];
    const parsed = parseTime24to12(currentTime24);

    let newHour = parsed.hour;
    let newMinute = parsed.minute;
    let newPeriod = parsed.period;

    if (part === "hour") newHour = value;
    else if (part === "minute") newMinute = value;
    else if (part === "period") newPeriod = value;

    const newTime24 = convertTime12to24(newHour, newMinute, newPeriod);

    updateFormData({ [timeField]: newTime24 });
  };

  const handleMultiPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    let newPhotos: File[] = [];
    let newPreviews: string[] = [];
    let newErrors: string[] = [];
    let hasError = false;

    if (files.length > 6) {
      newErrors[0] = "Maximum of 6 photos allowed. Please re-select.";
      hasError = true;
    }

    if (!hasError) {
      files.slice(0, 6).forEach((file, index) => {
        const error = validateFile(
          file,
          MAX_PHOTO_SIZE_MB,
          PHOTO_MIME_TYPES,
          `Photo ${index + 1}`
        );

        if (error) {
          newErrors[index] = error;
          hasError = true;
        } else {
          newPhotos.push(file);
          newPreviews.push(URL.createObjectURL(file));
          newErrors[index] = "";
        }
      });
    }

    while (newErrors.length < 6) newErrors.push("");

    if (hasError) {
      setPhotos([]);
      setPreviews([]);

      const fileInput = document.getElementById(
        "multiPhotoInput"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      setUploadErrors((prev) => ({ ...prev, photos: newErrors }));
      setErrorMessage(
        "One or more photo selections were invalid or exceeded the limit."
      );
    } else {
      setPhotos(newPhotos);
      setPreviews(newPreviews);
      setUploadErrors((prev) => ({ ...prev, photos: newErrors }));
      setErrorMessage("");
    }
  };

  const handleDeletePhoto = (index: number) => {
    if (previews[index]) URL.revokeObjectURL(previews[index]);

    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));

    setUploadErrors((prev) => {
      const newPhotos = [...prev.photos];
      newPhotos[index] = "";
      return { ...prev, photos: newPhotos };
    });

    const fileInput = document.getElementById(
      `multiPhotoInput`
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleNext = () => {
    setCurrentStep(3);
  };

  const handleVisitingCardUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    setUploadErrors((prev) => ({ ...prev, visitingCard: "" }));
    setVisitingCard(null);
    setVisitingCardPreview("");

    if (file) {
      const error = validateFile(
        file,
        MAX_PHOTO_SIZE_MB,
        CARD_MIME_TYPES,
        "Visiting Card"
      );

      if (error) {
        setUploadErrors((prev) => ({ ...prev, visitingCard: error }));
        const fileInput = document.getElementById(
          "visitingCardInput"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        return;
      }

      setVisitingCard(file);
      setVisitingCardPreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteVisitingCard = () => {
    const fileInput = document.getElementById(
      "visitingCardInput"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    setVisitingCard(null);
    if (visitingCardPreview) {
      URL.revokeObjectURL(visitingCardPreview);
      setVisitingCardPreview("");
    }
    setUploadErrors((prev) => ({ ...prev, visitingCard: "" }));
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setUploadErrors((prev) => ({ ...prev, video: "" }));
    setVideo(null);
    setVideoPreview("");

    if (file) {
      const error = validateFile(
        file,
        MAX_VIDEO_SIZE_MB,
        VIDEO_MIME_TYPES,
        "Video"
      );

      if (error) {
        setUploadErrors((prev) => ({ ...prev, video: error }));
        const fileInput = document.getElementById(
          "videoInput"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        return;
      }

      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteVideo = () => {
    const fileInput = document.getElementById("videoInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    setVideo(null);
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview("");
    }
    setUploadErrors((prev) => ({ ...prev, video: "" }));
  };

  const renderPhotoUploadSquares = () => {
    return Array.from({ length: 6 }).map((_, index) => {
      const isFilled = index < photos.length;
      const previewUrl = previews[index];
      const error = uploadErrors.photos[index];

      return (
        <div key={index} className="flex flex-col items-center">
          <div className="w-28 h-28 bg-gray-50 flex items-center justify-center relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            {isFilled && previewUrl ? (
              <>
                <Image
                  width={112}
                  height={112}
                  src={previewUrl}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    aria-label={`Delete photo ${index + 1}`}
                  >
                    <X size={16} />
                  </button>
                )}
              </>
            ) : (
              <div className="text-gray-400 w-full h-full flex items-center justify-center flex-col">
                <span>Photo {index + 1}</span>
              </div>
            )}
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-1 max-w-[112px] text-center">
              {error.split(":").pop()}
            </p>
          )}
        </div>
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiStatus("idle");
    setErrorMessage("");
    setUploadingStatus("uploading");

    if (!libraryId) {
      setErrorMessage("Library ID is missing.");
      setUploadingStatus("error");
      return;
    }
    // NEW: Check Pincode validity before proceeding
    if (formData.pincode.length !== 6 || pincodeError) {
      setPincodeError(
        pincodeError || "Pincode is required and must be 6 digits."
      );
      setErrorMessage("Please correct the Pincode error.");
      setUploadingStatus("idle");
      return;
    }
    const hasUploadErrors =
      uploadErrors.video ||
      uploadErrors.visitingCard ||
      uploadErrors.photos.some((e) => e);
    if (hasUploadErrors) {
      setErrorMessage(
        "Please correct the file upload errors before submitting."
      );
      setUploadingStatus("error");
      return;
    }

    try {
      const uploadPromises = [];

      photos.forEach((file, index) => {
        uploadPromises.push(
          uploadToCloudinary(file).then((url) => ({
            key: `photo${index + 1}`,
            url,
          }))
        );
      });

      if (video)
        uploadPromises.push(
          uploadToCloudinary(video).then((url) => ({ key: "video", url }))
        );
      if (visitingCard)
        uploadPromises.push(
          uploadToCloudinary(visitingCard).then((url) => ({
            key: "visitingCard",
            url,
          }))
        );

      const uploadedFiles = await Promise.all(uploadPromises);

      const photoUrls: string[] = [];
      let videoUrl = "";
      let visitingCardUrl = "";

      uploadedFiles.forEach(({ key, url }) => {
        if (key.startsWith("photo")) {
          photoUrls.push(url);
        } else if (key === "video") {
          videoUrl = url;
        } else if (key === "visitingCard") {
          visitingCardUrl = url;
        }
      });

      setUploadingStatus("submitting");

      const dataToSubmit = {
        ...formData,
        totalSeats: parseInt(formData.totalSeats),
        facilities: selectedFacilities,
        photos: photoUrls,
        llbraryVideo: videoUrl,
        visitingCard: visitingCardUrl,
      };

      const result = await updateLibraryStep2({
        libraryId,
        data: dataToSubmit,
      }).unwrap();

      setUploadingStatus("success");
      setApiStatus("success");
      onSuccess(result);
    } catch (error: any) {
      setUploadingStatus("error");
      setApiStatus("error");
      const message =
        error.data?.message ||
        error.message ||
        "An error occurred during submission.";
      setErrorMessage(message);
      console.error("Submission failed:", error);
    }
  };

  const getSubmitButtonText = () => {
    switch (uploadingStatus) {
      case "uploading":
        return "Uploading files...";
      case "submitting":
        return "Saving details...";
      default:
        return "Submit & Next";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">
        Step 2: Detailed Listing Information
      </h2>
      <p className="text-gray-600 mb-8">
        Provide the complete details for your library to get it listed.
      </p>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* LIBRARY DETAILS FIELDSET */}
        <fieldset className="border border-gray-200 rounded-xl p-6 space-y-4">
          <legend className="font-semibold text-lg px-2">
            Library Details
          </legend>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="libraryName">Library Name</Label>
              <Input
                id="libraryName"
                name="libraryName"
                value={formData.libraryName}
                onChange={handleChange}
                required
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="libraryContactNo">Library Contact Number</Label>
              <Input
                id="libraryContactNo"
                name="libraryContactNo"
                type="tel"
                value={formData.contactNumber}
                onChange={handleChange}
                required
                disabled={isReadOnly}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="libraryAddress">Library Address</Label>
            <Input
              id="libraryAddress"
              name="libraryAddress"
              value={formData.address}
              onChange={handleChange}
              disabled={isReadOnly}
              required
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
                disabled={isReadOnly}
                type="tel"
                maxLength={6}
              />
              {pincodeError && (
                <p className="text-sm text-red-600">{pincodeError}</p>
              )}

            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="googleMapLink">Google Map Link</Label>
            <Input
              id="googleMapLink"
              name="googleMapLink"
              value={formData.googleMapLink}
              onChange={handleChange}
              required
              disabled={isReadOnly}
            />
          </div>

          {/* MULTI-PHOTO UPLOAD SECTION */}
          <div className="space-y-2 pt-4">
            <Label>Upload Photos (Max 6, {MAX_PHOTO_SIZE_MB}MB each)</Label>

            <div className="mb-4">
              <label className="block w-full text-center py-2 px-4 border border-blue-500 text-blue-500 rounded-md cursor-pointer hover:bg-blue-50 transition-colors relative">
                Choose Photos
                <input
                  id="multiPhotoInput"
                  type="file"
                  accept={PHOTO_MIME_TYPES.join(",")}
                  multiple
                  onChange={handleMultiPhotoUpload}
                  className=" inset-0 absolute opacity-0  cursor-pointer"
                  disabled={isReadOnly || photos.length === 6}
                />
              </label>
              {photos.length > 0 && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {photos.length} of 6 photos selected.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              {renderPhotoUploadSquares()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <Label>Upload Video (Optional, Max {MAX_VIDEO_SIZE_MB}MB)</Label>
              <div className="w-full h-32 bg-gray-50 flex items-center justify-center relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                {videoPreview ? (
                  <>
                    <video
                      src={videoPreview}
                      controls
                      className="w-full h-full object-cover"
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={handleDeleteVideo}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        aria-label="Delete video"
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
                      id="videoInput"
                      type="file"
                      accept={VIDEO_MIME_TYPES.join(",")}
                      onChange={handleVideoUpload}
                      disabled={isReadOnly}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                )}
              </div>
              {uploadErrors.video && (
                <p className="text-sm text-red-500 mt-1">
                  {uploadErrors.video}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Upload Visiting Card (Max {MAX_PHOTO_SIZE_MB}MB)</Label>
              <div className="w-full h-32 bg-gray-50 flex items-center justify-center relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                {visitingCardPreview ? (
                  <>
                    <img
                      src={visitingCardPreview}
                      alt="Visiting Card Preview"
                      className="w-full h-full object-cover"
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={handleDeleteVisitingCard}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        aria-label="Delete visiting card"
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
                      id="visitingCardInput"
                      type="file"
                      accept={CARD_MIME_TYPES.join(",")}
                      onChange={handleVisitingCardUpload}
                      disabled={isReadOnly}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                )}
              </div>
              {uploadErrors.visitingCard && (
                <p className="text-sm text-red-500 mt-1">
                  {uploadErrors.visitingCard}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {/* CAPACITY & TIMING FIELDSET - UPDATED TIME PICKER */}
        <fieldset className="border border-gray-200 rounded-xl p-6 space-y-4">
          <legend className="font-semibold text-lg px-2">
            Capacity & Timing
          </legend>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-2">
              <Label htmlFor="totalSeats">Total Seats</Label>
              <Input
                id="totalSeats"
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                required
                disabled={isReadOnly}
              />
            </div>

            {/* OPENING TIME PICKER */}
            <div className="space-y-2">
              <Label htmlFor="openingTime">Opening Time</Label>
              <div className="grid grid-cols-3 gap-1">
                <SelectInput
                  options={getHoursOptions()}
                  value={parseTime24to12(formData.openingTime).hour}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleTimeChange("openingTime", "hour", e.target.value)
                  }
                  disabled={isReadOnly}
                />
                <SelectInput
                  options={getMinutesOptions()}
                  value={parseTime24to12(formData.openingTime).minute}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleTimeChange("openingTime", "minute", e.target.value)
                  }
                  disabled={isReadOnly}
                />
                <SelectInput
                  options={["AM", "PM"]}
                  value={parseTime24to12(formData.openingTime).period}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleTimeChange("openingTime", "period", e.target.value)
                  }
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* CLOSING TIME PICKER */}
            <div className="space-y-2">
              <Label htmlFor="closingTime">Closing Time</Label>
              <div className="grid grid-cols-3 gap-1">
                <SelectInput
                  options={getHoursOptions()}
                  value={parseTime24to12(formData.closingTime).hour}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleTimeChange("closingTime", "hour", e.target.value)
                  }
                  disabled={isReadOnly}
                />
                <SelectInput
                  options={getMinutesOptions()}
                  value={parseTime24to12(formData.closingTime).minute}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleTimeChange("closingTime", "minute", e.target.value)
                  }
                  disabled={isReadOnly}
                />
                <SelectInput
                  options={["AM", "PM"]}
                  value={parseTime24to12(formData.closingTime).period}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleTimeChange("closingTime", "period", e.target.value)
                  }
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>
        </fieldset>

        {/* MANAGER DETAILS FIELDSET */}
        <fieldset className="border border-gray-200 rounded-xl p-6 space-y-4">
          <legend className="font-semibold text-lg px-2">
            Manager Details
          </legend>
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-2">
              <Label htmlFor="managerName">Manager Name</Label>
              <Input
                id="managerName"
                name="managerName"
                value={formData.managerName}
                onChange={handleChange}
                required
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="managerPhone">Manager Phone</Label>
              <Input
                id="managerPhone"
                type="tel"
                pattern="[0-9]{10}"
                name="managerPhone"
                value={formData.managerPhone}
                onChange={handleChange}
                required
                disabled={isReadOnly}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="managerEmail">Manager Email</Label>
              <Input
                id="managerEmail"
                name="managerEmail"
                type="email"
                value={formData.managerEmail}
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </fieldset>

        {/* FACILITIES SECTION */}
        <div className="space-y-2">
          <Label className="font-semibold text-lg mb-2">
            Library Facilities
          </Label>
          <Collapsible
            open={isFacilitiesOpen}
            onOpenChange={setIsFacilitiesOpen}
            className="border rounded-md"
          >
            <CollapsibleTrigger className="w-full flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl">
              <span className="text-gray-700">
                {selectedFacilities.length > 0
                  ? `${selectedFacilities.length} facilities selected`
                  : "Select Facilities"}
              </span>
              {isFacilitiesOpen ? <ChevronUp /> : <ChevronDown />}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4">
              <div className="grid md:grid-cols-3 p-2 gap-2 ">
                {facilitiesList.map((facility) => (
                  <div key={facility} className="flex items-center space-x-2 ">
                    <input
                      type="checkbox"
                      disabled={isReadOnly}
                      id={facility}
                      checked={selectedFacilities.includes(facility)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFacilities((prev) => [...prev, facility]);
                        } else {
                          setSelectedFacilities((prev) =>
                            prev.filter((item) => item !== facility)
                          );
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={facility} className="font-normal mt-2.5 ">
                      {facility}
                    </Label>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* API Status Messages */}
        {apiStatus === "success" && (
          <div
            className="p-4 text-sm text-green-800 rounded-lg bg-green-50"
            role="alert"
          >
            <strong>Success!</strong> Library details submitted successfully.
          </div>
        )}
        {apiStatus === "error" && (
          <div
            className="p-4 text-sm text-red-800 rounded-lg bg-red-50"
            role="alert"
          >
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        {/* Submit and Navigation Buttons */}
        <div className="flex justify-center items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCurrentStep((currentStep) => currentStep - 1)}
            className="w-full px-6 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-700 text-lg font-[500] cursor-pointer transition-all duration-300 hover:bg-gray-100"
          >
            Previous
          </button>

          {isReadOnly ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full border-0 rounded-xl p-3 bg-gray-500 text-white text-lg font-bold cursor-pointer transition-all duration-300 hover:bg-gray-600"
            >
              Next
            </button>
          ) : (
            <SubmitButton
              isLoading={
                uploadingStatus === "uploading" ||
                uploadingStatus === "submitting"
              }
              loadingText={getSubmitButtonText()}
              disabled={
                uploadingStatus === "uploading" ||
                uploadingStatus === "submitting"
              }
            >
              {getSubmitButtonText()}
            </SubmitButton>
          )}
        </div>
      </form>
    </div>
  );
}
