import { desc, eq } from "drizzle-orm";
import db from "../drizzle/db";
import { ComplaintInsert, complaints, ComplaintSelect, ComplaintStatus } from "../drizzle/schema";

export const getAllComplaintsService = async (page:number, pageSize: number): Promise<ComplaintSelect[] | null> => {
    const complaintsList = await db.query.complaints.findMany({
        with: {
            user: true,
            appointment: true,
        },
        orderBy: desc(complaints.complaintId),
        offset: (page - 1) * pageSize,
        limit: pageSize,
    });

    return complaintsList;
}

export const getComplaintByIdService = async (complaintId: number): Promise<ComplaintSelect | undefined> => {
    const complaint = await db.query.complaints.findFirst({
        where: eq(complaints.complaintId, complaintId),
        with: {
            user: true,
            appointment: true,
        },
    });

    return complaint;
}

export const createComplaintService = async (complaint: ComplaintInsert): Promise<ComplaintSelect | undefined> => {
    const [newComplaint] = await db.insert(complaints).values(complaint).returning();

    return newComplaint;
}

export const updateComplaintService = async (complaintId: number, complaint: ComplaintInsert): Promise<ComplaintSelect | undefined> => {
    const [updatedComplaint] = await db.update(complaints)
        .set(complaint)
        .where(eq(complaints.complaintId, complaintId))
        .returning();

    return updatedComplaint;
}

export const deleteComplaintService = async (complaintId: number): Promise<string> => {
    await db.delete(complaints).where(eq(complaints.complaintId, complaintId));
    return "Complaint deleted successfully";
}

export const getAllComplaintsByUserService = async (page: number, pageSize: number, userId: number): Promise<ComplaintSelect[] | null> => {
    const complaintsList = await db.query.complaints.findMany({
        where: eq(complaints.userId, userId),
        with: {
            user: true,
            appointment: true,
        },
        orderBy: desc(complaints.complaintId),
        offset: (page - 1) * pageSize,
        limit: pageSize,
    });

    return complaintsList;
}

export const updateComplaintStatusService = async (complaintId: number,status: ComplaintStatus): Promise<ComplaintSelect | undefined> => {
    const [updatedComplaint] = await db
        .update(complaints)
        .set({ status: status }) // ✅ Typed correctly
        .where(eq(complaints.complaintId, complaintId))
        .returning();

    return updatedComplaint;
};