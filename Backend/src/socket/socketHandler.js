import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const activeUserSockets = new Map();

const parseCookies = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((cookies, cookie) => {
    const [rawName, ...rawValue] = cookie.trim().split("=");

    if (!rawName) {
      return cookies;
    }

    cookies[rawName] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});

const getSocketToken = (socket) => {
  const authToken = socket.handshake.auth?.token;

  if (authToken) {
    return authToken;
  }

  return parseCookies(socket.handshake.headers.cookie).accessToken;
};

const removeSocketForUser = (userId, socketId) => {
  const sockets = activeUserSockets.get(userId);

  if (!sockets) {
    return 0;
  }

  sockets.delete(socketId);

  if (!sockets.size) {
    activeUserSockets.delete(userId);
    return 0;
  }

  return sockets.size;
};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("userConnected", async (userId) => {
      try {
        const token = getSocketToken(socket);

        if (!token) {
          throw new Error("Socket authentication is required");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (decodedToken?._id !== userId) {
          throw new Error("Socket user does not match authenticated user");
        }

        const user = await User.findById(userId).select("_id");

        if (!user) {
          throw new Error("Socket user not found");
        }

        if (socket.userId && socket.userId !== userId) {
          removeSocketForUser(socket.userId, socket.id);
          socket.leave(socket.userId);
        }

        const userSockets = activeUserSockets.get(userId) || new Set();
        const wasOffline = userSockets.size === 0;
        userSockets.add(socket.id);
        activeUserSockets.set(userId, userSockets);

        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          socketId: socket.id,
        });

        socket.userId = userId;
        socket.join(userId);

        if (wasOffline) {
          socket.broadcast.emit("userPresenceChanged", {
            userId,
            isOnline: true,
            lastSeen: null,
          });
        }

        console.log(`User ${userId} is online`);
      } catch (error) {
        console.log("Socket Error:", error.message);
        socket.disconnect(true);
      }
    });

    socket.on("disconnect", async () => {
      try {
        if (socket.userId) {
          const remainingSockets = removeSocketForUser(socket.userId, socket.id);

          if (remainingSockets > 0) {
            const socketIds = [...activeUserSockets.get(socket.userId)];

            await User.findByIdAndUpdate(socket.userId, {
              socketId: socketIds[socketIds.length - 1],
            });
            return;
          }

          const lastSeen = new Date();

          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            socketId: null,
            lastSeen,
          });

          socket.broadcast.emit("userPresenceChanged", {
            userId: socket.userId,
            isOnline: false,
            lastSeen,
          });

          console.log(`User ${socket.userId} offline`);
        }
      } catch (error) {
        console.log("Socket Error:", error.message);
      }

      console.log("Socket disconnected:", socket.id);
    });
  });
};

export default socketHandler;
