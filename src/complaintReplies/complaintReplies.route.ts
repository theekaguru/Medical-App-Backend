import { Router } from "express";
import { createComplaintReply, deleteComplaintReply, getAllComplaintReplies, getComplaintRepliesById, updateComplaintReply } from "./complaintReplies.controller";

const complaintRepliesRouter = Router();

complaintRepliesRouter.get("/complaintReplies",getAllComplaintReplies);
complaintRepliesRouter.get("/complaintReplies/:id", getComplaintRepliesById);
complaintRepliesRouter.post("/complaintReplies", createComplaintReply);
complaintRepliesRouter.put("/complaintReplies/:id", updateComplaintReply);
complaintRepliesRouter.delete("/complaintReplies:id",deleteComplaintReply);

export default complaintRepliesRouter