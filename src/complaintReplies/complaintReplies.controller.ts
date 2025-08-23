import { Request, Response } from "express";
import {
  getAllComplaintRepliesService,
  getComplaintReplyByIdService,
  createComplaintReplyService,
  updateComplaintReplyService,
  deleteComplaintReplyService,
  getComplaintRepliesService,
  addComplaintReplyService,
} from "./complaintReplies.service";
import { getSocketIOInstance } from "./socket";

// GET: /complaint-replies?page=1&pageSize=10
export const getAllComplaintReplies = async (req: Request, res: Response) => {
    const { page, pageSize } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const pageSizeNumber = parseInt(pageSize as string) || 10;

    try {
        const replies = await getAllComplaintRepliesService(pageNumber, pageSizeNumber);
        if (!replies || replies.length === 0) {
         res.status(404).json({ error: "No replies found" });
         return
        }
         res.status(200).json({ replies });
         return
    } catch (err) {
         res.status(500).json({ error: "Failed to fetch replies" });
         return
    }
};

// GET: /complaint-replies/user/Id
export const getComplaintRepliesById = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid userId" });
        return
    }

    try {
        const replies = await getComplaintReplyByIdService(userId);
        if (!replies) {
            res.status(404).json({ error: "No replies found for this user" });
            return
        }
        res.status(200).json({ replies });
        return
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch replies" });
        return
    }
};

// POST: /complaint-replies
export const createComplaintReply = async (req: Request, res: Response) => {
    try {
        const newReply = await createComplaintReplyService(req.body);
        res.status(201).json({ message: "Reply created", reply: newReply });
        return
    } catch (err) {
        res.status(500).json({ error: "Failed to create reply" });
        return
    }
};

// PUT: /complaint-replies/:replyId
export const updateComplaintReply = async (req: Request, res: Response) => {
    const replyId = parseInt(req.params.replyId);
    if (isNaN(replyId)) {
        res.status(400).json({ error: "Invalid replyId" });
        return
    }

    try {
        const updatedReply = await updateComplaintReplyService(replyId, req.body);
        if (!updatedReply) {
        res.status(404).json({ error: "Reply not found" });
        return
        }
        res.status(200).json({ message: "Reply updated", reply: updatedReply });
        return
    } catch (err) {
        res.status(500).json({ error: "Failed to update reply" });
        return
    }
};

// DELETE: /complaint-replies/:replyId
export const deleteComplaintReply = async (req: Request, res: Response) => {
    const replyId = parseInt(req.params.replyId);
    if (isNaN(replyId)) {
         res.status(400).json({ error: "Invalid replyId" });
         return
    }

    try {
        await deleteComplaintReplyService(replyId);
         res.status(200).json({ message: "Reply deleted successfully" });
         return
    } catch (err) {
         res.status(500).json({ error: "Failed to delete reply" });
         return
    }
};


export const getComplaintReplies = async (req: Request, res: Response): Promise<void> => {
    const complaintId = Number(req.params.complaintId);
    if (!complaintId) {
        res.status(400).json({ message: "Invalid complaintId" });
        return;
    }

    try {
        const replies = await getComplaintRepliesService(complaintId);
        res.status(200).json({ replies });
    } catch (err) {
        console.error("Error fetching complaint replies:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const addComplaintReply = async (req: Request, res: Response) => {
    const complaintId = Number(req.params.complaintId);
    const { message } = req.body;
    const senderId = req.user?.userId;

    if (!complaintId || !message || !senderId) {
        res.status(400).json({ message: "Missing complaintId, message, or senderId" });
        return;
    }

    try {
        const newReply = await addComplaintReplyService(complaintId, message, senderId);

        // Emit new reply via WebSocket
        const io = getSocketIOInstance();
        console.log(io);
        io.to(`complaint-${complaintId}`).emit("new-reply", newReply);

        res.status(201).json(newReply);
    } catch (error) {
        console.error("Error creating reply:", error);
        res.status(500).json({ message: "Failed to create reply", error });
    }
};
