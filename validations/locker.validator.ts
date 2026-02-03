import { z } from 'zod';

export const createLockerSchema = z.object({
    body: z.object({
        libraryId: z.string().min(1, "Library ID is required"),
        lockerType: z.string().min(1, "Locker type is required"),
        numberOfLockers: z.number().int().positive(),
        price: z.number().nonnegative(),
        description: z.string().optional(),
    }),
});
