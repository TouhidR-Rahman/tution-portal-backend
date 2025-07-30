import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import tutionCenterRoute from "./routes/tutionCenter.route.js";
import applicationRoute from "./routes/application.route.js";
import tutorOpportunityRoutes from "./routes/tutorOpportunity.route.js";
import ratingRoute from "./routes/rating.route.js";
import superAdminRoute from "./routes/superadmin.route.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config({});
const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://your-frontend-domain.vercel.app", // Add your actual frontend domain
    /\.vercel\.app$/, // Allow any vercel.app subdomain for testing
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 5011;

//api's

app.use("/api/user", userRoute);
app.use("/api/tution-center", tutionCenterRoute);
app.use("/api/application", applicationRoute);
app.use("/api/tutor-opportunity", tutorOpportunityRoutes);
app.use("/api/v1/rating", ratingRoute);
app.use("/api/superadmin", superAdminRoute);

app.get("/", async (req, res) => {
  try {
    // Ensure database connection is attempted
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    const dbStatus = mongoose.connection.readyState;
    const dbStatusText = {
      0: "Disconnected",
      1: "Connected",
      2: "Connecting",
      3: "Disconnecting",
    };

    const isConnected = dbStatus === 1;

    res.json({
      message: "Welcome to the Tution Portal API",
      database: {
        status: dbStatusText[dbStatus] || "Unknown",
        connected: isConnected,
        mongoUri: process.env.MONGO_URI ? "Set" : "Not Set",
      },
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Welcome to the Tution Portal API",
      database: {
        status: "Connection Error",
        connected: false,
        error: error.message,
        mongoUri: process.env.MONGO_URI ? "Set" : "Not Set",
      },
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    });
  }
});

// Debug route to check authentication
app.get("/api/debug/auth", (req, res) => {
  const cookieToken = req.cookies.token;
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

  res.json({
    cookies: {
      token: cookieToken ? "Present" : "Missing",
      allCookies: Object.keys(req.cookies),
    },
    headers: {
      authorization: authHeader ? "Present" : "Missing",
      bearerToken: bearerToken ? "Present" : "Missing",
      origin: req.headers.origin,
      userAgent: req.headers["user-agent"],
    },
    jwtSecret: process.env.JWT_SECRET ? "Set" : "Not Set",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(
        `Database connection status: ${
          mongoose.connection.readyState === 1 ? "Connected" : "Not Connected"
        }`
      );
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    // Still start the server even if DB connection fails
    app.listen(PORT, () => {
      console.log(
        `Server is running on port ${PORT} (without database connection)`
      );
    });
  }
};

startServer();
