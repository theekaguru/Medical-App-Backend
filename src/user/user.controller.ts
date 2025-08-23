import e, { Request, Response } from "express";
import { deleteUserByIdService, getAllUsersService, getUserByIdService, updateUserByIdService, updateUserRoleService,updateProfileImageService, updateUserPasswordService } from "./user.service";   
import { registerUserValidator } from "../validators/user.validator";
import bcrypt from "bcrypt";


export const getAllUsers = async (req: Request, res: Response) => {
  const page = Number(req.query.page);
  const pageSize = Number(req.query.pageSize);

  try {
    const { users, total } = await getAllUsersService(page, pageSize);
    if (!users || users.length === 0) {
      res.status(404).json({ error: "No users found" });
      return;
    }
    res.status(200).json({ users, total });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
    }

    try {
        const user = await getUserByIdService(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
}

export const updateUserById = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const parsedData = registerUserValidator.safeParse(req.body);
    
    if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
    }
    if (!parsedData.success) {
        res.status(400).json({ error: "Invalid user data", details: parsedData.error.errors });
        return;
    }

    const userData = parsedData.data;

    try {
        const updatedUser = await updateUserByIdService(userId, userData);
        if (!updatedUser) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
}

export const deleteUserById = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        res.status(400).json({ error: "Invalid user ID" });
        return;
    }

    try {
        const message = await deleteUserByIdService(userId);
        res.status(200).json({ message });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
}


export const updateUserRoleOnly = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);

  console.log(userId);
  if (isNaN(userId)) {
    res.status(400).json({ message: "Invalid user ID" });
    return 
  }

  const { role } = req.body;

  const allowedUserTypes = ["admin", "user", "doctor"] as const;

  if (!allowedUserTypes.includes(role)) {
    res.status(400).json({ message: "Invalid user type" });
    return 
  }

  try {
    const updatedUser = await updateUserRoleService(userId, role as typeof allowedUserTypes[number]);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user type:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfileImage = async (req: Request, res: Response) => {
  const { id } = req.params; // ✅ grab from URL param
  const { profileUrl } = req.body;

  if (!id || !profileUrl) {
    res.status(400).json({ error: "Missing userId or profileUrl" });
    return
  }

  try {
    const userId = parseInt(id);
    const data = await updateProfileImageService(userId, profileUrl);
    res.status(200).json({ message: "Image Updated successfully", data });
  } catch (error: any) {
    res.status(400).json({ error: "Failed to upload", err: error.message });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
     res.status(400).json({ error: "Current password or new password is missing" });
     return
  }

  try {
    const user = await getUserByIdService(id);

    if (!user) {
       res.status(404).json({ error: "User not found" });
       return
    }

    // Compare current password with hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password!);
    if (!isMatch) {
       res.status(401).json({ error: "Current password is incorrect" });
       return
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await updateUserPasswordService(user.email!, hashedPassword);

     res.status(200).json({ message: "Password has been updated successfully" });
     return
  } catch (error: any) {
     res.status(500).json({ error: error.message || "Server error" });
     return
  }
};

