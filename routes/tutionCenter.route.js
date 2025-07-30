import express from "express";

import {
  getAllTutionCenters,
  getTutionCenterById,
  registerTutionCenter,
  updateTutionCenter,
  deleteTutionCenter,
} from "../controllers/tutionCenter.controller.js";
import authenticateToken from "../middleware/isAuthenticated.js";
import isApproved from "../middleware/isApproved.js";
import { singleUpload } from "../middleware/multer.js";

const router = express.Router();

// Delete tution center and cascade delete jobs and applications
router.route("/:id").delete(authenticateToken, isApproved, deleteTutionCenter);

router
  .route("/register")
  .post(authenticateToken, isApproved, registerTutionCenter);
router.route("/get").get(authenticateToken, isApproved, getAllTutionCenters);
router
  .route("/get/:id")
  .get(authenticateToken, isApproved, getTutionCenterById);
router
  .route("/update/:id")
  .put(authenticateToken, isApproved, singleUpload, updateTutionCenter);

export default router;
