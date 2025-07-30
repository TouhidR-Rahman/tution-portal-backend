import mongoose from "mongoose";

const tutorOpportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    tutionType: {
      type: String,
      required: true,
      enum: ["Class 9", "SSC", "HSC", "Admission"],
    },
    salary: { type: Number, required: true },
    daysAvailable: { type: [String], required: true },
    location: { type: String, required: true },
    requirements: { type: [String], required: true },
    experienceLevel: { type: Number, required: true },
    tutionCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TutionCenter",
      required: true,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const TutorOpportunity =
  mongoose.models.TutorOpportunity ||
  mongoose.model("TutorOpportunity", tutorOpportunitySchema);

export default TutorOpportunity;
