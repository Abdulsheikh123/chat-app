import { Router } from "express";
import { sendMessage, getChatHistory, toggleLikeMessage, toggleSaveMessage, deleteMessage, clearChat, toggleReaction } from "../controllers/chat.controller.js";
import { protectAuth } from "../middlewares/auth.middleware.js";
import { chatUpload } from "../middlewares/chatUpload.middleware.js";

const router = Router();

// Send message (can include file)
router.post("/send", protectAuth, chatUpload.single("file"), sendMessage);

// Get messages with a specific user
router.get("/history/:userId", protectAuth, getChatHistory);

// Message interactions
router.patch("/:messageId/like", protectAuth, toggleLikeMessage);
router.patch("/:messageId/save", protectAuth, toggleSaveMessage);
router.patch("/:messageId/react", protectAuth, toggleReaction);
router.delete("/:messageId", protectAuth, deleteMessage);
router.delete("/clear/:userId", protectAuth, clearChat);

export default router;
