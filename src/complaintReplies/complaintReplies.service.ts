import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import {complaintReplies,ComplaintReplySelect,ComplaintReplyInsert, complaints} from "../drizzle/schema";

// Get all complaint replies with pagination
export const getAllComplaintRepliesService = async (page: number,pageSize: number): Promise<ComplaintReplySelect[] | null> => {
    const offset = (page - 1) * pageSize;

    const replies = await db.query.complaintReplies.findMany({
        limit: pageSize,
        offset,
        orderBy: (complaintReplies) => [complaintReplies.createdAt],
    });

    return replies.length > 0 ? replies : null;
};

// Get complaint replies by userId
export const getComplaintReplyByIdService = async (id: number): Promise<ComplaintReplySelect | undefined> => {
    const reply = await db.query.complaintReplies.findFirst({
        where: eq(complaintReplies.replyId, id)
    });
    
    return reply;
};

// Create a new complaint reply
export const createComplaintReplyService = async (data: ComplaintReplyInsert): Promise<ComplaintReplySelect> => {
    const [insertedReply] = await db
        .insert(complaintReplies)
        .values(data)
        .returning();

    return insertedReply;
};

// Update a complaint reply
export const updateComplaintReplyService = async (id: number,updatedData: ComplaintReplySelect): Promise<ComplaintReplySelect | null> => {
    const [updatedReply] = await db
        .update(complaintReplies)
        .set(updatedData)
        .where(eq(complaintReplies.replyId, id))
        .returning();

    return updatedReply ?? null;
};

// Delete a complaint reply
export const deleteComplaintReplyService = async (id: number): Promise<string> => {
    await db.delete(complaintReplies).where(eq(complaintReplies.replyId, id));
    return "Complaint Reply deleted successfully";
};

export const getComplaintRepliesService = async (complaintId: number) => {
  const replies = await db
    .select()
    .from(complaintReplies)
    .where(eq(complaintReplies.complaintId, complaintId))
    .orderBy(complaintReplies.createdAt);

  return replies;
};

// POST a new reply
export const addComplaintReplyService = async (complaintId: number, message: string, senderId: number) => {
  const [reply] = await db
    .insert(complaintReplies)
    .values({
      complaintId,
      senderId,
      message,
    })
    .returning(); // returns inserted row(s)

  return reply;
};
