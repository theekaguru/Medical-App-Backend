import { Request, Response } from "express";
import { createAppointmentService, deleteAppointmentService, getAllAppointmentsService, getAppointmentByIdService, updateAppointmentService, getAppointmentsByUserIdService,getAppointmentsByDoctorIdService,updateAppointmentStatusService, updateAppointmentDateService, doctorsPatientsService,getAvailableSlotsForDoctorService, deleteManyAppointmentsService } from "./appointment.service";
import { appointmentValidator } from "../validators/appointment.validator";

export const getAppointments = async (req: Request, res: Response) => {
    const page = Number(req.query.page );
    const pageSize = Number(req.query.pageSize );
    
    try {
        const appointments = await getAllAppointmentsService(page, pageSize);
        if (!appointments || appointments.length === 0) {
            res.status(404).json({ error: "No appointments found" });
            return;
        }
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch appointments" });
        return;
    }
}

export const getAppointmentById = async (req: Request, res: Response) => {
    const appointmentId = parseInt(req.params.id);
    if (isNaN(appointmentId)) {
        res.status(400).json({ error: "Invalid appointment ID" });
        return;
    }

    try {
        const appointment = await getAppointmentByIdService(appointmentId);
        if (!appointment) {
            res.status(404).json({ error: "Appointment not found" });
            return;
        }
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch appointment" });
        return;
    }
}

export const createAppointment = async (req: Request, res: Response) => {
    const appointmentData = appointmentValidator.safeParse(req.body);

    if (!appointmentData.success) {
        res.status(400).json({ error: "Invalid appointment data", appointmentData: appointmentData.error.errors });
        return;
    }

    const validatedData = appointmentData.data;
    try {
        const newAppointment = await createAppointmentService(validatedData);
        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(500).json({ error: "Failed to create appointment" });
        return;
    }
}

export const updateAppointment = async (req: Request, res: Response) => {
    const appointmentId = parseInt(req.params.id);
    if (isNaN(appointmentId)) {
        res.status(400).json({ error: "Invalid appointment ID" });
        return;
    }

    const appointmentData = appointmentValidator.safeParse(req.body);
    if (!appointmentData.success) {
        res.status(400).json({ error: "Invalid appointment data", appointmentData: appointmentData.error.errors });
        return;
    }

    const validatedData = appointmentData.data;

    try {
        const updatedAppointment = await updateAppointmentService(appointmentId,validatedData);
        if (!updatedAppointment) {
            res.status(404).json({ error: "Appointment not found" });
            return;
        }
        res.status(200).json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ error: "Failed to update appointment" });
        return;
    }
}

export const deleteAppointment = async (req: Request, res: Response) => {
    const appointmentId = parseInt(req.params.id);
    if (isNaN(appointmentId)) {
        res.status(400).json({ error: "Invalid appointment ID" });
        return;
    }

    try {
        const result = await deleteAppointmentService(appointmentId);
        res.status(200).json({ message: result });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete appointment" });
        return;
    }
}

export const getAppointmentsByUserId = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.query.userId);
        const page = Number(req.query.page);
        const pageSize = Number(req.query.PageSize);

        if (isNaN(userId)) {
            res.status(400).json({ message: "Invalid or missing userId" });
            return
        }

        const result = await getAppointmentsByUserIdService(userId, page, pageSize);

        if (!result || result.data.length === 0) {
            res.status(404).json({ message: "No appointments found for this user." });
            return
        }

        res.status(200).json({
            appointments: result.data,
            total: result.total,
        });
        return
    } catch (error) {
        console.error("Failed to get appointments:", error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
};

export const getAppointmentsByDoctorId = async (req: Request, res: Response) => {
    try {
        const doctorId = Number(req.query.doctorId);  // Using query param: /appointments/user?doctorId=123

        if (isNaN(doctorId)) {
             res.status(400).json({ message: "Invalid or missing doctorId" });
             return;
        }
        const page=1;
        const pageSize = 10;

        const appointments = await getAppointmentsByDoctorIdService(doctorId, page, pageSize);

        if (!appointments) {
             res.status(404).json({ message: "No appointments found for this user." });
             return;
        }

         res.status(200).json(appointments);
         return;
    } catch (error) {
        console.error("Failed to get appointments:", error);
         res.status(500).json({ message: "Internal server error" });
         return;
    }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  const appointmentId = parseInt(req.params.appointmentId);
  const { status } = req.body;

  if (isNaN(appointmentId)) {
     res.status(400).json({ error: "Invalid appointment ID" });
     return
  }

  if (!["pending", "confirmed", "cancelled"].includes(status)) {
     res.status(400).json({ error: "Invalid status value" });
     return
  }

  try {
    const updated = await updateAppointmentStatusService(appointmentId, status);

    if (!updated) {
       res.status(404).json({ error: "Appointment not found" });
       return
    }

     res.status(200).json({ message: "Appointment status updated", appointment: updated });
     return
  } catch (error) {
    console.error("Failed to update appointment status:", error);
     res.status(500).json({ error: "Failed to update appointment status" });
     return
  }
};

export const updateAppointmentDate = async (req: Request, res: Response) => {
  const appointmentId = parseInt(req.params.appointmentId);
  const { date } = req.body;

  if (isNaN(appointmentId)) {
     res.status(400).json({ error: "Invalid appointment ID" });
     return
  }

  if (!date) {
     res.status(400).json({ error: "Invalid date value" });
     return
  }

  try {
    const updated = await updateAppointmentDateService(appointmentId, date);

    if (!updated) {
       res.status(404).json({ error: "Appointment not found" });
       return
    }

     res.status(200).json({ message: "Appointment Date updated", appointment: updated });
     return
  } catch (error) {
    console.error("Failed to update appointment status:", error);
     res.status(500).json({ error: "Failed to update appointment status" });
     return
  }
};

export const doctorsPatients = async (req: Request, res: Response) => {
    try {
        const doctorId = Number(req.query.doctorId);  // Using query param: /appointments/user?doctorId=123

        if (isNaN(doctorId)) {
             res.status(400).json({ message: "Invalid or missing doctorId" });
             return;
        }

        const patients = await doctorsPatientsService(doctorId);

        if (!patients) {
             res.status(404).json({ message: "No patients found for this doctor." });
             return;
        }

         res.status(200).json(patients);
         return;
    } catch (error) {
        console.error("Failed to get patients:", error);
         res.status(500).json({ message: "Internal server error" });
         return;
    }

}

export const getAvailableSlotsForDoctor = async (req: Request, res: Response) => {
    const doctorId = Number(req.query.doctorId);
    const date = req.query.date as string;

    if (!doctorId || !date) {
        res.status(400).json({ message: "doctorId and date are required" });
        return
    }

    try {
        const slots = await getAvailableSlotsForDoctorService(doctorId, date);
        
        console.log(slots);
        res.status(200).json({ availableSlots: slots });
    } catch (error) {
        console.error("Error fetching available slots:", error);
        res.status(500).json({ message: "Failed to fetch available slots" });
    }
};

export const bulkDeleteAppointmentsController = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: "No appointment IDs provided" });
            return
        }

        const message = await deleteManyAppointmentsService(ids);
            res.status(200).json({ message });
            return
    } catch (error: any) {
            res.status(500).json({ message: error.message || "Server error" });
            return
    }
};
