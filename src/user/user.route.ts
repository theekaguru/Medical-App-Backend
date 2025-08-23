import { Router } from "express";
import { getAllUsers, getUserById,updateUserById,deleteUserById,updateUserRoleOnly,updateProfileImage, updatePassword } from "./user.controller";
import { pagination } from "../middleware/pagination";
import { adminAuth, allRolesAuth, userAuth } from "../middleware/bearAuth";

const userRouter = Router();

userRouter.get("/users", pagination, getAllUsers);
userRouter.patch("/users/:id/upload-profile-pic", allRolesAuth, updateProfileImage);
userRouter.patch("/users/:id/password-reset", allRolesAuth, updatePassword);
userRouter.get("/users/:id", getUserById);
userRouter.patch("/users/:id", updateUserById);
userRouter.delete("/users/:id", deleteUserById);
userRouter.patch("/users/role/:id", adminAuth, updateUserRoleOnly);

export default userRouter;