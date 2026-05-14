import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        name: "Test Friend",
        email: "testfriend@gmail.com",
        number: "1234567890",
        password: hashedPassword,
        profileImage: null
      }
    });
    console.log("Created test user:", user.name);
    process.exit(0);
  } catch (error) {
    console.error("Error creating test user:", error);
    process.exit(1);
  }
}

createTestUser();
