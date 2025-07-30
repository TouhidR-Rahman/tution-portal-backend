import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isApproved = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    const user = await User.findById(decode.userId);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
        success: false,
      });
    }

    // Allow SuperAdmin to access all routes
    if (user.role === "SuperAdmin") {
      req.user = user;
      return next();
    }

    // Check if user is approved
    if (user.status !== "approved") {
      return res.status(403).json({
        message:
          "Your account is pending approval. Please wait for admin approval.",
        success: false,
        userStatus: user.status,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

export default isApproved;
