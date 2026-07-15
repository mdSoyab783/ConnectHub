const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const path = require("path");
const errorHandler = require("./middleware/errorMiddleware");
const notificationRoutes = require("./routes/notificationRoutes");
const connectDB = require("./config/db");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Home Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Welcome to ConnectHub API",
    version: "1.0.0"
  });
});

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running successfully!"
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(errorHandler);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
console.log("Uploads Path:", path.join(__dirname, "uploads"));
console.log("__dirname:", __dirname);
console.log("Static uploads:", path.join(__dirname, "uploads"));
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Store online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  socket.on("join", (userId) => {
  if (!userId) return;

  // Associate this socket with the user
  socket.userId = userId;

  onlineUsers.set(userId, socket.id);

  console.log("✅ User Joined:", userId);

  io.emit("onlineUsers", [...onlineUsers.keys()]);
});

  socket.on("disconnect", () => {
  if (socket.userId) {
    onlineUsers.delete(socket.userId);

    console.log("🔴 User Disconnected:", socket.userId);

    io.emit("onlineUsers", [...onlineUsers.keys()]);
  }

    console.log("🔴 User Disconnected");

    io.emit("onlineUsers", [...onlineUsers.keys()]);
  });
});

app.set("io", io);
app.set("onlineUsers", onlineUsers);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});