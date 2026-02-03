import { z } from 'zod';

// Regex patterns for validation
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const AADHAAR_REGEX = /^[0-9]{12}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const onboardLibrarianSchema = z.object({
    body: z.object({
        cognitoId: z.string().min(1, "Cognito ID is required"),
        email: z.string().email("Invalid email address"),
        username: z.string().min(1, "Username is required"),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
        alternateContactNumber: z.string().optional(),
        dateOfBirth: z.string().min(1, "Date of birth is required"), // ISO string expected
        address: z.string().min(1, "Address is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        pincode: z.string().length(6, "Pincode must be exactly 6 digits"),
        country: z.string().min(1, "Country is required"),
        bankAccountNumber: z.string().min(9, "Bank account number must be at least 9 digits"),
        bankIfsc: z.string().regex(IFSC_REGEX, "Invalid IFSC code format"),
        bankName: z.string().min(1, "Bank name is required"),
        accountHolderName: z.string().min(1, "Account holder name is required"),
        panNumber: z.string().regex(PAN_REGEX, "Invalid PAN format (e.g., ABCDE1234F)"),
        gstin: z.string().optional(),
        aadhaarNumber: z.string().regex(AADHAAR_REGEX, "Aadhaar must be 12 digits"),
        addressProofType: z.string().min(1, "Address proof type is required"),
        addressProofUrl: z.string().optional(), // If already uploaded
        profilePhoto: z.string().optional(),     // If already uploaded
    }),
});
