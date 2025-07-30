const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error
  let error = {
    message: err.message || "Server Error",
    statusCode: err.statusCode || 500,
  };

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error.message = "Resource not found";
    error.statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `${field} already exists`;
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    error.message = Object.values(err.errors).map(val => val.message);
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token";
    error.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Token expired";
    error.statusCode = 401;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};

export default errorHandler;
