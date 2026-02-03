import { z } from 'zod';

export const createLibraryStep1Schema = z.object({
    body: z.object({
        librarianId: z.string().min(1, "Librarian ID is required"),
        libraryName: z.string().min(1, "Library name is required"),
        address: z.string().min(1, "Address is required"),
        contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
        contactPersonName: z.string().min(1, "Contact person name is required"),
        email: z.email("Invalid email address"),
        interestedInListing: z.boolean(),
    }),
});

export const updateLibraryStep2Schema = z.object({
    params: z.object({
        id: z.string().min(1, "Invalid library ID"),
    }),
    body: z.object({
        libraryAddress: z.string().optional(),
        city: z.string().min(1).optional(),
        state: z.string().min(1).optional(),
        pincode: z.string().optional(),
        libraryContactNo: z.string().optional(),
        googleMapLink: z.string().optional().or(z.literal("")),
        totalSeats: z.number().int().positive().optional(),
        openingTime: z.string().optional(),
        closingTime: z.string().optional(),
        managerName: z.string().optional(),
        managerPhone: z.string().optional(),
        managerEmail: z.string().email().optional().or(z.literal("")),
        facilities: z.array(z.string()).optional(),
        photos: z.array(z.string()).optional(),
        videos: z.array(z.string()).optional(),
        cardImages: z.array(z.string()).optional(),
    }),
});

export const createLibrarySchema = z.object({
    body: z.object({
        libraryName: z.string().min(1, "Library name is required"),
        address: z.string().min(1, "Address is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        pincode: z.string().min(1, "Pincode is required"),
        contactNumber: z.string().min(1, "Contact number is required"),
        openingTime: z.string().min(1, "Opening time is required"),
        closingTime: z.string().min(1, "Closing time is required"),
        librarianId: z.uuid("Invalid librarian ID"),
        totalSeats: z.number().int().positive("Total seats must be greater than 0"),
        googleMapLink: z.url().optional(),
        country: z.string().default('India'),
        photos: z.array(z.string()).default([]),
        whatsAppNumber: z.string().optional(),
        description: z.string().optional(),
        facilities: z.array(z.string()).default([]),
        area: z.string().optional(),
        socialLinks: z.array(z.object({
            platform: z.string(),
            url: z.url()
        })).optional(),
    }),
}).refine(data => data.body.openingTime < data.body.closingTime, {
    message: "Opening time must be before closing time",
    path: ["body", "openingTime"]
});

export const updateLibrarySchema = z.object({
    params: z.object({
        id: z.uuid("Invalid ID format"),
    }),
    body: z.object({
        libraryName: z.string().optional(),
        address: z.string().optional(),
        PersoncontactNumber: z.string().optional(),
        contactPersonName: z.string().optional(),
        libraryEmail: z.email().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
        googleMapLink: z.url().optional(),
        totalSeats: z.number().int().positive().optional(),
        openingTime: z.string().optional(),
        closingTime: z.string().optional(),
        managerName: z.string().optional(),
        managerPhone: z.string().optional(),
        managerEmail: z.email().optional(),
        photos: z.array(z.string()).optional(),
        libraryVideo: z.string().optional(),
        visitingCard: z.string().optional(),
        facilities: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        description: z.string().optional(),
    }),
});

export const reviewLibrarySchema = z.object({
    params: z.object({
        libraryId: z.uuid("Invalid library ID"),
    }),
    body: z.object({
        status: z.enum(['APPROVED', 'REJECTED']),
        reason: z.string().optional(),
    }),
});

export const onboardLibrarianSchema = z.object({
    body: z.object({
        cognitoId: z.string().min(1, "Cognito ID is required"),
        email: z.email("Invalid email address"),
        username: z.string().min(1, "Username is required"),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        profilePhoto: z.string().optional(),
        contactNumber: z.string().optional(),
        alternateContactNumber: z.string().optional(),
        dateOfBirth: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        pincode: z.string().optional(),
        country: z.string().optional(),
        bankAccountNumber: z.string().optional(),
        bankIfsc: z.string().optional(),
        bankName: z.string().optional(),
        accountHolderName: z.string().optional(),
        panNumber: z.string().optional(),
        gstin: z.string().optional(),
        aadhaarNumber: z.string().optional(),
        addressProofType: z.string().optional(),
        addressProofUrl: z.string().optional(),
    }),
});

export const createLibrarianSchema = z.object({
    body: z.object({
        cognitoId: z.string().min(1, "Cognito ID is required"),
        username: z.string().min(1, "Username is required"),
        email: z.email("Invalid email address"),
    }),
});

export const getLibrariesByLibrarianSchema = z.object({
    query: z.object({
        librarianId: z.uuid("Invalid librarian ID"),
    }),
});

export const deleteLibrarySchema = z.object({
    params: z.object({
        libraryId: z.uuid("Invalid library ID"),
    }),
});

export const getLibraryByIdSchema = z.object({
    params: z.object({
        libraryId: z.uuid("Invalid library ID"),
    }),
});

export const getSeatsByLibraryIdSchema = z.object({
    params: z.object({
        id: z.uuid("Invalid library ID"),
    }),
});

export const getLibrariesSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        libraryName: z.string().optional(),
        status: z.string().optional(),
        page: z.string().regex(/^\d+$/).optional(),
        limit: z.string().regex(/^\d+$/).optional(),
        sortField: z.string().optional(),
        sortOrder: z.enum(['asc', 'desc']).optional(),
    }),
});
