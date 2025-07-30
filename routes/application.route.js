import express from "express";

import authenticateToken from "../middleware/isAuthenticated.js";
import isApproved from "../middleware/isApproved.js";
import {
  applyTutorOpportunity,
  getApplicants,
  getAppliedTutorOpportunities,
  updateStatus,
} from "../controllers/application.controller.js";

const router = express.Router();

router
  .route("/apply/:id")
  .get(authenticateToken, isApproved, applyTutorOpportunity);
router
  .route("/get")
  .get(authenticateToken, isApproved, getAppliedTutorOpportunities);
router
  .route("/:id/applicants")
  .get(authenticateToken, isApproved, getApplicants);
router
  .route("/status/:id/update")
  .post(authenticateToken, isApproved, updateStatus);

export default router;
