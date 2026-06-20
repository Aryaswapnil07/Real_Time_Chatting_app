import { User } from "../models/user.models.js";

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Socket Connected:", socket.id);

    socket.on("userConnected", async (userId) => {
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          socketId: socket.id,
        });

        socket.userId = userId;

        // Join personal room
        socket.join(userId);

        console.log(`✅ User ${userId} is online`);
        console.log(`🏠 User ${userId} joined personal room`);
      } catch (error) {
        console.log("Socket Error:", error.message);
      }
    });

    socket.on("disconnect", async () => {
      try {
        if (socket.userId) {
          await User.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            socketId: null,
            lastSeen: new Date(),
          });

          console.log(`🔴 User ${socket.userId} offline`);
        }
      } catch (error) {
        console.log("Socket Error:", error.message);
      }

      console.log("Socket disconnected:", socket.id);
    });
  });
};

export default socketHandler;
