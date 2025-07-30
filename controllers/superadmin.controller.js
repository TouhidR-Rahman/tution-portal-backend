import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Fixed SuperAdmin credentials
const SUPERADMIN_EMAIL = "superadmin@jobportal.com";
const SUPERADMIN_PASSWORD = "SuperAdmin@123";

// SuperAdmin Login
export const superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    // Check if credentials match fixed SuperAdmin credentials
    if (email !== SUPERADMIN_EMAIL || password !== SUPERADMIN_PASSWORD) {
      return res.status(401).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Create or find SuperAdmin user
    let superAdmin = await User.findOne({ email: SUPERADMIN_EMAIL });

    if (!superAdmin) {
      // Create SuperAdmin user if doesn't exist
      const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
      superAdmin = await User.create({
        fullname: "Super Admin",
        email: SUPERADMIN_EMAIL,
        password: hashedPassword,
        phoneNumber: "01700000000",
        role: "SuperAdmin",
        status: "approved",
      });
    }

    // Generate JWT token
    const tokenData = {
      userId: superAdmin._id,
    };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const user = {
      _id: superAdmin._id,
      fullname: superAdmin.fullname,
      email: superAdmin.email,
      phoneNumber: superAdmin.phoneNumber,
      role: superAdmin.role,
      status: superAdmin.status,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        message: "SuperAdmin logged in successfully",
        user,
        success: true,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Get all pending users
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      status: "pending",
      role: { $ne: "SuperAdmin" },
    }).select("-password");

    return res.status(200).json({
      users: pendingUsers,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Get all users with status filter
export const getAllUsers = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = { role: { $ne: "SuperAdmin" } };
    if (status && status !== "all") {
      filter.status = status;
    }

    const users = await User.find(filter).select("-password");

    return res.status(200).json({
      users,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Approve user
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.role === "SuperAdmin") {
      return res.status(400).json({
        message: "Cannot modify SuperAdmin user",
        success: false,
      });
    }

    user.status = "approved";
    await user.save();

    return res.status(200).json({
      message: "User approved successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Reject user
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (user.role === "SuperAdmin") {
      return res.status(400).json({
        message: "Cannot modify SuperAdmin user",
        success: false,
      });
    }

    user.status = "rejected";
    await user.save();

    return res.status(200).json({
      message: "User rejected successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $match: { role: { $ne: "SuperAdmin" } },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const roleStats = await User.aggregate([
      {
        $match: { role: { $ne: "SuperAdmin" } },
      },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      statusStats: stats,
      roleStats: roleStats,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
