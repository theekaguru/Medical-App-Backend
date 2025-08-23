import { Request, Response } from "express";
import { createDoctorAvailabilityService, updateDoctorAvailabilityService, getDoctorAvailabilityByDoctorIdService, deleteDoctorAvailabilityService, getAllDoctorAvailabilitiesService } from "./doctorAvailabilty.service";
import { doctorAvailabilityValidator } from "../validators/doctorAvailabilty.validator";


export const getAllDoctorAvailability = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
    
      if (page <= 0 || pageSize <= 0) {
        res.status(400).json({ error: "Invalid page or pageSize" });
        return;
      }
    
      try {
        const { availabilities, total } = await getAllDoctorAvailabilitiesService(page, pageSize);
    
        if (!availabilities || availabilities.length === 0) {
          res.status(404).json({ error: "No availabilities found" });
          return;
        }
    
        res.status(200).json({ availabilities, total });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch availabilities" });
      }
}


export const createDoctorAvailability = async (req: Request, res: Response) => {
  const parsed = doctorAvailabilityValidator.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid availability data", details: parsed.error.format() });
    return;
  }

  try {
    const availability = await createDoctorAvailabilityService({
      ...parsed.data,
      amount: parsed.data.amount.toFixed(2),
    });    
    res.status(201).json(availability);
  } catch (error) {
    res.status(500).json({ error: "Failed to create doctor availability" });
  }
};

export const getDoctorAvailability = async (req: Request, res: Response) => {
  const doctorId = parseInt(req.params.doctorId);
  if (isNaN(doctorId)) {
    res.status(400).json({ error: "Invalid doctor ID" });
    return;
  }

  try {
    const availabilities = await getDoctorAvailabilityByDoctorIdService(doctorId);
    res.status(200).json(availabilities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch doctor availability" });
  }
};

export const updateDoctorAvailability = async (req: Request, res: Response) => {
  const availabilityId = parseInt(req.params.id);
  if (isNaN(availabilityId)) {
    res.status(400).json({ error: "Invalid availability ID" });
    return;
  }

  const parsed = doctorAvailabilityValidator.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid update data", details: parsed.error.format() });
    return;
  }

  try {
    const updated = await updateDoctorAvailabilityService(availabilityId, {
      ...parsed.data,
      amount: parsed.data.amount.toFixed(2),
    });
    if (!updated) {
      res.status(404).json({ error: "Availability not found" });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update doctor availability" });
  }
};

export const deleteDoctorAvailability = async (req: Request, res: Response) => {
  const availabilityId = parseInt(req.params.id);
  if (isNaN(availabilityId)) {
    res.status(400).json({ error: "Invalid availability ID" });
    return;
  }

  try {
    await deleteDoctorAvailabilityService(availabilityId);
    res.status(200).json({ message: "Doctor availability deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete doctor availability" });
  }
};
