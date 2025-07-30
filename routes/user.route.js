import express from "express";

import {
  login,
  logout,
  register,
  updateProfile,
  getUserById,
} from "../controllers/user.controller.js";
import authenticateToken from "../middleware/isAuthenticated.js";
import isApproved from "../middleware/isApproved.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router
  .route("/profile/update")
  .post(authenticateToken, isApproved, singleUpload, updateProfile);
router.route("/:id").get(getUserById);

export default router;
