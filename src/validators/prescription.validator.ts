import { z } from "zod";

export const prescriptionValidator = z.object({
    appointmentId: z.number().int().positive("Appointment ID must be a positive integer"),
    doctorId: z.number().int().positive("Doctor ID must be a positive integer"),
    patientId: z.number().int().positive("Patient ID must be a positive integer"),
    medicationName: z.string().min(1, "Medication name is required"),
    dosage: z.string().min(1, "Dosage is required"), // e.g., "500mg"
    frequency: z.string().min(1, "Frequency is required"), // e.g., "Twice a day"
    duration: z.number().int().positive("Duration must be a positive number"), // e.g., 7 (days)
    instructions: z.string().optional(), // Optional field
    isActive: z.boolean().optional().default(true),
    refillCount: z.number().int().min(0, "Refill count must be non-negative").optional().default(0),
});