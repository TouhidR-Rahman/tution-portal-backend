import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isSuperAdmin = async (req, res, next) => {
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

    // Check if user is SuperAdmin
    if (user.role !== "SuperAdmin") {
      return res.status(403).json({
        message: "Access denied. SuperAdmin privileges required.",
        success: false,
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

export default isSuperAdmin;
