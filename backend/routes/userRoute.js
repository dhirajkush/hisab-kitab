import express from 'express';
import { getCurrentUser, loginUser, registerUser, updatePassword, updateProfile, googleAuth, updateProfilePic, refreshAccessToken, logoutUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/Auth.js';

const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/google", googleAuth);
userRouter.post("/refresh", refreshAccessToken);

//protected Routes

userRouter.get("/me", authMiddleware, getCurrentUser);
userRouter.put("/profile", authMiddleware, updateProfile);
userRouter.put("/password", authMiddleware, updatePassword);
userRouter.put("/profile-pic", authMiddleware, updateProfilePic);
userRouter.post("/logout", authMiddleware, logoutUser);

export default userRouter;
