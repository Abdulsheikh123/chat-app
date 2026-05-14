import { Response } from "express";
import { logger } from "../utils/logger.js";
import { sendMessageService, getChatHistoryService, toggleLikeMessageService, toggleSaveMessageService, deleteMessageService, clearChatService, toggleReactionService } from "../services/chat.service.js";

/**
 * Toggle Emoji Reaction
 */
export const toggleReaction = async (req: any, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;
    console.log("Toggle Reaction:", { messageId, userId, emoji });
    const message = await toggleReactionService(messageId, userId, emoji);
    res.status(200).json({ success: true, data: message });
  } catch (error: any) {
    console.error("Error in toggleReaction:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Send Message Controller
 */
export const sendMessage = async (req: any, res: Response) => {
  try {
    const { receiverId, content, fileType } = req.body;
    const senderId = req.user.id;

    console.log("Send Message Request:", { receiverId, content, fileType, senderId });
    console.log("File received:", req.file ? {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : "No file");

    let fileUrl = null;
    let fileName = null;
    let fileSize = null;

    if (req.file) {
      fileUrl = `/uploads/chat/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
    }

    // Call Service
    const message = await sendMessageService({
      senderId,
      receiverId,
      content,
      fileUrl,
      fileType: fileType || (req.file ? "IMAGE" : "TEXT"),
      fileName,
      fileSize
    });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message
    });

  } catch (error: any) {
    logger.error(`Error sending message: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send message"
    });
  }
};

/**
 * Get Chat History Controller
 */
export const getChatHistory = async (req: any, res: Response) => {
  try {
    const { userId } = req.params; // The other person's ID
    const currentUserId = req.user.id;

    // Call Service
    const messages = await getChatHistoryService(currentUserId, userId);

    return res.status(200).json({
      success: true,
      data: messages
    });

  } catch (error: any) {
    logger.error(`Error fetching chat history: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch messages"
    });
  }
};

/**
 * Toggle Like Message
 */
export const toggleLikeMessage = async (req: any, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    console.log("Toggle Like Message:", { messageId, userId });
    const message = await toggleLikeMessageService(messageId, userId);
    res.status(200).json({ success: true, data: message });
  } catch (error: any) {
    console.error("Error in toggleLikeMessage:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Toggle Save Message
 */
export const toggleSaveMessage = async (req: any, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    console.log("Toggle Save Message:", { messageId, userId });
    const message = await toggleSaveMessageService(messageId, userId);
    res.status(200).json({ success: true, data: message });
  } catch (error: any) {
    console.error("Error in toggleSaveMessage:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete Message
 */
export const deleteMessage = async (req: any, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    await deleteMessageService(messageId, userId);
    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Clear Chat Controller
 */
export const clearChat = async (req: any, res: Response) => {
  try {
    const { userId } = req.params; // Target user
    const currentUserId = req.user.id;
    console.log("Clear Chat Request:", { currentUserId, targetUserId: userId });
    
    const result = await clearChatService(currentUserId, userId);
    console.log("Clear Chat Result:", result);
    
    res.status(200).json({ success: true, message: "Chat cleared successfully" });
  } catch (error: any) {
    console.error("Error in clearChat controller:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
