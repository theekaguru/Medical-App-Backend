import { z } from "zod";

export const complaintValidator = z.object({
    userId: z.number().int().positive("User ID must be a positive integer"),
    relatedAppointmentId: z.number().int().positive("Appointment ID must be a positive integer"),
    subject: z.string().min(1, "Complaint text cannot be empty"),
    description: z.string().min(1, "Complaint description cannot be empty"),
    status: z.enum(["open", "inProgress", "resolved", "closed"]).default("open"),
});