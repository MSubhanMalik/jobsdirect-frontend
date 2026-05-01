import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/config/environment";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket) return socket;

  socket = io(API_BASE_URL || window.location.origin, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("[Socket] Disconnected");
  });

  return socket;
}

export function joinRoom(roomId: string) {
  getSocket().emit("joinRoom", roomId);
}

export function joinNotificationRoom(userId: string) {
  getSocket().emit("joinNotificationRoom", userId);
}

export function sendMessage(roomId: string, senderId: string, message: string) {
  getSocket().emit("sendMessage", { roomId, senderId, message });
}

export function emitTyping(roomId: string, userId: string, isTyping: boolean) {
  getSocket().emit("typing", { roomId, userId, isTyping });
}

export function onReceiveMessage(callback: (data: any) => void) {
  getSocket().on("receiveMessage", callback);
  return () => { getSocket().off("receiveMessage", callback); };
}

export function onUserTyping(callback: (data: any) => void) {
  getSocket().on("userTyping", callback);
  return () => { getSocket().off("userTyping", callback); };
}
