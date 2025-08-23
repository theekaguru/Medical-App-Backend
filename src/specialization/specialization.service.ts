// Services
import { and, eq, sql, desc } from "drizzle-orm";
import db from "../drizzle/db";
import { SpecializationInsert, specializations, SpecializationSelect, users, UserSelect } from "../drizzle/schema";

export const getSpecializationsService = async (page: number, pageSize: number) => {
  const [specializationsList, totalResult] = await Promise.all([
    db.query.specializations.findMany({
      orderBy: desc(specializations.specializationId),
      offset: pageSize * (page - 1),
      limit: pageSize,
    }),
    db.select({ count: sql<number>`count(*)` }).from(specializations),
  ]);

  const totalCount = totalResult[0]?.count ?? 0;

  return { specializations: specializationsList, total: totalCount };
};

export const getSpecializationByIdService = async (specializationId: number): Promise<SpecializationSelect | undefined> => {
  const specialization = await db.query.specializations.findFirst({
    where: (s) => eq(s.specializationId, specializationId),
  });

  return specialization;
};

export const createSpecializationService = async (specialization: SpecializationInsert): Promise<SpecializationSelect> => {
  const [newSpecialization] = await db.insert(specializations).values(specialization).returning();

  return newSpecialization;
};

export const updateSpecializationService = async (specializationId: number, specialization: SpecializationInsert): Promise<SpecializationSelect | undefined> => {
  const [updatedSpecialization] = await db.update(specializations)
    .set(specialization)
    .where(eq(specializations.specializationId, specializationId))
    .returning();

  return updatedSpecialization;
};

export const deleteSpecializationService = async (specializationId: number): Promise<string> => {
  await db.delete(specializations).where(eq(specializations.specializationId, specializationId));
  return "Specialization deleted successfully 😎";
};

