import { Router } from "express";
import { createPrescription, getPrescriptionById, getPrescriptions, updatePrescription, deletePrescription,getPrescriptionsByUserId,getPrescriptionsByDoctorId } from "./prescription.controller"; 
import { pagination } from "../middleware/pagination";
import { adminAuth, doctorAuth, doctorOrUserAuth, userAuth } from "../middleware/bearAuth";

const prescriptionRouter = Router();

prescriptionRouter.get("/prescriptions",pagination,adminAuth, getPrescriptions);
prescriptionRouter.get("/prescriptions/user",userAuth,getPrescriptionsByUserId);
prescriptionRouter.get("/prescriptions/doctor",doctorAuth,getPrescriptionsByDoctorId);
prescriptionRouter.get("/prescriptions/:id",doctorOrUserAuth, getPrescriptionById);
prescriptionRouter.post("/prescriptions",doctorAuth, createPrescription);
prescriptionRouter.put("/prescriptions/:id",doctorAuth, updatePrescription);
prescriptionRouter.delete("/prescriptions/:id",doctorAuth, deletePrescription);

export default prescriptionRouter;