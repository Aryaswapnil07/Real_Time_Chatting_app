import { io } from "socket.io-client";
import { tokenStore } from "../api/http";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export const socket = io(
  SOCKET_URL,
  {
    autoConnect: false,
    withCredentials: true,
  }
);

let activeUserId = null;

socket.on("connect", () => {
  if (activeUserId) {
    socket.emit("userConnected", activeUserId);
  }
});

export const connectSocket = (userId) => {
  if (!userId) {
    return;
  }

  activeUserId = userId;
  const accessToken = tokenStore.getAccessToken();
  socket.auth = accessToken ? { token: accessToken } : {};

  if (!socket.connected) {
    socket.connect();
    return;
  }

  socket.emit("userConnected", userId);
};

export const disconnectSocket = () => {
  activeUserId = null;

  if (socket.connected) {
    socket.disconnect();
  }
};
