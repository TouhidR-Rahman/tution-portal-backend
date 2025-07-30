import express from "express";

import {
  getAllTutorOpportunities,
  getAdminTutorOpportunities,
  getTutorOpportunityById,
  getTutorOpportunityForPublic,
  postTutorOpportunity,
  deleteTutorOpportunity,
  updateTutorOpportunity,
} from "../controllers/tutorOpportunity.controller.js";
import authenticateToken from "../middleware/isAuthenticated.js";
import isApproved from "../middleware/isApproved.js";

const router = express.Router();

// Route to get all tutor opportunities (public - no auth needed)
router.get("/get", getAllTutorOpportunities);
router.route("/post").post(authenticateToken, isApproved, postTutorOpportunity);
router
  .route("/getadminopportunities")
  .get(authenticateToken, isApproved, getAdminTutorOpportunities);

// Route to get a tutor opportunity by ID for public viewing (job details)
router.route("/get/:id").get(getTutorOpportunityForPublic);

// Route to get a tutor opportunity by ID for admin (editing)
router
  .route("/admin/:id")
  .get(authenticateToken, isApproved, getTutorOpportunityById);

// Route to update a tutor opportunity
router
  .route("/update/:id")
  .put(authenticateToken, isApproved, updateTutorOpportunity);

// Route to delete a tutor opportunity
router
  .route("/:id")
  .delete(authenticateToken, isApproved, deleteTutorOpportunity);

export default router;
