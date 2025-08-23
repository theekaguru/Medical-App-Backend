import { Router } from "express";
import { adminAuth } from "../middleware/bearAuth";
import { getAllDoctorAvailability,createDoctorAvailability, deleteDoctorAvailability, getDoctorAvailability, updateDoctorAvailability } from "./doctorAvailabilty.controller";

const doctorAvailabilityRouter = Router();

doctorAvailabilityRouter.get("/availability", getAllDoctorAvailability);
doctorAvailabilityRouter.post("/availability", adminAuth, createDoctorAvailability);
doctorAvailabilityRouter.get("/availability/:doctorId", getDoctorAvailability);
doctorAvailabilityRouter.get("/availability/", getDoctorAvailability);
doctorAvailabilityRouter.put("/availability/:id", adminAuth, updateDoctorAvailability);
doctorAvailabilityRouter.delete("/availability/:id", adminAuth, deleteDoctorAvailability);

export default doctorAvailabilityRouter;
