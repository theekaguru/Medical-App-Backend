// Router
import { Router } from "express";
import {createSpecialization,deleteSpecialization,getSpecializationById,getSpecializations,updateSpecialization} from "./specialization.controller";
import { pagination } from "../middleware/pagination";
import { adminAuth } from "../middleware/bearAuth";

const specializationRouter = Router();

specializationRouter.get("/specializations", pagination, getSpecializations);
specializationRouter.get("/specializations/:id", getSpecializationById);
specializationRouter.post("/specializations", adminAuth, createSpecialization);
specializationRouter.put("/specializations/:id", adminAuth, updateSpecialization);
specializationRouter.delete("/specializations/:id", adminAuth, deleteSpecialization);

export default specializationRouter;