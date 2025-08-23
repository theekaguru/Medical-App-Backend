import { z } from "zod";

export const createDoctorValidator = z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
    specializationId: z.number().int().positive("Specialization is required"),
    bio: z.string().min(10,"Bio cannot be less than 2 letters"),
    experienceYears: z.number().int().positive("Experience must be a positive integer"),
});