import prisma from "../config/prisma.js";

/**
 * Send Message Service
 */
export const sendMessageService = async (data: {
  senderId: string;
  receiverId: string;
  content?: string;
  fileUrl?: string | null;
  fileType: string;
  fileName?: string | null;
  fileSize?: number | null;
}) => {
  const message = await prisma.message.create({
    data: {
      content: data.content,
      fileUrl: data.fileUrl,
      fileType: data.fileType as any,
      fileName: data.fileName,
      fileSize: data.fileSize,
      senderId: data.senderId,
      receiverId: data.receiverId,
    },
    include: {
      sender: {
        select: { name: true, profileImage: true }
      }
    }
  });

  return message;
};

/**
 * Get Chat History Service
 */
export const getChatHistoryService = async (senderId: string, receiverId: string) => {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return messages;
};

/**
 * Toggle Like Message
 */
export const toggleLikeMessageService = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error("Message not found");

  const isLiked = message.likedBy.includes(userId);
  const newLikedBy = isLiked 
    ? message.likedBy.filter(id => id !== userId)
    : [...message.likedBy, userId];

  return await prisma.message.update({
    where: { id: messageId },
    data: { likedBy: newLikedBy }
  });
};

/**
 * Toggle Save Message
 */
export const toggleSaveMessageService = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error("Message not found");

  const isSaved = message.savedBy.includes(userId);
  const newSavedBy = isSaved 
    ? message.savedBy.filter(id => id !== userId)
    : [...message.savedBy, userId];

  return await prisma.message.update({
    where: { id: messageId },
    data: { savedBy: newSavedBy }
  });
};

/**
 * Delete Message (Both sides)
 */
export const deleteMessageService = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error("Message not found");

  // Only sender can delete for everyone (both sides)
  if (message.senderId !== userId) {
    throw new Error("Only the sender can delete this message for both sides");
  }

  return await prisma.message.delete({ where: { id: messageId } });
};

/**
 * Clear Chat Service (Both sides)
 */
export const clearChatService = async (userId: string, targetId: string) => {
  return await prisma.message.deleteMany({
    where: {
      OR: [
        { senderId: userId, receiverId: targetId },
        { senderId: targetId, receiverId: userId }
      ]
    }
  });
};
/**
 * Toggle Emoji Reaction
 */
export const toggleReactionService = async (messageId: string, userId: string, emoji: string) => {
  const message = await prisma.message.findUnique({ where: { id: messageId } });
  if (!message) throw new Error("Message not found");

  // @ts-ignore
  let reactions = message.reactions as any[] || [];
  
  // Check if user already reacted with this exact emoji
  const existingIndex = reactions.findIndex(r => r.userId === userId && r.emoji === emoji);

  if (existingIndex > -1) {
    // Remove if same emoji
    reactions = reactions.filter((_, i) => i !== existingIndex);
  } else {
    // Remove any previous reaction from this user and add new one
    reactions = reactions.filter(r => r.userId !== userId);
    reactions.push({ userId, emoji });
  }

  return await prisma.message.update({
    where: { id: messageId },
    data: { reactions } as any
  });
};
