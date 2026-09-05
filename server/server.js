const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Middleware
const errorHandler = require("./middleware/errorMiddleware");

// Database
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect Database
connectDB();

const app = express();

// ==============================
// Middleware
// ==============================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

// ==============================
// Routes
// ==============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Welcome to ConnectHub API",
    version: "1.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running successfully!",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Static Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

console.log("Uploads Path:", path.join(__dirname, "uploads"));

// Error Handler
app.use(errorHandler);

// ==============================
// HTTP + SOCKET SERVER
// ==============================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Store Online Users
const onlineUsers = new Map();

io.on("connection", (socket) => {

  console.log("🟢 User Connected:", socket.id);

  // ==========================
  // USER ONLINE
  // ==========================

  socket.on("join", (userId) => {

    if (!userId) return;

    socket.userId = userId;

    onlineUsers.set(userId, socket.id);

    console.log("✅ User Joined:", userId);

    io.emit("onlineUsers", [...onlineUsers.keys()]);
  });

  // ==========================
  // CHAT EVENTS
  // ==========================

  socket.on("joinConversation", (conversationId) => {

    if (!conversationId) return;

    socket.join(conversationId);

    console.log(
      `💬 ${socket.id} joined conversation ${conversationId}`
    );
  });

  socket.on("leaveConversation", (conversationId) => {

    socket.leave(conversationId);

    console.log(
      `🚪 ${socket.id} left conversation ${conversationId}`
    );
  });

  socket.on("sendMessage", (message) => {

    socket.to(message.conversation).emit(
      "receiveMessage",
      message
    );

    console.log(
      `📩 Message sent to room ${message.conversation}`
    );
  });
// ==========================
// TYPING
// ==========================

socket.on("typing", ({ conversationId, user }) => {

  socket.to(conversationId).emit(
    "userTyping",
    user
  );

});

socket.on("stopTyping", ({ conversationId }) => {

  socket.to(conversationId).emit(
    "userStoppedTyping"
  );

});
  // ==========================
  // DISCONNECT
  // ==========================

  socket.on("disconnect", () => {

    if (socket.userId) {

      onlineUsers.delete(socket.userId);

      console.log("🔴 User Disconnected:", socket.userId);

      io.emit("onlineUsers", [...onlineUsers.keys()]);
    }

    console.log("❌ Socket Closed:", socket.id);
  });

});

// Make available inside controllers
app.set("io", io);
app.set("onlineUsers", onlineUsers);

// ==============================
// START SERVER
// ==============================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});