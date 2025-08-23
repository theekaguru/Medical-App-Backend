import { z } from "zod";

export const validatePagination = z.object({
    page: z.string().transform(Number).refine((val) => Number.isInteger(val) && val > 0, {
      message: "page must be a positive integer",
    }).optional(),
    pageSize: z.string().transform(Number).refine((val) => Number.isInteger(val) && val > 0, {
      message: "pageSize must be a positive integer",
    }).optional() ,
});

