import { z } from 'zod';

export const createStudentSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    contactNumber: z.string().optional(),
});
