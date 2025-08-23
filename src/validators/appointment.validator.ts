import { z } from "zod";

export const appointmentValidator = z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
    doctorId: z.number().int().positive("Doctor ID must be a positive integer"),
    availabilityId: z.number().int().positive("Availability ID must be a positive integer"),
    totalAmount: z.string().min(1, "Total amount must be a positive number"),
    appointmentStatus: z.enum(["pending", "confirmed", "cancelled"]).default("pending"),
    appointmentDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }),
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (expected HH:mm)"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (expected HH:mm)"),
});
