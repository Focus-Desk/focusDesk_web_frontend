import { z } from 'zod';

export const createPlanSchema = z.object({
    body: z.object({
        libraryId: z.string().min(1, "Library ID is required"),
        planName: z.string().min(1, "Plan name is required"),
        planType: z.enum(["Fixed", "Float"]),
        price: z.number().nonnegative(),
        hours: z.number().positive(),
        timeSlotId: z.string().optional(),
        slotPools: z.array(z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT"])).optional(),
        description: z.string().optional(),
    }),
});
