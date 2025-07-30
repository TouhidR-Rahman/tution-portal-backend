import TutorOpportunity from "../models/tutorOpportunity.model.js";
import { Application } from "../models/application.model.js";
import { validateTutorOpportunity } from "../utils/validation.js";

// Controller to get all tutor opportunities
export const getAllTutorOpportunities = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "desc";

    let query = {};

    if (keyword) {
      query = {
        $or: [
          { title: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      };
    }

    let sortOptions = {};

    // Handle different sort options
    if (sortBy === "rating") {
      // Sort by tuition center rating
      sortOptions = { "tutionCenter.averageRating": order === "desc" ? -1 : 1 };
    } else if (sortBy === "salary") {
      sortOptions = { salary: order === "desc" ? -1 : 1 };
    } else {
      sortOptions = { [sortBy]: order === "desc" ? -1 : 1 };
    }

    const tutorOpportunities = await TutorOpportunity.find(query)
      .populate({
        path: "tutionCenter",
        select: "name location logo averageRating totalRatings",
      })
      .populate({
        path: "created_by",
        select: "fullname email",
      })
      .sort(sortOptions);

    res.status(200).json({ success: true, tutorOpportunities });
  } catch (error) {
    console.error("Error fetching tutor opportunities:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch tutor opportunities" });
  }
};

// Controller to delete a tutor opportunity by ID
export const deleteTutorOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.id; // Get the logged-in user ID

    // First, find the tutor opportunity to check ownership
    const tutorOpportunity = await TutorOpportunity.findById(id);
    if (!tutorOpportunity) {
      return res
        .status(404)
        .json({ success: false, message: "Tutor opportunity not found" });
    }

    // Check if the user is the owner of this tutor opportunity
    if (tutorOpportunity.created_by.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this tutor opportunity",
      });
    }

    // Delete the tutor opportunity
    const deleted = await TutorOpportunity.findByIdAndDelete(id);

    // Delete all applications associated with this tutor opportunity
    await Application.deleteMany({ tutorOpportunity: id });

    res.status(200).json({
      success: true,
      message:
        "Tutor opportunity and associated applications deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tutor opportunity:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete tutor opportunity" });
  }
};

export const postTutorOpportunity = async (req, res) => {
  try {
    const {
      title,
      tutionType,
      requirements,
      salary,
      location,
      daysAvailable,
      experience,
      tutionCenterId,
    } = req.body;
    const userId = req.id;

    // Validate input data
    const validationErrors = validateTutorOpportunity({
      title,
      tutionType,
      location,
      salary,
      experienceLevel: experience,
      requirements: requirements ? requirements.split(",") : [],
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: validationErrors[0],
        success: false,
      });
    }

    // Additional validation for specific fields
    if (!tutionType || !tutionCenterId || !daysAvailable) {
      return res.status(400).json({
        message: "Tution type, days available, and center are required",
        success: false,
      });
    }

    // Validate tutionType is one of the allowed values
    const allowedTutionTypes = ["Class 9", "SSC", "HSC", "Admission"];
    if (!allowedTutionTypes.includes(tutionType)) {
      return res.status(400).json({
        message:
          "Invalid tution type. Must be one of: Class 9, SSC, HSC, Admission",
        success: false,
      });
    }

    // Fetch tution center details for embedding
    const { TutionCenter } = await import("../models/tutionCenter.model.js");
    const tutionCenterDoc = await TutionCenter.findById(tutionCenterId);
    if (!tutionCenterDoc) {
      return res
        .status(404)
        .json({ message: "Tution center not found", success: false });
    }
    if (!tutionCenterDoc.logo) {
      return res.status(400).json({
        message: "Tution center must have a logo before posting a job.",
        status: false,
      });
    }
    const tutorOpportunity = await TutorOpportunity.create({
      title,
      tutionType,
      requirements: requirements.split(","),
      salary: Number(salary),
      location,
      daysAvailable: Array.isArray(daysAvailable)
        ? daysAvailable
        : daysAvailable.split(","),
      experienceLevel: experience,
      tutionCenter: tutionCenterId,
      created_by: userId,
    });
    res.status(201).json({
      message: "Tutor opportunity posted successfully.",
      tutorOpportunity,
      status: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", status: false });
  }
};

// Controller to get admin tutor opportunities
export const getAdminTutorOpportunities = async (req, res) => {
  try {
    const userId = req.id; // Get the logged-in user ID
    const adminTutorOpportunities = await TutorOpportunity.find({
      created_by: userId,
    })
      .populate({
        path: "tutionCenter",
        select: "name location logo averageRating totalRatings",
      })
      .populate({
        path: "created_by",
        select: "fullname email",
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, adminTutorOpportunities });
  } catch (error) {
    console.error("Error fetching admin tutor opportunities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin tutor opportunities",
    });
  }
};

// Controller to get a tutor opportunity by ID
export const getTutorOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.id; // Get the logged-in user ID

    const tutorOpportunity = await TutorOpportunity.findById(id).populate({
      path: "applications",
      populate: { path: "applicant" },
    });

    if (!tutorOpportunity) {
      return res.status(404).json({
        success: false,
        message: "Tutor opportunity not found",
      });
    }

    // Check if the user is the owner of this tutor opportunity
    if (tutorOpportunity.created_by.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this tutor opportunity",
      });
    }

    res.status(200).json({ success: true, tutorOpportunity });
  } catch (error) {
    console.error("Error fetching tutor opportunity by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tutor opportunity",
    });
  }
};

// Controller to get a tutor opportunity by ID for public viewing (for job details/description)
export const getTutorOpportunityForPublic = async (req, res) => {
  try {
    const { id } = req.params;

    const tutorOpportunity = await TutorOpportunity.findById(id)
      .populate({
        path: "tutionCenter",
        select: "name location logo averageRating totalRatings",
      })
      .populate({
        path: "applications",
        populate: { path: "applicant" },
      });

    if (!tutorOpportunity) {
      return res.status(404).json({
        success: false,
        message: "Tutor opportunity not found",
      });
    }

    res.status(200).json({ success: true, tutorOpportunity });
  } catch (error) {
    console.error("Error fetching tutor opportunity by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tutor opportunity",
    });
  }
};

// Controller to update a tutor opportunity by ID
export const updateTutorOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.id; // Get the logged-in user ID
    const {
      title,
      description,
      requirements,
      salary,
      location,
      tutionType,
      experience,
      tutionCenterId,
    } = req.body;

    // Find the existing tutor opportunity
    const existingOpportunity = await TutorOpportunity.findById(id);
    if (!existingOpportunity) {
      return res.status(404).json({
        success: false,
        message: "Tutor opportunity not found",
      });
    }

    // Check if the user is the owner of this tutor opportunity
    if (existingOpportunity.created_by.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this tutor opportunity",
      });
    }

    // Validate input data
    const validationErrors = validateTutorOpportunity({
      title,
      description,
      location,
      salary,
      experienceLevel: experience,
      requirements: requirements ? requirements.split(",") : [],
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: validationErrors[0],
        success: false,
      });
    }

    // Additional validation for specific fields
    if (!tutionType || !tutionCenterId) {
      return res.status(400).json({
        message: "Tuition type and center are required",
        success: false,
      });
    }

    // Fetch tution center details for embedding
    const { TutionCenter } = await import("../models/tutionCenter.model.js");
    const tutionCenterDoc = await TutionCenter.findById(tutionCenterId);
    if (!tutionCenterDoc) {
      return res
        .status(404)
        .json({ message: "Tution center not found", success: false });
    }

    // Check if the tution center belongs to the user
    if (tutionCenterDoc.userId.toString() !== userId) {
      return res.status(403).json({
        message: "You can only assign jobs to your own tution centers",
        success: false,
      });
    }

    if (!tutionCenterDoc.logo) {
      return res.status(400).json({
        message: "Tution center must have a logo before updating a job.",
        success: false,
      });
    }

    // Update the tutor opportunity
    const updatedOpportunity = await TutorOpportunity.findByIdAndUpdate(
      id,
      {
        title,
        description,
        requirements: requirements.split(","),
        salary: Number(salary),
        location,
        tutionType,
        experienceLevel: experience,
        tutionCenter: tutionCenterId,
      },
      { new: true },
    );

    res.status(200).json({
      message: "Tutor opportunity updated successfully.",
      tutorOpportunity: updatedOpportunity,
      success: true,
    });
  } catch (error) {
    console.error("Error updating tutor opportunity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tutor opportunity",
    });
  }
};
