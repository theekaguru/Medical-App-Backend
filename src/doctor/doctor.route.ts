import { Router } from "express";
import { createDoctor, deleteDoctor, getDoctorById, getDoctors, updateDoctor, getUserDoctors, getDoctorsBySpecialization } from "./doctor.controller";
import { pagination } from "../middleware/pagination";
import { adminAuth } from "../middleware/bearAuth";

const doctorRouter = Router();

doctorRouter.get("/doctors/specialization", getDoctorsBySpecialization);
doctorRouter.get("/doctors", pagination, getDoctors);
doctorRouter.get("/doctors/:id", adminAuth, getDoctorById);
doctorRouter.post("/doctors", adminAuth, createDoctor);
doctorRouter.put("/doctors/:id", adminAuth, updateDoctor);
doctorRouter.delete("/doctors/:id", adminAuth, deleteDoctor);
doctorRouter.get("/users/doctors", pagination, getUserDoctors);
doctorRouter.get("/doctors/specialization", getDoctorsBySpecialization);

export default doctorRouter;
