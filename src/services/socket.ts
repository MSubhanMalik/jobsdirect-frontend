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

export function joinRoom(room_id: string) {
  getSocket().emit("joinRoom", room_id);
}

export function joinNotificationRoom(user_id: string) {
  getSocket().emit("joinNotificationRoom", user_id);
}

export function sendMessage(room_id: string, sender_id: string, message: string) {
  getSocket().emit("sendMessage", { room_id, sender_id, message });
}

export function emitTyping(room_id: string, user_id: string, is_typing: boolean) {
  getSocket().emit("typing", { room_id, user_id, is_typing });
}

export function onReceiveMessage(callback: (data: any) => void) {
  getSocket().on("receiveMessage", callback);
  return () => { getSocket().off("receiveMessage", callback); };
}

export function onUserTyping(callback: (data: any) => void) {
  getSocket().on("userTyping", callback);
  return () => { getSocket().off("userTyping", callback); };
}
