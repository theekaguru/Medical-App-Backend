import { Request, Response } from "express";
import { createPrescriptionService, deletePrescriptionService, getPrescriptionByIdService, getPrescriptionService,getPrescriptionsByUserIdService,getPrescriptionsByDoctorIdService } from "./prescription.service";
import { prescriptionValidator } from "../validators/prescription.validator";

export const getPrescriptions = async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const pageSize = Number(req.query.pageSize);

    try {
        const prescriptions = await getPrescriptionService(page, pageSize);
        if (!prescriptions || prescriptions.length === 0) {
            res.status(404).json({ error: "No prescriptions found" });
            return;
        }
        res.status(200).json(prescriptions);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch prescriptions" });
    }
}

export const getPrescriptionById = async (req: Request, res: Response) => {
    const prescriptionId = parseInt(req.params.id);
    if (isNaN(prescriptionId)) {
        res.status(400).json({ error: "Invalid prescription ID" });
        return;
    }

    try {
        const prescription = await getPrescriptionByIdService(prescriptionId);
        if (!prescription) {
            res.status(404).json({ error: "Prescription not found" });
            return;
        }
        res.status(200).json(prescription);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch prescription" });
    }
}

export const createPrescription = async (req: Request, res: Response) => {
    const prescriptionData = prescriptionValidator.safeParse(req.body);
    if (!prescriptionData.success) {
        res.status(400).json({ error: "Invalid prescription data", details: prescriptionData.error.errors });
        return;
    }
    const validatedData = prescriptionData.data;
    try {
        const newPrescription = await createPrescriptionService(validatedData);
        res.status(201).json(newPrescription);
    } catch (error) {
        res.status(500).json({ error: "Failed to create prescription" });
    }
}

export const updatePrescription = async (req: Request, res: Response) => {
    const prescriptionId = parseInt(req.params.id);
    if (isNaN(prescriptionId)) {
        res.status(400).json({ error: "Invalid prescription ID" });
        return;
    }

    const prescriptionData = prescriptionValidator.safeParse(req.body);
    if (!prescriptionData.success) {
        res.status(400).json({ error: "Invalid prescription data", details: prescriptionData.error.errors });
        return;
    }
    
    const validatedData = prescriptionData.data;
    try {
        const updatedPrescription = await createPrescriptionService(validatedData);
        if (!updatedPrescription) {
            res.status(404).json({ error: "Prescription not found" });
            return;
        }
        res.status(200).json(updatedPrescription);
    } catch (error) {
        res.status(500).json({ error: "Failed to update prescription" });
    }
}

export const deletePrescription = async (req: Request, res: Response) => {
    const prescriptionId = parseInt(req.params.id);
    if (isNaN(prescriptionId)) {
        res.status(400).json({ error: "Invalid prescription ID" });
        return;
    }

    try {
        const result = await deletePrescriptionService(prescriptionId);
        if (!result) {
            res.status(404).json({ error: "Prescription not found" });
            return;
        }
        res.status(200).json({ message: "Prescription deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete prescription" });
    }
}

export const getPrescriptionsByUserId = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.query.userId);  // Using query param: /prescriptions/user?userId=123
        console.log(userId);

        if (isNaN(userId)) {
             res.status(400).json({ message: "Invalid or missing userId" });
             return;
        }
        const page=1;
        const pageSize = 10;

        const prescriptions = await getPrescriptionsByUserIdService(userId, page, pageSize);

        if (!prescriptions) {
             res.status(404).json({ message: "No prescriptions found for this user." });
             return;
        }

         res.status(200).json(prescriptions);
         return;
    } catch (error) {
        console.error("Failed to get prescriptions:", error);
         res.status(500).json({ message: "Internal server error" });
         return;
    }
};

export const getPrescriptionsByDoctorId = async (req: Request, res: Response) => {
    try {
        const doctorId = Number(req.query.doctorId);  // Using query param: /prescriptions/user?doctorId=123

        if (isNaN(doctorId)) {
             res.status(400).json({ message: "Invalid or missing doctorId" });
             return;
        }
        const page=1;
        const pageSize = 10;

        const prescriptions = await getPrescriptionsByDoctorIdService(doctorId, page, pageSize);

        if (!prescriptions) {
             res.status(404).json({ message: "No prescriptions found for this user." });
             return;
        }

         res.status(200).json(prescriptions);
         return;
    } catch (error) {
        console.error("Failed to get prescriptions:", error);
         res.status(500).json({ message: "Internal server error" });
         return;
    }
};