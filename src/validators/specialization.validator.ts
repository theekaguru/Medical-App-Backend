import { z } from "zod";

export const createSpecializationValidator = z.object({
    name: z.string().min(3, "Speciaization Name text cannot be less than 3 characters"),
    description: z.string().min(3, "Speciaization Name text cannot be less than 3 characters")
});