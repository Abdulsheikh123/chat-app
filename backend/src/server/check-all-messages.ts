import prisma from "../config/prisma.js";

async function checkAllMessages() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    console.log("Last 10 messages:", JSON.stringify(messages, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error fetching messages:", error);
    process.exit(1);
  }
}

checkAllMessages();
