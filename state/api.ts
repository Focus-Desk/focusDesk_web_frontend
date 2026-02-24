import { createNewUserInDatabase, withToast } from "@/lib/utils";
import {
  Mentor,
  Librarian,
  Library,
  TimeSlot,
  Plan,
  Locker,
  PackageRule,
  Offer,
} from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

type User = {
  userId: string;
  username: string;
  attributes?: Record<string, any>;
};

type OnboardLibrarianArgs = {
  cognitoId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePhoto?: File;
  contactNumber: string;
  alternateContactNumber?: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankName: string;
  accountHolderName: string;
  panNumber: string;
  gstin?: string;
  aadhaarNumber: string;
  addressProofType: string;
  addressProof: File;
};

// For updating existing librarian (Step 4 KYC form)
type UpdateLibrarianArgs = {
  cognitoId: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  contactNumber: string;
  alternateContactNumber?: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankName: string;
  accountHolderName: string;
  panNumber: string;
  gstin?: string;
  aadhaarNumber: string;
  addressProofType: string;
  addressProofUrl?: string;
};

type CreateLibraryStep1Args = {
  librarianId: string;
  libraryName: string;
  address: string;
  contactNumber: string;
};

type CreateTimeSlotArgs = {
  libraryId: string;
  name: string;
  startTime: string;
  endTime: string;
  dailyHours: number;
  slotPools: string[];
};

type CreateSlotConfigArgs = {
  libraryId: string;
  name: string;
};

type AddSlotsArgs = {
  configId: string;
  slots?: {
    tag: string;
    startTime: string;
    endTime: string;
  }[];
  slotIds?: string[];
};

export interface Slot {
  id: string;
  libraryId: string;
  tag: string;
  startTime: string;
  endTime: string;
}

export type CreateSlotArgs = {
  libraryId: string;
  tag: string;
  startTime: string;
  endTime: string;
};

type CreatePlanArgs = {
  libraryId: string;
  planName: string;
  planType: "Fixed" | "Float";
  price: number;
  hours: number;
  slotIds: string[]; // Changed from timeSlotId/slotId
  slotPools?: string[];
  description?: string;
};

type CreateLockerArgs = {
  libraryId: string;
  lockerType: string;
  numberOfLockers: number;
  price: number;
  description?: string;
};

type CreatePackageRuleArgs = {
  libraryId: string;
  planId: string;
  months: number;
  percentOff: number;
};

type CreateOfferArgs = {
  libraryId: string;
  title: string;
  couponCode?: string;
  discountPct?: number;
  flatAmount?: number;
  maxDiscount?: number;
  validFrom?: string;
  validTo?: string;
  oncePerUser?: boolean;
  newUsersOnly?: boolean;
  planIds?: string[];
};

type ConfigureSeatRangesArgs = {
  libraryId: string;
  ranges: {
    seatNumbers?: string;
    from?: number;
    to?: number;
    mode: "FIXED" | "FLOAT" | "SPECIAL";
    fixedPlanId?: string;
    lockerAutoInclude?: boolean;
    lockerId?: string;
  }[];
};

type LibraryListItem = {
  id: string;
  libraryName: string;
  city: string;
  state: string;
  reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
  contactPersonName: string;
  librarian: {
    firstName: string | null;
    lastName: string | null;
  };
  //Other properties from the full response can be added here if needed in the list view.
};

type GetLibrariesParams = {
  search?: string;
  status?: string;
  city?: string;
  page?: number;
  limit?: number;
};

type PaginationInfo = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type DetailedSeat = {
  id: string;
  seatNumber: number;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "RESERVED";
  isActive: boolean;
  mode: "FIXED" | "FLOAT" | "FLEX";
  libraryId: string;
  currentAvailability: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
  isCurrentlyOccupied: boolean;
  currentBooking: any | null;
  upcomingBookingsCount: number;
  nextBooking: any | null;
  totalBookings: number;
  bookings: any[];
};

export type DetailedLibrarySeatsResponse = {
  success: boolean;
  data: {
    library: Library;
    seats: DetailedSeat[];
  };
  message: string;
};

type GetLibrariesResponse = {
  data: LibraryListItem[];
  pagination: PaginationInfo;
};

type UpdateLibraryArgs = {
  id: string;
  data: Partial<Library>;
};

type UpdatePlanArgs = {
  id: string;
  data: Partial<Plan>;
};

type UpdateLockerArgs = {
  id: string;
  data: Partial<Locker>;
};

type UpdateTimeSlotArgs = {
  id: string;
  data: Partial<TimeSlot>;
};

type UpdateSeatArgs = {
  id: string;
  data: any;
};

type UpdatePackageRuleArgs = {
  id: string;
  data: Partial<PackageRule>;
};

type UpdateOfferArgs = {
  id: string;
  data: Partial<Offer>;
};

export type CreateStudentArgs = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender?: string;
  age?: string;
  dob?: string;
  aadhaarNumber?: string;
  state?: string;
  area?: string;
  address?: string;
  about?: string;
  interests?: string[];
};

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender?: string;
  age?: string;
  dob?: string;
  aadhaarNumber?: string;
  state?: string;
  area?: string;
  address?: string;
  about?: string;
  interests?: string[];
  createdAt: string;
  updatedAt: string;
}

type CreateBookingArgs = {
  libraryId: string;
  studentId: string;
  planId: string;
  seatId?: string;
  lockerId?: string;
  validFrom: string;
  validTo: string;
  totalAmount: number;
  paymentStatus?: "PENDING" | "COMPLETED" | "FAILED";
};

export type AdminCreateBookingArgs = {
  librarianId: string;
  pin: string;
  libraryId: string;
  planId: string;
  studentId?: string;
  studentData?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender?: string;
    dob?: string;
    aadhaarNumber?: string;
    aadhaarUrl?: string;
  };
  timeSlotId?: string;
  seatId?: string;
  monthsRequested?: number;
  lockerId?: string;
  offerCode?: string;
  date?: string;
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const session = await fetchAuthSession();
      const { idToken } = session.tokens ?? {};
      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`);
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: [
    "Students",
    "Mentors",
    "Librarians",
    "Payments",
    "Applications",
    "Libraries",
    "TimeSlots",
    "Plans",
    "Lockers",
    "PackageRules",
    "Offers",
    "Seats",
    "SlotConfigs",
    "Bookings",
  ],
  endpoints: (build) => ({
    getAuthUser: build.query<
      {
        cognitoInfo: User;
        userInfo: Student | Mentor | Librarian;
        userRole: string;
      },
      void
    >({
      queryFn: async (_, _queryApi, _extraoptions, fetchWithBQ) => {
        try {
          const session = await fetchAuthSession();
          const { idToken } = session.tokens ?? {};
          const user = await getCurrentUser();
          let userRole = idToken?.payload["custom:role"] as string;

          userRole = "librarian"; // TEMPORARY FIX UNTIL ROLES ARE SET IN COGNITO
          let endpoint = "";

          if (userRole === "mentor") {
            endpoint = `/mentors/${user.userId}`;
          } else if (userRole === "student") {
            endpoint = `/students/${user.userId}`;
          } else if (userRole === "librarian") {
            endpoint = `/librarians/${user.userId}`;
          } else {
            throw new Error("Invalid user role detected");
          }

          let userDetailsResponse = await fetchWithBQ(endpoint);
          if (
            userDetailsResponse.error &&
            userDetailsResponse.error.status === 404
          ) {
            userDetailsResponse = await createNewUserInDatabase(
              user,
              idToken,
              userRole,
              fetchWithBQ
            );
          }
          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetailsResponse.data as
                | Student
                | Mentor
                | Librarian,
              userRole,
            },
          };
        } catch (error: any) {
          return { error: error.message || "Could not fetch user data" };
        }
      },
    }),
    getLibrarian: build.query<Librarian, string>({
      query: (cognitoId) => `librarians/${cognitoId}`,
      providesTags: (result) => [{ type: "Librarians", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load librarian profile.",
        });
      },
    }),

    onboardLibrarian: build.mutation<Librarian, OnboardLibrarianArgs>({
      query: (body) => ({
        url: `librarians/onboarding`,
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Librarians" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Onboarding completed successfully!",
          error: "Failed to complete onboarding.",
        });
      },
    }),

    // Update existing librarian (Step 4 KYC form)
    updateLibrarian: build.mutation<Librarian, UpdateLibrarianArgs>({
      query: ({ cognitoId, ...body }) => ({
        url: `librarians/${cognitoId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { cognitoId }) => [
        { type: "Librarians", id: cognitoId },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Profile updated successfully!",
          error: "Failed to update profile.",
        });
      },
    }),

    createLibraryStep1: build.mutation<Library, CreateLibraryStep1Args>({
      query: (body) => ({
        url: "library/step1",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Libraries" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Basic details saved!",
          error: "Failed to save basic details.",
        });
      },
    }),

    updateLibraryStep2: build.mutation<
      Library,
      { libraryId: string; data: any }
    >({
      query: ({ libraryId, data }) => ({
        url: `library/step2/${libraryId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { libraryId }) => [
        { type: "Libraries", id: libraryId },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Detailed information saved!",
          error: "Failed to save detailed information.",
        });
      },
    }),

    createTimeSlot: build.mutation<TimeSlot, CreateTimeSlotArgs>({
      query: (body) => ({
        url: "timeslots",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TimeSlots"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Timeslot created successfully!",
          error: "Failed to create timeslot.",
        });
      },
    }),

    createPlan: build.mutation<Plan, CreatePlanArgs>({
      query: (body) => ({
        url: "plans",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Plans"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Plan created successfully!",
          error: "Failed to create plan.",
        });
      },
    }),

    createLocker: build.mutation<Locker, CreateLockerArgs>({
      query: (body) => ({
        url: "lockers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Lockers"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Locker created successfully!",
          error: "Failed to create locker.",
        });
      },
    }),

    configureSeatRanges: build.mutation<any, ConfigureSeatRangesArgs>({
      query: (body) => ({
        url: "seats/configure-range",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Seats"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Seat configurations saved!",
          error: "Failed to save seat configurations.",
        });
      },
    }),

    createPackageRule: build.mutation<PackageRule, CreatePackageRuleArgs>({
      query: (body) => ({
        url: "/package-rules",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PackageRules"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Package rule created successfully!",
          error: "Failed to create package rule.",
        });
      },
    }),

    createOffer: build.mutation<Offer, CreateOfferArgs>({
      query: (body) => ({
        url: "offers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Offers"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Offer created successfully!",
          error: "Failed to create offer.",
        });
      },
    }),

    createSlotConfig: build.mutation<{ success: boolean, data: any }, CreateSlotConfigArgs>({
      query: (body) => ({
        url: "slot-configs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SlotConfigs"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Slot configuration created!",
          error: "Failed to create slot configuration.",
        });
      },
    }),

    createSlot: build.mutation<{ success: boolean, data: Slot }, CreateSlotArgs>({
      query: (body) => ({
        url: "slot-configs/slots",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SlotConfigs"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Master slot created!",
          error: "Failed to create master slot.",
        });
      },
    }),

    getSlotsByLibraryId: build.query<{ success: boolean, data: Slot[] }, string>({
      query: (libraryId) => `slot-configs/slots/library/${libraryId}`,
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }) => ({ type: "SlotConfigs" as const, id })),
            { type: "SlotConfigs" },
          ]
          : [{ type: "SlotConfigs" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load master slots.",
        });
      },
    }),

    addSlotsToConfig: build.mutation<{ success: boolean, data: any }, AddSlotsArgs>({
      query: ({ configId, ...body }) => ({
        url: `slot-configs/${configId}/slots`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["SlotConfigs"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Slots generated successfully!",
          error: "Failed to generate slots.",
        });
      },
    }),

    getSlotConfigsByLibraryId: build.query<{ success: boolean, data: any[] }, string>({
      query: (libraryId) => `slot-configs/library/${libraryId}`,
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }) => ({ type: "SlotConfigs" as const, id })),
            { type: "SlotConfigs" },
          ]
          : [{ type: "SlotConfigs" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load slot configurations.",
        });
      },
    }),

    getPlans: build.query<Plan[], string>({
      query: (libraryId) => `plans/${libraryId}`,
      transformResponse: (response: { success: boolean; data: Plan[] }) => response.data,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Plans" as const, id })),
            { type: "Plans" },
          ]
          : [{ type: "Plans" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, { error: "Failed to load plans." });
      },
    }),

    getLockers: build.query<Locker[], string>({
      query: (libraryId) => `lockers/${libraryId}`,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Lockers" as const, id })),
            { type: "Lockers" },
          ]
          : [{ type: "Lockers" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, { error: "Failed to load lockers." });
      },
    }),

    getTimeSlotsByLibraryId: build.query<{ success: boolean; data: TimeSlot[] }, string>({
      query: (libraryId) => `timeslots/libraryId/${libraryId}`,
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }) => ({ type: "TimeSlots" as const, id })),
            { type: "TimeSlots" },
          ]
          : [{ type: "TimeSlots" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load time slots.",
        });
      },
    }),

    getLibrariansByLibraryId: build.query<{ success: boolean; data: Librarian[] }, string>({
      query: (libraryId) => `library/${libraryId}/librarians`,
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }) => ({ type: "Librarians" as const, id })),
            { type: "Librarians" },
          ]
          : [{ type: "Librarians" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load librarians.",
        });
      },
    }),

    getSeatsByLibrary: build.query<any[], string>({
      // Replace 'any' with a proper SeatConfiguration type
      query: (libraryId) => `seats/library/${libraryId}`,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Seats" as const, id })),
            { type: "Seats" },
          ]
          : [{ type: "Seats" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load seat configurations.",
        });
      },
    }),

    getOffers: build.query<Offer[], string>({
      query: (libraryId) => `offers/${libraryId}`,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Offers" as const, id })),
            { type: "Offers" },
          ]
          : [{ type: "Offers" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, { error: "Failed to load offers." });
      },
    }),

    getPackageRulesByLibraryId: build.query<PackageRule[], string>({
      query: (libraryId) => `package-rules/library/${libraryId}`,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({
              type: "PackageRules" as const,
              id,
            })),
            { type: "PackageRules" },
          ]
          : [{ type: "PackageRules" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load package rules.",
        });
      },
    }),

    updateLibrary: build.mutation<Library, UpdateLibraryArgs>({
      query: ({ id, data }) => ({
        url: `library/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Libraries", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Library details updated!",
          error: "Failed to update library.",
        });
      },
    }),

    updatePlan: build.mutation<Plan, UpdatePlanArgs>({
      query: ({ id, data }) => ({
        url: `plans/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Plans", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Plan updated!",
          error: "Failed to update plan.",
        });
      },
    }),
    deletePlan: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `plans/${id}`, method: "DELETE" }),
      invalidatesTags: ["Plans"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Plan deleted!",
          error: "Failed to delete plan.",
        });
      },
    }),

    updateLocker: build.mutation<Locker, UpdateLockerArgs>({
      query: ({ id, data }) => ({
        url: `lockers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Lockers", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Locker updated!",
          error: "Failed to update locker.",
        });
      },
    }),

    deleteLocker: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `lockers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Lockers"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Locker deleted!",
          error: "Failed to delete locker.",
        });
      },
    }),

    updateTimeSlot: build.mutation<TimeSlot, UpdateTimeSlotArgs>({
      query: ({ id, data }) => ({
        url: `timeslots/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "TimeSlots", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Time slot updated!",
          error: "Failed to update time slot.",
        });
      },
    }),

    deleteTimeSlot: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `timeslots/${id}`, method: "DELETE" }),
      invalidatesTags: ["TimeSlots"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Time slot deleted!",
          error: "Failed to delete time slot.",
        });
      },
    }),

    updateSeat: build.mutation<any, UpdateSeatArgs>({
      query: ({ id, data }) => ({
        url: `seats/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Seats", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Seat updated!",
          error: "Failed to update seat.",
        });
      },
    }),
    deleteSeat: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `seats/${id}`, method: "DELETE" }),
      invalidatesTags: ["Seats"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Seat deleted!",
          error: "Failed to delete seat.",
        });
      },
    }),

    updatePackageRule: build.mutation<PackageRule, UpdatePackageRuleArgs>({
      query: ({ id, data }) => ({
        url: `package-rule/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "PackageRules", id },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Package rule updated!",
          error: "Failed to update package rule.",
        });
      },
    }),

    deletePackageRule: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `package-rule/${id}`, method: "DELETE" }),
      invalidatesTags: ["PackageRules"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Package rule deleted!",
          error: "Failed to delete package rule.",
        });
      },
    }),

    updateOffer: build.mutation<Offer, UpdateOfferArgs>({
      query: ({ id, data }) => ({
        url: `offers/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Offers", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Offer updated!",
          error: "Failed to update offer.",
        });
      },
    }),

    deleteOffer: build.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `offers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Offers"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Offer deleted!",
          error: "Failed to delete offer.",
        });
      },
    }),

    getStudent: build.query<Student, string>({
      query: (cognitoId) => `students/${cognitoId}`,
      providesTags: (result) => [{ type: "Students", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load student profile.",
        });
      },
    }),
    updateStudentSettings: build.mutation<
      Student,
      { cognitoId: string } & Partial<Student>
    >({
      query: ({ cognitoId, ...updatedStudent }) => ({
        url: `students/${cognitoId}`,
        method: "PUT",
        body: updatedStudent,
      }),
      invalidatesTags: (result) => [{ type: "Students", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),

    getMentor: build.query<Mentor, string>({
      query: (cognitoId) => `mentors/${cognitoId}`,
      providesTags: (result) => [{ type: "Mentors", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load mentor profile.",
        });
      },
    }),

    updateMentorSettings: build.mutation<
      Mentor,
      { cognitoId: string } & Partial<Mentor>
    >({
      query: ({ cognitoId, ...updatedMentor }) => ({
        url: `mentors/${cognitoId}`,
        method: "PUT",
        body: updatedMentor,
      }),
      invalidatesTags: (result) => [{ type: "Mentors", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),

    getLibrarianProfileCompleted: build.query<
      { profileCompleted: boolean },
      string
    >({
      query: (librarianId) => `librarians/${librarianId}/profile-completed`,
      providesTags: (_result, _error, id) => [{ type: "Librarians", id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to check if profile is completed.",
        });
      },
    }),

    getLibrariesByLibrarian: build.query<Library[], string>({
      query: (librarianId) =>
        `library/getlibraries/librarianId?librarianId=${librarianId}`,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Libraries" as const, id })),
            { type: "Libraries" },
          ]
          : [{ type: "Libraries" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load libraries.",
        });
      },
    }),

    uploadProfilePhoto: build.mutation<{ url: string }, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("profilePhoto", file);
        return {
          url: `librarians/upload-photo`, // Endpoint for profile photos
          method: "POST",
          body: formData,
        };
      },
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Profile photo upload failed.",
        });
      },
    }),

    uploadAddressProof: build.mutation<{ url: string }, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("addressProof", file);
        return {
          url: `librarians/upload-address-proof`, // Endpoint for address proofs
          method: "POST",
          body: formData,
        };
      },
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Address proof upload failed.",
        });
      },
    }),

    uploadLibraryPhoto: build.mutation<{ url: string }, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `libraries/upload-photo`,
          method: "POST",
          body: formData,
        };
      },
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Photo upload failed.",
        });
      },
    }),

    createLibraryWithPlans: build.mutation<Library, any>({
      query: (libraryData) => ({
        url: `libraries/create-with-plans`,
        method: "POST",
        body: libraryData,
      }),
      invalidatesTags: [{ type: "Libraries" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Library submitted successfully!",
          error: "Failed to submit library.",
        });
      },
    }),

    submitLibraryDetails: build.mutation<Library, any>({
      query: (libraryDetails) => ({
        url: `libraries/${libraryDetails.get("libraryId")}/details`,
        method: "POST",
        body: libraryDetails,
      }),
      invalidatesTags: [{ type: "Libraries" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Library details submitted!",
          error: "Failed to submit library details.",
        });
      },
    }),

    deleteLibrary: build.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `library/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Libraries", id },
        { type: "Libraries" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Library deleted successfully!",
          error: "Failed to delete library.",
        });
      },
    }),

    getAllLibraries: build.query<Library[], void>({
      query: () => `libraries/all`,
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Libraries" as const, id })),
            { type: "Libraries" },
          ]
          : [{ type: "Libraries" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to load libraries.",
        });
      },
    }),

    getLibraryById: build.query<Library, string>({
      query: (libraryId) => `library/${libraryId}`,
      providesTags: (result) => [{ type: "Libraries", id: result?.id }],
    }),

    reviewLibrary: build.mutation<
      Library,
      { libraryId: string; status: "APPROVED" | "REJECTED"; reason?: string }
    >({
      query: ({ libraryId, ...body }) => ({
        url: `library/${libraryId}/review`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, error, { libraryId }) => [
        { type: "Libraries", id: libraryId },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Library review status updated!",
          error: "Failed to update review status.",
        });
      },
    }),
    getLibraries: build.query<GetLibrariesResponse, GetLibrariesParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params.search) queryParams.append("search", params.search);
        if (params.city) queryParams.append("city", params.city);
        if (params.status && params.status !== "ALL")
          queryParams.append("status", params.status);
        if (params.page) queryParams.append("page", String(params.page));
        if (params.limit) queryParams.append("limit", String(params.limit));

        return `library/getLibrary?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map(({ id }) => ({
              type: "Libraries" as const,
              id,
            })),
            { type: "Libraries", id: "LIST" },
          ]
          : [{ type: "Libraries", id: "LIST" }],
    }),

    getDetailedLibrarySeats: build.query<DetailedLibrarySeatsResponse, { id: string; slotId?: string }>({
      query: ({ id, slotId }) => {
        let url = `library/libraries/${id}`;
        if (slotId && slotId !== "all") {
          url += `?slotId=${slotId}`;
        }
        return url;
      },
      providesTags: (result) => [
        { type: "Libraries", id: result?.data.library.id },
        { type: "Libraries", id: "DETAILED_SEATS" },
      ],
    }),

    searchStudentByMobile: build.query<Student, string>({
      query: (phoneNumber) => `students/search?phoneNumber=${phoneNumber}`,
      providesTags: (result) => [{ type: "Students", id: result?.id }],
    }),

    createStudent: build.mutation<Student, CreateStudentArgs>({
      query: (body) => ({
        url: "students",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Student created successfully!",
          error: "Failed to create student.",
        });
      },
    }),

    createBooking: build.mutation<any, CreateBookingArgs>({
      query: (body) => ({
        url: "bookings",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students", "Seats", "Libraries"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Plan assigned successfully!",
          error: "Failed to assign plan.",
        });
      },
    }),
    searchStudentByPhoneNumber: build.query<{ success: boolean; data: any; message?: string }, string>({
      query: (phoneNumber) => `/students/search/phone?phoneNumber=${phoneNumber}`,
    }),

    adminCreateBooking: build.mutation<{ success: boolean; data: any; message?: string }, AdminCreateBookingArgs>({
      query: (body) => ({
        url: "bookings/admin-create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Bookings", "Seats", "TimeSlots"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Booking created successfully!",
          error: "Failed to create booking.",
        });
      },
    }),

    getSeatsForPlan: build.query<{ success: boolean; data: any; message?: string }, { planId: string; date: string }>({
      query: ({ planId, date }) => `bookings/plan-seats/${planId}?date=${date}`,
    }),

    getStudentByEmail: build.query<any, string>({
      query: (email) => `students/studentData/${email}`,
    }),

    uploadAadhaar: build.mutation<{ success: boolean; url: string; message: string }, FormData>({
      query: (body) => ({
        url: "librarian/upload-aadhaar",
        method: "POST",
        body,
      }),
    }),

    calculatePricing: build.mutation<
      { success: boolean; data: { monthlyFee: number; monthsRequested: number; lockerPrice: number; packageDiscountPct: number; packageDiscountAmt: number; offerApplied: any; taxes: number; alreadyPaid: number; total: number } },
      { planId: string; monthsRequested?: number; lockerId?: string; offerCode?: string }
    >({
      query: (body) => ({
        url: "pricing/calculate",
        method: "POST",
        body,
      }),
    }),

    getStudentBookings: build.query<any, { studentId: string; status?: string }>({
      query: ({ studentId, status }) => {
        let url = `bookings/getStudentBookings/${studentId}`;
        if (status) url += `?status=${status}`;
        return url;
      },
      providesTags: ["Bookings"],
    }),

    getLibraryBookings: build.query<any, { libraryId: string; filter?: string }>({
      query: ({ libraryId, filter }) => ({
        url: `bookings/library/list/${libraryId}`,
        params: { filter },
      }),
      providesTags: ["Bookings"],
    }),

    approveBooking: build.mutation<any, string>({
      query: (id) => ({
        url: `bookings/approve/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Bookings", "LibrarySeats"],
    }),

    rejectBooking: build.mutation<any, string>({
      query: (id) => ({
        url: `bookings/reject/${id}`,
        method: "POST",
      }),
      invalidatesTags: ["Bookings", "LibrarySeats"],
    }),

    getComplaintsByLibrary: build.query<any, string>({
      query: (libraryId) => `complaints/library/${libraryId}`,
      providesTags: ["Complaints"],
    }),

    updateComplaintStatus: build.mutation<any, {
      id: string;
      status: string;
      resolution?: string;
      allottedTo?: string;
      resolutionDays?: number;
      reportReason?: string;
      reportDetails?: string;
    }>({
      query: ({ id, ...body }) => ({
        url: `complaints/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Complaints"],
    }),

    getLibraryReviewsForLibrarian: build.query<any, string>({
      query: (libraryId) => `reviews/librarian/${libraryId}`,
      providesTags: ["Reviews"],
    }),

    updateReviewStatus: build.mutation<any, { id: string; status?: string; isRead?: boolean }>({
      query: ({ id, ...body }) => ({
        url: `reviews/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Reviews"],
    }),

    replyToReview: build.mutation<any, { id: string; reply: string }>({
      query: ({ id, ...body }) => ({
        url: `reviews/${id}/reply`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Reviews"],
    }),

    getPauseRequestsByLibrary: build.query<any, string>({
      query: (libraryId) => `plan-requests/library/${libraryId}`,
      providesTags: ["PauseRequests"],
    }),

    updatePauseRequestStatus: build.mutation<any, { id: string; status: string; rejectionReason?: string }>({
      query: ({ id, ...body }) => ({
        url: `plan-requests/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PauseRequests"],
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useGetLibrarianQuery,
  useOnboardLibrarianMutation,
  useUpdateLibrarianMutation,
  useCreateLibraryStep1Mutation,
  useUpdateLibraryStep2Mutation,
  useGetStudentQuery,
  useUpdateStudentSettingsMutation,
  useGetMentorQuery,
  useUpdateMentorSettingsMutation,
  useGetLibrarianProfileCompletedQuery,
  useGetLibrariesByLibrarianQuery,
  useUploadLibraryPhotoMutation,
  useUploadProfilePhotoMutation,
  useUploadAddressProofMutation,
  useCreateLibraryWithPlansMutation,
  useDeleteLibraryMutation,
  useGetAllLibrariesQuery,
  useGetLibraryByIdQuery,
  useReviewLibraryMutation,
  useSubmitLibraryDetailsMutation,
  useCreateTimeSlotMutation,
  useCreatePlanMutation,
  useCreateLockerMutation,
  useConfigureSeatRangesMutation,
  useCreatePackageRuleMutation,
  useCreateOfferMutation,
  useGetLibrariesQuery,
  useGetPlansQuery,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useGetLockersQuery,
  useUpdateLockerMutation,
  useDeleteLockerMutation,
  useGetTimeSlotsByLibraryIdQuery,
  useUpdateTimeSlotMutation,
  useDeleteTimeSlotMutation,
  useGetSeatsByLibraryQuery,
  useUpdateSeatMutation,
  useDeleteSeatMutation,
  useUpdatePackageRuleMutation,
  useDeletePackageRuleMutation,
  useGetOffersQuery,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useUpdateLibraryMutation,
  useGetPackageRulesByLibraryIdQuery,
  useCreateSlotMutation,
  useGetSlotsByLibraryIdQuery,
  useCreateSlotConfigMutation,
  useAddSlotsToConfigMutation,
  useGetSlotConfigsByLibraryIdQuery,
  useGetDetailedLibrarySeatsQuery,
  useSearchStudentByMobileQuery,
  useLazySearchStudentByMobileQuery,
  useCreateStudentMutation,
  useCreateBookingMutation,
  useSearchStudentByPhoneNumberQuery,
  useAdminCreateBookingMutation,
  useGetLibrariansByLibraryIdQuery,
  useGetSeatsForPlanQuery,
  useGetStudentByEmailQuery,
  useUploadAadhaarMutation,
  useCalculatePricingMutation,
  useGetStudentBookingsQuery,
  useLazyGetStudentBookingsQuery,
  useGetComplaintsByLibraryQuery,
  useUpdateComplaintStatusMutation,
  useGetLibraryReviewsForLibrarianQuery,
  useUpdateReviewStatusMutation,
  useReplyToReviewMutation,
  useGetPauseRequestsByLibraryQuery,
  useUpdatePauseRequestStatusMutation,
  useGetLibraryBookingsQuery,
  useApproveBookingMutation,
  useRejectBookingMutation,
} = api;
