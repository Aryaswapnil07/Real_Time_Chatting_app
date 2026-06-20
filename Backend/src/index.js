import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});

import connectDB from "./db/index.js";
import { app } from "./app.js";

import http from "http";
import { Server } from "socket.io";

import { initSocket } from "./socket/socket.js";
import socketHandler from "./socket/socketHandler.js";

// Create HTTP Server
const server = http.createServer(app);

// Create Socket.io Server
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

// Initialize Socket
initSocket(io);

// Attach Socket Events
socketHandler(io);

// Connect DB and Start Server
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