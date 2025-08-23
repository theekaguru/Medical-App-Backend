import { z } from "zod";

export const doctorAvailabilityValidator = z.object({
    doctorId: z.number().int(),
    dayOfWeek: z.enum(["monday","tuesday","wednesday","thursday","friday","saturday","sunday",]),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    slotDurationMinutes: z.number().int().min(30).max(240).optional(),
    amount: z.number().int().positive(),
});
