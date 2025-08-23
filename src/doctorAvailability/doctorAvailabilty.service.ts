import db from "../drizzle/db";
import { doctorAvailability, DoctorAvailabilityInsert, DoctorAvailabilitySelect } from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

// 1️⃣ Create new availability
export const createDoctorAvailabilityService = async (data: DoctorAvailabilityInsert): Promise<DoctorAvailabilitySelect> => {
    const [newAvailability] = await db.insert(doctorAvailability).values(data).returning();
    return newAvailability;
};

// 2️⃣ Get all availabilities for a specific doctor
export const getDoctorAvailabilityByDoctorIdService = async (doctorId: number): Promise<DoctorAvailabilitySelect[]> => {
    return await db.select()
        .from(doctorAvailability)
        .where(eq(doctorAvailability.doctorId, doctorId))
        .orderBy(desc(doctorAvailability.dayOfWeek));
};

// 3️⃣ Get availability by availabilityId (single record)
export const getDoctorAvailabilityByIdService = async (availabilityId: number): Promise<DoctorAvailabilitySelect | undefined> => {
    const [availability] = await db.select()
        .from(doctorAvailability)
        .where(eq(doctorAvailability.availabilityId, availabilityId));
    return availability;
};

// 4️⃣ Update availability by availabilityId
export const updateDoctorAvailabilityService = async (availabilityId: number,data: Partial<DoctorAvailabilityInsert>): Promise<DoctorAvailabilitySelect | undefined> => {
    const [updated] = await db.update(doctorAvailability)
        .set(data)
        .where(eq(doctorAvailability.availabilityId, availabilityId))
        .returning();
    return updated;
};

// 5️⃣ Delete availability by availabilityId
export const deleteDoctorAvailabilityService = async (availabilityId: number): Promise<void> => {
    await db.delete(doctorAvailability).where(eq(doctorAvailability.availabilityId, availabilityId));
};

// 6️⃣ Get all availabilities (with optional pagination, admin use case)
export const getAllDoctorAvailabilitiesService = async (page: number = 1,pageSize: number = 20): Promise<{ availabilities: any[]; total: number }> => {
    const [availabilities, totalResult] = await Promise.all([
        db.query.doctorAvailability.findMany({
        with: {
            doctor: {
            with: {
                user: {
                    columns:{
                        password: false
                    }
                },
            },
            },
        },
        orderBy: desc(doctorAvailability.updatedAt),
        offset: (page - 1) * pageSize,
        limit: pageSize,
        }),
        db.select({ count: sql<number>`count(*)` }).from(doctorAvailability),
    ]);

    const total = totalResult[0]?.count ?? 0;

    return { availabilities, total };
};
