import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    tutionCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TutionCenter",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

// Ensure one rating per tutor per tuition center
ratingSchema.index({ tutionCenter: 1, tutor: 1 }, { unique: true });

export const Rating = mongoose.model("Rating", ratingSchema);
