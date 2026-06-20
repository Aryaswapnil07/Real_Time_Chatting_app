import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import connectDB from "./db/index.js";
import { app } from "./app.js";

import http from "http";
import { Server } from "socket.io";

// Create HTTP Server
const server = http.createServer(app);

// Attach Socket.io
export const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

// Socket Connection
io.on("connection", (socket) => {
  console.log("🟢 User Connected :", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 User Disconnected :", socket.id);
  });
});

// Connect Database and Start Server
connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(
        `⚙️ Server is running at port : ${process.env.PORT || 8000}`
      );
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed :", err);
  });