import { z } from 'zod';

export const createTimeSlotSchema = z.object({
    body: z.object({
        libraryId: z.string().min(1, "Library ID is required"),
        name: z.string().min(1, "Name is required"),
        startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid start time format (HH:MM)"),
        endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Invalid end time format (HH:MM)"),
        dailyHours: z.number().positive(),
        slotPools: z.array(z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"])),
    }),
});
