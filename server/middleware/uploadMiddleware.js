const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.baseUrl.includes("users")) {
      if (req.path.includes("profile-image")) {
        cb(null, "uploads/profile");
      } else if (req.path.includes("cover-image")) {
        cb(null, "uploads/cover");
      } else {
        cb(null, "uploads/profile");
      }
    } else {
      cb(null, "uploads/posts");
    }
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// Allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
  fileSize: 10 * 1024 * 1024, // 10 MB
 },
});

module.exports = upload;