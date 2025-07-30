import { Rating } from "../models/rating.model.js";
import { TutionCenter } from "../models/tutionCenter.model.js";
import { Application } from "../models/application.model.js";

// Submit or update rating for a tuition center
export const submitRating = async (req, res) => {
  try {
    const userId = req.id;
    const { tutionCenterId } = req.params;
    const { rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
        success: false,
      });
    }

    // Check if tuition center exists
    const tutionCenter = await TutionCenter.findById(tutionCenterId);
    if (!tutionCenter) {
      return res.status(404).json({
        message: "Tuition center not found",
        success: false,
      });
    }

    // Check if the tutor has any accepted applications for this tuition center
    const acceptedApplications = await Application.find({
      applicant: userId,
      status: "accepted",
    }).populate({
      path: "tutorOpportunity",
      match: { tutionCenter: tutionCenterId },
    });

    const hasAcceptedApplication = acceptedApplications.some(
      app => app.tutorOpportunity !== null,
    );

    if (!hasAcceptedApplication) {
      return res.status(403).json({
        message:
          "You can only rate tuition centers where you have been accepted as a tutor",
        success: false,
      });
    }

    // Check if rating already exists and update or create
    let existingRating = await Rating.findOne({
      tutionCenter: tutionCenterId,
      tutor: userId,
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.comment = comment;
      await existingRating.save();
    } else {
      // Create new rating
      existingRating = new Rating({
        tutionCenter: tutionCenterId,
        tutor: userId,
        rating,
        comment,
      });
      await existingRating.save();
    }

    // Recalculate average rating for the tuition center
    await updateTutionCenterRating(tutionCenterId);

    res.status(200).json({
      message: "Rating submitted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Get ratings for a tuition center
export const getTutionCenterRatings = async (req, res) => {
  try {
    const { tutionCenterId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({ tutionCenter: tutionCenterId })
      .populate("tutor", "fullname profile.profilePhoto")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalRatings = await Rating.countDocuments({
      tutionCenter: tutionCenterId,
    });

    res.status(200).json({
      ratings,
      totalRatings,
      currentPage: page,
      totalPages: Math.ceil(totalRatings / limit),
      success: true,
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Get tutor's rating for a specific tuition center
export const getTutorRating = async (req, res) => {
  try {
    const userId = req.id;
    const { tutionCenterId } = req.params;

    const rating = await Rating.findOne({
      tutionCenter: tutionCenterId,
      tutor: userId,
    });

    res.status(200).json({
      rating,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching tutor rating:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Helper function to update tuition center's average rating
async function updateTutionCenterRating(tutionCenterId) {
  try {
    const ratings = await Rating.find({ tutionCenter: tutionCenterId });

    if (ratings.length === 0) {
      await TutionCenter.findByIdAndUpdate(tutionCenterId, {
        averageRating: 0,
        totalRatings: 0,
      });
      return;
    }

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = totalRating / ratings.length;

    await TutionCenter.findByIdAndUpdate(tutionCenterId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalRatings: ratings.length,
    });
  } catch (error) {
    console.error("Error updating tuition center rating:", error);
  }
}

// Get tuition centers that a tutor can rate (has accepted applications)
export const getRateableTutionCenters = async (req, res) => {
  try {
    const userId = req.id;

    // Find all accepted applications for this tutor
    const acceptedApplications = await Application.find({
      applicant: userId,
      status: "accepted",
    }).populate({
      path: "tutorOpportunity",
      populate: {
        path: "tutionCenter",
      },
    });

    // Extract unique tuition centers
    const tutionCenters = [];
    const seenCenterIds = new Set();

    for (const application of acceptedApplications) {
      if (
        application.tutorOpportunity &&
        application.tutorOpportunity.tutionCenter &&
        application.tutorOpportunity.tutionCenter._id
      ) {
        const center = application.tutorOpportunity.tutionCenter;
        const centerId = center._id.toString();

        if (!seenCenterIds.has(centerId)) {
          seenCenterIds.add(centerId);

          // Check if tutor has already rated this center
          const existingRating = await Rating.findOne({
            tutionCenter: center._id,
            tutor: userId,
          });

          tutionCenters.push({
            ...center.toObject(),
            hasRated: !!existingRating,
            userRating: existingRating ? existingRating.rating : null,
          });
        }
      }
    }

    res.status(200).json({
      tutionCenters,
      success: true,
    });
  } catch (error) {
    console.error("Error fetching rateable tuition centers:", error);
    res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
