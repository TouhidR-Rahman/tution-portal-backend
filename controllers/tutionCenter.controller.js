import { TutionCenter } from "../models/tutionCenter.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloud.js";
import TutorOpportunity from "../models/tutorOpportunity.model.js";
import { Application } from "../models/application.model.js";

// Delete tution center and cascade delete jobs and applications
export const deleteTutionCenter = async (req, res) => {
  try {
    const tutionCenterId = req.params.id;
    const userId = req.id; // Get the logged-in user ID

    // First find the tution center to check ownership
    const tutionCenter = await TutionCenter.findById(tutionCenterId);
    if (!tutionCenter) {
      return res
        .status(404)
        .json({ success: false, message: "Tution center not found" });
    }

    // Check if the user is the owner of this tution center
    if (tutionCenter.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this tution center",
      });
    }

    // Delete the tution center
    await TutionCenter.findByIdAndDelete(tutionCenterId);

    // Find all tutor opportunities for this tution center
    const jobs = await TutorOpportunity.find({
      "tutionCenter.name": tutionCenter.name,
    });
    const jobIds = jobs.map(j => j._id);
    // Delete all applications for these jobs
    await Application.deleteMany({ tutorOpportunity: { $in: jobIds } });
    // Delete all tutor opportunities for this tution center
    await TutorOpportunity.deleteMany({
      "tutionCenter.name": tutionCenter.name,
    });
    res.status(200).json({
      success: true,
      message:
        "Tution center, associated jobs, and applications deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tution center:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete tution center" });
  }
};

export const registerTutionCenter = async (req, res) => {
  try {
    const { tutionCenterName } = req.body;
    if (!tutionCenterName) {
      return res.status(401).json({
        message: "Tution center name is required",
        success: false,
      });
    }
    let tutionCenter = await TutionCenter.findOne({
      name: tutionCenterName,
    });
    if (tutionCenter) {
      return res.status(401).json({
        message: "Tution center already exists",
        success: false,
      });
    }
    tutionCenter = await TutionCenter.create({
      name: tutionCenterName,
      userId: req.id,
    });
    return res.status(201).json({
      message: "Tution center registered successfully.",
      tutionCenter,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllTutionCenters = async (req, res) => {
  try {
    const userId = req.id; // loggedin user id
    const tutionCenters = await TutionCenter.find({ userId });
    if (!tutionCenters) {
      return res.status(404).json({ message: "No tution centers found" });
    }
    return res.status(200).json({
      tutionCenters,
      success: true,
    });
  } catch (error) {
    console.error(error);
  }
};

//get tution center by id
export const getTutionCenterById = async (req, res) => {
  try {
    const tutionCenterId = req.params.id;
    const userId = req.id; // Get the logged-in user ID

    const tutionCenter = await TutionCenter.findById(tutionCenterId);
    if (!tutionCenter) {
      return res.status(404).json({ message: "Tution center not found" });
    }

    // Check if the user is the owner of this tution center
    if (tutionCenter.userId.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to access this tution center",
        success: false,
      });
    }

    return res.status(200).json({ tutionCenter, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

//update tution center details
export const updateTutionCenter = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const file = req.file;
    const userId = req.id; // Get the logged-in user ID

    // First check if the tution center exists and belongs to the user
    const existingTutionCenter = await TutionCenter.findById(req.params.id);
    if (!existingTutionCenter) {
      return res
        .status(404)
        .json({ message: "Tution center not found", success: false });
    }

    // Check if the user is the owner of this tution center
    if (existingTutionCenter.userId.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to update this tution center",
        success: false,
      });
    }

    //cloudinary
    const fileUri = getDataUri(file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
    const logo = cloudResponse.secure_url;

    const updateData = { name, description, website, location, logo };

    const tutionCenter = await TutionCenter.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      },
    );

    return res.status(200).json({
      message: "Tution center updated",
      success: true,
      tutionCenter,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};
