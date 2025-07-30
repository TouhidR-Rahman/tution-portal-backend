import { Application } from "../models/application.model.js";
import TutorOpportunity from "../models/tutorOpportunity.model.js";

export const applyTutorOpportunity = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;
    if (!jobId) {
      return res
        .status(400)
        .json({ message: "Invalid job id", success: false });
    }
    // check if the user already has applied for this job
    const existingApplication = await Application.findOne({
      tutorOpportunity: jobId,
      applicant: userId,
    });
    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job",
        success: false,
      });
    }
    //check if the job exists or not
    const tutorOpportunity = await TutorOpportunity.findById(jobId);
    if (!tutorOpportunity) {
      return res
        .status(404)
        .json({ message: "Tutor opportunity not found", success: false });
    }
    // create a new application

    const newApplication = await Application.create({
      tutorOpportunity: jobId,
      applicant: userId,
    });
    tutorOpportunity.applications.push(newApplication._id);
    await tutorOpportunity.save();

    return res
      .status(201)
      .json({ message: "Application submitted", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAppliedTutorOpportunities = async (req, res) => {
  try {
    const userId = req.id;
    const application = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "tutorOpportunity",
        options: { sort: { createdAt: -1 } },
        populate: {
          path: "tutionCenter",
          options: { sort: { createdAt: -1 } },
        },
      });
    if (!application) {
      return res
        .status(404)
        .json({ message: "No applications found", success: false });
    }

    return res.status(200).json({ application, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.id; // Get the logged-in user ID

    const tutorOpportunity = await TutorOpportunity.findById(jobId).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: { path: "applicant", options: { sort: { createdAt: -1 } } },
    });

    if (!tutorOpportunity) {
      return res
        .status(404)
        .json({ message: "Tutor opportunity not found", success: false });
    }

    // Check if the user is the owner of this tutor opportunity
    if (tutorOpportunity.created_by.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to view applicants for this job",
        success: false,
      });
    }

    return res.status(200).json({ tutorOpportunity, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    const userId = req.id; // Get the logged-in user ID

    if (!status) {
      return res.status(400).json({
        message: "status is required",
        success: false,
      });
    }

    // find the application by application id and populate tutor opportunity
    const application = await Application.findOne({
      _id: applicationId,
    }).populate("tutorOpportunity");
    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
        success: false,
      });
    }

    // Check if the user is the owner of the tutor opportunity
    if (application.tutorOpportunity.created_by.toString() !== userId) {
      return res.status(403).json({
        message: "You are not authorized to update this application status",
        success: false,
      });
    }

    // update the status
    application.status = status.toLowerCase();
    await application.save();

    return res
      .status(200)
      .json({ message: "Application status updated", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};
