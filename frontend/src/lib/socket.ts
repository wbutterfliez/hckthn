"use client";

import { io } from "socket.io-client";

let socket: any;

if (typeof window !== "undefined") {
  socket = io("http://127.0.0.1:5000", {
    autoConnect: false,
  });
}

export { socket };