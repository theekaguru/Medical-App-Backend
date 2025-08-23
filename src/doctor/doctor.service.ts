import { eq, sql, desc } from "drizzle-orm";
import db from "../drizzle/db";
import { DoctorInsert, doctors, DoctorSelect, users, UserSelect } from "../drizzle/schema";

export const getDoctorsService = async (page: number, pageSize: number) => {
    const [doctorsList, totalResult] = await Promise.all([
        db.query.doctors.findMany({
        with: {
            availability: true,
            appointments: true,
            prescriptions: true,
            user: {
            columns: {
                password: false,
            },
            },
            specialization: true
        },
        orderBy: desc(doctors.doctorId),
        offset: pageSize * (page - 1),
        limit: pageSize,
        }),
        db.select({ count: sql<number>`count(*)` }).from(doctors), // Correct way to count
    ]);

    const totalCount = totalResult[0]?.count ?? 0;

    return { doctors: doctorsList, total: totalCount };
};


export const getDoctorByIdService = async (doctorId: number): Promise<DoctorSelect | undefined> => {
    const doctor = await db.query.doctors.findFirst({
        where: (doctors) => eq(doctors.doctorId, doctorId),
        with: {
            availability: true,
            appointments: true,
            prescriptions: true,
            user: {
            columns: {
                password: false,
            },
            },
            specialization: true
        },
    });

    return doctor;
}

export const createDoctorService = async (doctor: DoctorInsert): Promise<DoctorSelect> => {
    const [newDoctor] = await db.insert(doctors).values(doctor).returning();

    return newDoctor;
}

export const updateDoctorService = async (doctorId: number, doctor: DoctorInsert): Promise<DoctorSelect | undefined> => {
    const [updatedDoctor] = await db.update(doctors)
        .set(doctor)
        .where(eq(doctors.doctorId, doctorId))
        .returning();

    return updatedDoctor;
}

export const deleteDoctorService = async (doctorId: number): Promise<string> => {
    await db.delete(doctors).where(eq(doctors.doctorId, doctorId));
    return "Doctor deleted successfully 😎";
}

export const getUserDoctorsService = async (page: number, pageSize: number): Promise<{ doctors: UserSelect[]; total: number } | null> => {
  // 1. Get userIds of existing doctors (may include nulls)
  const existingDoctorIdsResult = await db.select({ userId: doctors.userId }).from(doctors);

  // 2. Filter out nulls
  const existingDoctorIds = existingDoctorIdsResult
    .map(d => d.userId)
    .filter((id): id is number => id !== null);

  let whereCondition;

  if (existingDoctorIds.length > 0) {
    whereCondition = sql`(${users.role} = 'doctor' AND ${users.userId} NOT IN (${sql.join(existingDoctorIds, sql.raw(', '))}))`;
  } else {
    whereCondition = eq(users.role, 'doctor');
  }

  const [doctorsList, totalResult] = await Promise.all([
    db.query.users.findMany({
      where: whereCondition,
      orderBy: desc(users.userId),
      offset: pageSize * (page - 1),
      limit: pageSize,
    }),
    db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereCondition),
  ]);

  const totalCount = totalResult[0]?.count ?? 0;

  return { doctors: doctorsList, total: totalCount };
};

export const getDoctorsBySpecializationService = async (specializationId: number): Promise<DoctorSelect[]> => {
  const result = await db.query.doctors.findMany({
    where: eq(doctors.specializationId, specializationId),
    with: {
      user: {
        columns: { password: false },  // Remove sensitive fields
      },
      specialization: true,
      availability: true,
    },
  });

  return result;
};
