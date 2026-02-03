import { z } from 'zod';

export const createOfferSchema = z.object({
    body: z.object({
        libraryId: z.string().min(1, "Library ID is required"),
        title: z.string().min(1, "Title is required"),
        couponCode: z.string().optional(),
        discountPct: z.number().min(0).max(100).optional(),
        flatAmount: z.number().nonnegative().optional(),
        maxDiscount: z.number().nonnegative().optional(),
        validFrom: z.string().optional(), // Should be date string
        validTo: z.string().optional(),   // Should be date string
        oncePerUser: z.boolean().optional(),
        newUsersOnly: z.boolean().optional(),
        planIds: z.array(z.string()).optional(),
    }),
});
