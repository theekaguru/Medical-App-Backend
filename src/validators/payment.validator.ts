import { z } from "zod";

export const paymentValidator = z.object({
    appointmentId: z.number().int().positive("Appointment ID must be a positive integer"),
    amount: z.number().positive("Amount must be a positive number"),
    paymentStatus: z.string(),
    transactionId: z.string().optional(),
    paymentDate: z.string().refine(date => !isNaN(Date.parse(date)), "Invalid date format").optional(),
});