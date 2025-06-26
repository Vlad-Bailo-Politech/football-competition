import { io } from "socket.io-client";

// Підключення до Socket.IO сервера
// URL потрібно замінити адресу бекенду при деплої
export const socket = io("http://localhost:5000");
