import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import helmet from "helmet";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import authRoutes from '../routes/auth.routes.js';
import otpRoutes from "../routes/otp.routes.js";
import chatRoutes from "../routes/chat.routes.js";
import aiRoutes from "../routes/ai.routes.js";
import paymentRoutes from "../routes/payment.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use("/uploads/profiles", express.static(path.join(process.cwd(), "uploads/profiles")));
app.use("/uploads/chat", express.static(path.join(process.cwd(), "uploads/chat")));

app.use('/api/auth', authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payment", paymentRoutes);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined room ${userId}`);
  });

  socket.on("send_message", (data) => {
    if (data.receiverId) {
      socket.to(data.receiverId).emit("receive_message", data);
    }
  });

  socket.on("update_message", (data) => {
    // data should contain the full updated message and the receiverId
    if (data.receiverId) {
      socket.to(data.receiverId).emit("message_updated", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

export { app, server, io };
