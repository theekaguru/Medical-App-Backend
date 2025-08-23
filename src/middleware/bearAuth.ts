import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
        user?: DecodedToken;
    }
  }
}

type DecodedToken = {
    userId: number;
    email: string;
    role: "admin" | "doctor" | "user";
    fullName: string;
    exp: number;
};

// Verify JWT token
export const verifyToken = async (token: string, secret: string) => {
    try {
        const decoded = jwt.verify(token, secret) as DecodedToken;
        return decoded;
    } catch (error) {
        return null;
    }
};

// General authorization middleware
export const authMiddleware = async (req: Request,res: Response,next: NextFunction,allowedRoles: string[]) => {
    if (process.env.NODE_ENV === "test") {
        return next();
    }

    const authHeader = req.header("Authorization");
    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = await verifyToken(token, process.env.JWT_SECRET as string);

    if (!decodedToken) {
        res.status(401).json({ error: "Invalid or expired token" });
        return
    }

    if (allowedRoles.includes(decodedToken.role)) {
        req.user = decodedToken;
        return next();
    }

    res.status(403).json({ error: "Forbidden: You do not have permission to access this resource" });
    return
};

// Role-based middleware exports

export const adminAuth = (req: Request, res: Response, next: NextFunction) =>
  authMiddleware(req, res, next, ["admin"]);

export const doctorAuth = (req: Request, res: Response, next: NextFunction) =>
  authMiddleware(req, res, next, ["doctor"]);

export const userAuth = (req: Request, res: Response, next: NextFunction) =>
  authMiddleware(req, res, next, ["user"]);

export const adminOrDoctorAuth = (req: Request, res: Response, next: NextFunction) =>
  authMiddleware(req, res, next, ["admin", "doctor"]);

export const doctorOrUserAuth = (req: Request, res: Response, next: NextFunction) =>
  authMiddleware(req, res, next, ["doctor", "user"]);

export const adminOrUserAuth = (req: Request, res: Response, next: NextFunction) =>
  authMiddleware(req, res, next, ["admin", "user"]);

export const allRolesAuth = (req: Request, res: Response, next: NextFunction) =>
  authMiddleware(req, res, next, ["admin", "doctor", "user"]);
