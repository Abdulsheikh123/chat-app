import prisma from "../config/prisma.js";

async function checkMessages() {
  try {
    const messages = await prisma.message.findMany({
      where: {
        fileUrl: { not: null }
      }
    });
    console.log("Messages with files count:", messages.length);
    console.log("Messages with files:", JSON.stringify(messages, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error fetching messages:", error);
    process.exit(1);
  }
}

checkMessages();
