import express from "express";
import {
  superAdminLogin,
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  getUserStats,
} from "../controllers/superadmin.controller.js";
import isSuperAdmin from "../middleware/isSuperAdmin.js";

const router = express.Router();

// SuperAdmin login (no authentication required)
router.post("/login", superAdminLogin);

// All other routes require authentication and SuperAdmin role
router.get("/pending-users", isSuperAdmin, getPendingUsers);
router.get("/users", isSuperAdmin, getAllUsers);
router.put("/approve-user/:userId", isSuperAdmin, approveUser);
router.put("/reject-user/:userId", isSuperAdmin, rejectUser);
router.get("/stats", isSuperAdmin, getUserStats);

export default router;
