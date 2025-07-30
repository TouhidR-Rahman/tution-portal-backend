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
  origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
  credentials: true,
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

app.get("/", (req, res) => {
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
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
