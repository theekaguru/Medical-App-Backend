import { desc, eq, sql } from "drizzle-orm";
import { UserInsert, UserRole, users, UserSelect } from "../drizzle/schema";
import db from "../drizzle/db";

export type UserListItem = {
    password: string | null;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    contactPhone: string | null;
    address: string | null;
    appointments: any[];   // Optional: Strongly type this too
    complaints: any[];
};


export const getAllUsersService = async (page: number, pageSize: number) => {
  // Get total count using raw SQL
    const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users);

    const usersList = await db.query.users.findMany({
        columns: {
            password: false
        },
        with: {
            appointments: true,
            complaints: true,
        },
        orderBy: desc(users.userId),
        offset: (page - 1) * pageSize,
        limit: pageSize,
    });

    return { users: usersList, total: Number(count) };
};

export const getUserByIdService = async (userId: number): Promise<UserListItem | undefined> => {
    const user = await db.query.users.findFirst({
        where: eq(users.userId, userId),
        // columns: {
        //     password: false
        // },
        with: {
            appointments: true,
            complaints: true,
        },
        },
    );

    return user;
}

export const updateUserByIdService = async (userId: number, userData: UserInsert): Promise<UserSelect | undefined> => {
    const updatedUser = await db.update(users)
        .set(userData)
        .where(eq(users.userId, userId))
        .returning();

    return updatedUser[0];
}

export const deleteUserByIdService = async (userId: number): Promise<string> => {
    await db.delete(users).where(eq(users.userId, userId));
    return `User with ID ${userId} deleted successfully`;
}

export const updateUserRoleService = async (id: number, role: UserRole): Promise<UserSelect> => {
  const [updatedUser] = await db
    .update(users)
    .set({ role })
    .where(eq(users.userId, id))
    .returning();

  return updatedUser;
};

export const updateProfileImageService = async (id: number,imageUrl: string): Promise<UserSelect> => {
  const [updatedUser] = await db.update(users).set({ profileImageUrl: imageUrl }).where(eq(users.userId, id)).returning();

  return updatedUser;
};

export const updateUserPasswordService = async (email: string, newPassword: string): Promise<string> => {
    const result = await db.update(users)
        .set({ password: newPassword })
        .where(eq(users.email, email))
        .returning();

    if (result.length === 0) {
        throw new Error("User not found or password update failed");
    }
    
    return "Password updated successfully";
}