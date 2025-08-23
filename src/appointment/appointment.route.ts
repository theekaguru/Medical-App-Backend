import { Router } from "express";
import {getAppointments,getAppointmentById,createAppointment,updateAppointment,deleteAppointment, getAppointmentsByUserId, getAppointmentsByDoctorId, updateAppointmentStatus, updateAppointmentDate, doctorsPatients, getAvailableSlotsForDoctor, bulkDeleteAppointmentsController} from "./appointment.controller";
import { pagination } from "../middleware/pagination";
import { adminAuth, doctorAuth } from "../middleware/bearAuth";

const appointmentRouter = Router();

appointmentRouter.get("/appointments", pagination, getAppointments);
appointmentRouter.get("/appointments/user",getAppointmentsByUserId);
appointmentRouter.get("/appointments/doctor",doctorAuth,getAppointmentsByDoctorId);
appointmentRouter.get("/appointments/:id", getAppointmentById);
appointmentRouter.post("/appointments", createAppointment);
appointmentRouter.put("/appointments/:id", updateAppointment);
appointmentRouter.delete("/appointments/:id", deleteAppointment);
appointmentRouter.patch("/appointments/:appointmentId/status", updateAppointmentStatus);
appointmentRouter.patch("/appointments/:appointmentId/reschedule", updateAppointmentDate);
appointmentRouter.get("/patients/doctor", doctorsPatients);
appointmentRouter.get("/available-slots", getAvailableSlotsForDoctor);
appointmentRouter.post("/appointments/bulk-delete", adminAuth, bulkDeleteAppointmentsController);

export default appointmentRouter;
