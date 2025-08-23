import { Request, Response } from "express";
import {createSpecializationService,deleteSpecializationService,getSpecializationByIdService,getSpecializationsService,updateSpecializationService,} from "./specialization.service";
import { createSpecializationValidator } from "../validators/specialization.validator";

export const getSpecializations = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;

  if (page <= 0 || pageSize <= 0) {
    res.status(400).json({ error: "Invalid page or pageSize" });
    return;
  }

  try {
    const { specializations, total } = await getSpecializationsService(page, pageSize);

    if (!specializations || specializations.length === 0) {
      res.status(404).json({ error: "No specializations found" });
      return;
    }

    res.status(200).json({ specializations, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch specializations" });
  }
};

export const getSpecializationById = async(req: Request, res: Response) => {
  const specializationId = parseInt(req.params.id);
  if (isNaN(specializationId)) {
    res.status(400).json({ error: "Invalid specialization ID" });
    return;
  }

  try {
    const specialization = await getSpecializationByIdService(specializationId);
    if (!specialization) {
      res.status(404).json({ error: "Specialization not found" });
      return;
    }
    res.status(200).json(specialization);
  } catch (error) {
    console.error("Error fetching specialization:", error);
    res.status(500).json({ error: "Failed to fetch specialization", details: error instanceof Error ? error.message : String(error) });
  }
};

export const createSpecialization = async(req: Request, res: Response) => {
  const specialization = createSpecializationValidator.safeParse(req.body);
  if (!specialization.success) {
    res.status(400).json({ error: "Invalid specialization data" });
    return;
  }
  const specializationData = specialization.data;

  try {
    const newSpecialization = await createSpecializationService(specializationData);
    res.status(201).json(newSpecialization);
  } catch (error) {
    res.status(500).json({ error: "Failed to create specialization" });
  }
};

export const updateSpecialization = async(req: Request, res: Response) => {
  const specializationId = parseInt(req.params.id);
  if (isNaN(specializationId)) {
    res.status(400).json({ error: "Invalid specialization ID" });
    return;
  }

  const specializationData = createSpecializationValidator.safeParse(req.body);
  if (!specializationData.success) {
    res.status(400).json({ error: "Invalid specialization data" });
    return;
  }

  const specialization = specializationData.data;

  try {
    const updatedSpecialization = await updateSpecializationService(specializationId, specialization);
    if (!updatedSpecialization) {
      res.status(404).json({ error: "Specialization not found" });
      return;
    }
    res.status(200).json(updatedSpecialization);
  } catch (error) {
    res.status(500).json({ error: "Failed to update specialization" });
  }
};

export const deleteSpecialization = async(req: Request, res: Response) => {
  const specializationId = parseInt(req.params.id);
  if (isNaN(specializationId)) {
    res.status(400).json({ error: "Invalid specialization ID" });
    return;
  }

  try {
    await deleteSpecializationService(specializationId);
    res.status(200).json({ message: "Specialization deleted successfully 😎" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete specialization" });
  }
};

