import { Request, Response } from "express";
import { createDoctorService, deleteDoctorService, getDoctorByIdService, getDoctorsService, updateDoctorService,getUserDoctorsService, getDoctorsBySpecializationService } from "./doctor.service";
import { createDoctorValidator } from "../validators/doctor.validator";

export const getDoctors = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;

  if (page <= 0 || pageSize <= 0) {
    res.status(400).json({ error: "Invalid page or pageSize" });
    return;
  }

  try {
    const { doctors, total } = await getDoctorsService(page, pageSize);

    if (!doctors || doctors.length === 0) {
      res.status(404).json({ error: "No doctors found" });
      return;
    }

    res.status(200).json({ doctors, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
};


export const getDoctorById = async(req: Request, res: Response) => {
    const doctorId = parseInt(req.params.id);
    if (isNaN(doctorId)) {
        res.status(400).json({ error: "Invalid doctor ID" });
        return;
    }

    try {
        const doctor = await getDoctorByIdService(doctorId);
        if (!doctor) {
            res.status(404).json({ error: "Doctor not found" });
            return;
        }
        res.status(200).json(doctor);
    } catch (error) {
        console.error("Error fetching doctor:", error);
        res.status(500).json({ error: "Failed to fetch doctor", details: error instanceof Error ? error.message : String(error) });
    }
}

export const createDoctor = async(req: Request, res: Response) => {
    const doctor = createDoctorValidator.safeParse(req.body);
    if (!doctor.success) {
        res.status(400).json({ error: "Invalid doctor data" });
        return;
    }
    const doctorData = doctor.data;

    try {
        const newDoctor = await createDoctorService(doctorData);
        res.status(201).json(newDoctor);
    } catch (error) {
        res.status(500).json({ error: "Failed to create doctor" });
        return
    }
}

export const updateDoctor = async(req: Request, res: Response) => {
    const doctorId = parseInt(req.params.id);
    if (isNaN(doctorId)) {
         res.status(400).json({ error: "Invalid doctor ID" });
         return
    }

    const doctorData = createDoctorValidator.safeParse(req.body);
    if (!doctorData.success) {
         res.status(400).json({ error: "Invalid doctor data" });
         return
    }

    const doctor = doctorData.data;

    try {
        const updatedDoctor = await updateDoctorService(doctorId, doctor);
        if (!updatedDoctor) {
             res.status(404).json({ error: "Doctor not found" });
             return
        }
        res.status(200).json(updatedDoctor);
    } catch (error) {
        res.status(500).json({ error: "Failed to update doctor" });
        return;
    }
}

export const deleteDoctor = async(req: Request, res: Response) => {
    const doctorId = parseInt(req.params.id);
    if (isNaN(doctorId)) {
        res.status(400).json({ error: "Invalid doctor ID" });
        return
    }

    try {
        await deleteDoctorService(doctorId);
        res.status(200).json({ message: "Doctor deleted successfully 😎" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete doctor" });
    }
}

export const getUserDoctors = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    if (page <= 0 || pageSize <= 0) {
        res.status(400).json({ error: "Invalid page or pageSize" });
        return;
    }

    try {
        const result = await getUserDoctorsService(page, pageSize);
        
        if (!result || result.doctors.length === 0) {
            res.status(404).json({ error: "No doctors found" });
            return;
        }

        res.status(200).json({
            doctors: result.doctors,
            total: result.total,
            page,
            pageSize
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch doctors" });
    }
};

export const getDoctorsBySpecialization = async (req: Request, res: Response) => {
  const specializationId = Number(req.query.specializationId);
  console.log(specializationId);

  if (isNaN(specializationId)) {
    res.status(400).json({ error: "Invalid specializationId" });
    return;
  }

  try {
    const doctors = await getDoctorsBySpecializationService(specializationId);

    if (!doctors || doctors.length === 0) {
      res.status(404).json({ error: "No doctors found for this specialization" });
      return;
    }

    res.status(200).json({ doctors });
  } catch (error) {
    console.error("Error fetching doctors by specialization:", error);
    res.status(500).json({ error: "Failed to fetch doctors by specialization" });
  }
};