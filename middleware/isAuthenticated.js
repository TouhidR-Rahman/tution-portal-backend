import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  try {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    if (!token) {
      return res.status(401).json({
        message:
          "No token provided. Please provide token in cookie or Authorization header",
        success: false,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
        error: err.message,
      });
    }

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token", success: false });
    }

    req.id = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Authentication error",
      success: false,
      error: error.message,
    });
  }
};

export default authenticateToken;
