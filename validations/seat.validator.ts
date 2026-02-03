import { z } from 'zod';

export const configureSeatRangesSchema = z.object({
    body: z.object({
        libraryId: z.string().min(1, "Library ID is required"),
        ranges: z.array(z.object({
            from: z.number().int().positive(),
            to: z.number().int().positive(),
            mode: z.enum(["FIXED", "FLOAT", "SPECIAL"]),
            fixedPlanId: z.string().optional(),
            lockerAutoInclude: z.boolean().optional(),
            lockerId: z.string().optional(),
        })).min(1, "At least one range is required"),
    }),
});
