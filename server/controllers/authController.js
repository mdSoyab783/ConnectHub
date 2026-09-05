const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ===============================
// REGISTER USER
// ===============================
exports.registerUser = async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      password,
    } = req.body;

    // ===============================
    // BASIC VALIDATION
    // ===============================

    if (
      !fullName ||
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Remove unnecessary spaces
    const cleanFullName = fullName.trim();
    const normalizedUsername =
      username.trim().toLowerCase();
    const normalizedEmail =
      email.trim().toLowerCase();

    // ===============================
    // FULL NAME VALIDATION
    // ===============================

    if (cleanFullName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Full name must be at least 2 characters",
      });
    }

    // ===============================
    // USERNAME VALIDATION
    // ===============================

    if (
      normalizedUsername.length < 3 ||
      normalizedUsername.length > 20
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Username must be between 3 and 20 characters",
      });
    }

    // Only letters, numbers and underscore
    const usernameRegex =
      /^[a-zA-Z0-9_]+$/;

    if (!usernameRegex.test(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message:
          "Username can only contain letters, numbers and underscore",
      });
    }

    // ===============================
    // EMAIL VALIDATION
    // ===============================

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // ===============================
    // PASSWORD VALIDATION
    // ===============================

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    // ===============================
    // CHECK USERNAME
    // ===============================

    const existingUsername =
      await User.findOne({
        username: normalizedUsername,
      });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    // ===============================
    // CHECK EMAIL
    // ===============================

    const existingEmail =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // ===============================
    // HASH PASSWORD
    // ===============================

    const hashedPassword =
      await bcrypt.hash(password, 10);

    // ===============================
    // CREATE USER
    // ===============================

    const user = await User.create({
      fullName: cleanFullName,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    // ===============================
    // CREATE JWT
    // ===============================

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // ===============================
    // RESPONSE
    // ===============================

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        bio: user.bio,
      },
    });

  } catch (error) {
    console.log(
      "Registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ===============================
// LOGIN USER
// ===============================
exports.loginUser = async (req, res) => {
  try {
    const {
      identifier,
      password,
    } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email/username and password are required",
      });
    }

    const normalizedIdentifier =
      identifier.trim().toLowerCase();

    // Find user by email OR username
    const user = await User.findOne({
      $or: [
        {
          email: normalizedIdentifier,
        },
        {
          username: normalizedIdentifier,
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email/username or password",
      });
    }

    // Check password
    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email/username or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        bio: user.bio,
      },
    });

  } catch (error) {
    console.log(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};