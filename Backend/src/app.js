import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./utils/corsOptions.js"; //after commit

// Route Imports
import userRouter from "./routes/user.routes.js";
import friendRouter from "./routes/friend.routes.js";
import conversationRouter from "./routes/conversation.routes.js";
import messageRouter from "./routes/message.routes.js";
import notificationRouter from "./routes/notification.routes.js";

const app = express();

// CORS Configuration
app.use(cors(corsOptions));

// Middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Health Check Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Real Time Chat API is running 🚀",
  });
});

// API Routes

app.use("/api/v1/users", userRouter);

app.use("/api/v1/friends", friendRouter);

app.use("/api/v1/conversations", conversationRouter);

app.use("/api/v1/messages", messageRouter);

app.use("/api/v1/notifications", notificationRouter);

// after commit
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    statusCode,
    data: err.data || null,
    message: err.message || "Internal Server Error",
    success: false,
    errors: err.errors || [],
  });
});

export { app };
