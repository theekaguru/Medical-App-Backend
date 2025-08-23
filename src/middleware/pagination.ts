import { Request, Response, NextFunction } from "express";
import { validatePagination } from "../validators/paginationValidator";
export const pagination = (req: Request, res: Response, next: NextFunction) =>{
    const result = validatePagination.safeParse(req.query);

    if (!result.success) {
        res.status(400).json({
        error: "Invalid query parameters",
        issues: result.error.format(),
        });
        return
    }

    // Overwrite query with validated numbers for downstream use
    req.query.page = String(result.data.page);
    req.query.pageSize = String(result.data.pageSize);

    next();
}