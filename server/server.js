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
// CORS
// ==============================

const allowedOrigins = [
  "http://localhost:5173",
  "https://connect-hub-one-sigma.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// ==============================
// Middleware
// ==============================

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

// ==============================
// Static Uploads
// ==============================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

console.log(
  "Uploads Path:",
  path.join(__dirname, "uploads")
);

// ==============================
// Error Handler
// ==============================

app.use(errorHandler);

// ==============================
// HTTP SERVER
// ==============================

const server = http.createServer(app);

// ==============================
// SOCKET.IO
// ==============================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// ==============================
// Store Online Users
// ==============================

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

    io.emit(
      "onlineUsers",
      [...onlineUsers.keys()]
    );
  });

  // ==========================
  // JOIN CONVERSATION
  // ==========================

  socket.on(
    "joinConversation",
    (conversationId) => {

      if (!conversationId) return;

      socket.join(conversationId);

      console.log(
        `💬 ${socket.id} joined conversation ${conversationId}`
      );
    }
  );

  // ==========================
  // LEAVE CONVERSATION
  // ==========================

  socket.on(
    "leaveConversation",
    (conversationId) => {

      if (!conversationId) return;

      socket.leave(conversationId);

      console.log(
        `🚪 ${socket.id} left conversation ${conversationId}`
      );
    }
  );

  // ==========================
  // SEND MESSAGE
  // ==========================

  socket.on("sendMessage", (message) => {

    if (!message?.conversation) return;

    socket
      .to(message.conversation)
      .emit(
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

  socket.on(
    "typing",
    ({ conversationId, user }) => {

      if (!conversationId) return;

      socket
        .to(conversationId)
        .emit(
          "userTyping",
          user
        );
    }
  );

  // ==========================
  // STOP TYPING
  // ==========================

  socket.on(
    "stopTyping",
    ({ conversationId }) => {

      if (!conversationId) return;

      socket
        .to(conversationId)
        .emit(
          "userStoppedTyping"
        );
    }
  );

  // ==========================
  // DISCONNECT
  // ==========================

  socket.on("disconnect", () => {

    if (socket.userId) {

      onlineUsers.delete(
        socket.userId
      );

      console.log(
        "🔴 User Disconnected:",
        socket.userId
      );

      io.emit(
        "onlineUsers",
        [...onlineUsers.keys()]
      );
    }

    console.log(
      "❌ Socket Closed:",
      socket.id
    );
  });

});

// ==============================
// Make available inside controllers
// ==============================

app.set("io", io);

app.set(
  "onlineUsers",
  onlineUsers
);

// ==============================
// START SERVER
// ==============================

const PORT =
  process.env.PORT || 5000;

server.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `🚀 Server running on port ${PORT}`
    );
  }
);