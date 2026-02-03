import { z } from 'zod';

export const createPackageRuleSchema = z.object({
    body: z.object({
        libraryId: z.string().min(1, "Library ID is required"),
        planId: z.string().optional(), // Frontend says it's there, but backend schema might link to library
        months: z.number().int().positive(),
        percentOff: z.number().min(0).max(100),
    }),
});
