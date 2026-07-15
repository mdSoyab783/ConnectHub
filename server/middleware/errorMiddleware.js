const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Multer Errors
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "Image size cannot exceed 10 MB.",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    return res.status(404).json({
      success: false,
      message: "Resource not found.",
    });
  }

  // Mongoose Validation Errors
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);

    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;