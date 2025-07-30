import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import {
  submitRating,
  getTutionCenterRatings,
  getTutorRating,
  getRateableTutionCenters,
} from "../controllers/rating.controller.js";

const router = express.Router();

// Submit or update rating for a tuition center
router.route("/submit/:tutionCenterId").post(authenticateToken, submitRating);

// Get ratings for a tuition center (public endpoint)
router.route("/center/:tutionCenterId").get(getTutionCenterRatings);

// Get tutor's rating for a specific tuition center
router.route("/tutor/:tutionCenterId").get(authenticateToken, getTutorRating);

// Get tuition centers that a tutor can rate
router.route("/rateable").get(authenticateToken, getRateableTutionCenters);

export default router;
